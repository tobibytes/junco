import * as React from "react";
import { cn } from "@junco/react";
import type { ChartPoint } from "./fake-data";

/**
 * Small charts for dashboards. No chart library: SVG/HTML colored with tokens, a hover readout,
 * and a visually hidden data table so screen reader users get every number. For anything bigger,
 * swap in Recharts (see the docs).
 */

export interface ChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  data: ChartPoint[];
  /** Accessible name, e.g. "Revenue, last 30 days". */
  label: string;
  /** Plot height in px. Default 220. */
  height?: number;
  formatValue?: (value: number) => string;
  /** How many x-axis labels to show. Default 5. */
  xTicks?: number;
}

function niceMax(max: number) {
  if (max <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(max));
  const f = max / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const defaultFormat = (v: number) => compact.format(v);

function pickTicks(n: number, count: number) {
  if (n <= count) return Array.from({ length: n }, (_, i) => i);
  return Array.from({ length: count }, (_, i) => Math.round((i * (n - 1)) / (count - 1)));
}

function DataTable({
  data,
  label,
  formatValue,
}: {
  data: ChartPoint[];
  label: string;
  formatValue: (v: number) => string;
}) {
  return (
    <table className="sr-only">
      <caption>{label}</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          <th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={`${d.label}-${i}`}>
            <th scope="row">{d.label}</th>
            <td>{formatValue(d.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function YAxis({ max, formatValue }: { max: number; formatValue: (v: number) => string }) {
  const steps = [1, 0.5, 0];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {steps.map((s) => (
        <div key={s} className="absolute inset-x-0 flex items-center gap-2" style={{ top: `${(1 - s) * 100}%` }}>
          <span className="w-9 -translate-y-1/2 text-right text-[11px] tabular-nums text-muted-foreground">
            {formatValue(max * s)}
          </span>
          <span
            className={cn(
              "h-px flex-1 -translate-y-1/2",
              s === 0 ? "bg-border" : "border-t border-dashed border-border",
            )}
          />
        </div>
      ))}
    </div>
  );
}

function Readout({ point, formatValue, x }: { point: ChartPoint; formatValue: (v: number) => string; x: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-2 z-dropdown -translate-y-full rounded-control border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-float"
      style={{ left: `clamp(0px, calc(${x}% - 2.5rem), calc(100% - 5rem))` }}
    >
      <div className="text-muted-foreground">{point.label}</div>
      <div className="font-medium tabular-nums">{formatValue(point.value)}</div>
    </div>
  );
}

/** A line with a soft fill, for a trend over time. */
export function AreaChart({
  data,
  label,
  height = 220,
  formatValue = defaultFormat,
  xTicks = 5,
  className,
  ...props
}: ChartProps) {
  const id = React.useId().replace(/:/g, "");
  const plotRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const n = data.length;
  const xAt = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
  const yAt = (v: number) => 100 - (v / max) * 100;
  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)},${yAt(d.value).toFixed(2)}`).join(" ");
  const area = n > 0 ? `${line} L${xAt(n - 1)},100 L${xAt(0)},100 Z` : "";

  const onMove = (e: React.PointerEvent) => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || n === 0) return;
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setActive(Math.round(ratio * (n - 1)));
  };
  const point = active !== null ? data[active] : undefined;

  return (
    <figure className={cn("grid gap-2", className)} {...props}>
      <div className="relative pl-11" style={{ height }}>
        <YAxis max={max} formatValue={formatValue} />
        <div
          ref={plotRef}
          aria-hidden
          className="relative h-full text-primary"
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <defs>
              <linearGradient id={`fill-${id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#fill-${id})`} />
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </svg>
          {point && active !== null && (
            <>
              <span className="absolute inset-y-0 w-px bg-border" style={{ left: `${xAt(active)}%` }} />
              <span
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-pill border-2 border-background bg-primary"
                style={{ left: `${xAt(active)}%`, top: `${yAt(point.value)}%` }}
              />
              <Readout point={point} formatValue={formatValue} x={xAt(active)} />
            </>
          )}
        </div>
      </div>
      <div aria-hidden className="relative ml-11 h-4 text-[11px] text-muted-foreground">
        {pickTicks(n, xTicks).map((i, k, all) => (
          <span
            key={i}
            className={cn(
              "absolute whitespace-nowrap",
              k === 0 ? "" : k === all.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
            )}
            style={{ left: `${xAt(i)}%` }}
          >
            {data[i]!.label}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">{label}</figcaption>
      <DataTable data={data} label={label} formatValue={formatValue} />
    </figure>
  );
}

/** Vertical bars, for comparing periods or categories. */
export function BarChart({
  data,
  label,
  height = 220,
  formatValue = defaultFormat,
  xTicks = 12,
  className,
  ...props
}: ChartProps) {
  const [active, setActive] = React.useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const n = data.length;
  const shown = new Set(pickTicks(n, xTicks));
  const point = active !== null ? data[active] : undefined;

  return (
    <figure className={cn("grid gap-2", className)} {...props}>
      <div className="relative pl-11" style={{ height }}>
        <YAxis max={max} formatValue={formatValue} />
        {/* Equal slots with the bar centered inside: a percentage gap between bars grows with the
            bar count (6% x 29 gaps is wider than the chart), and labels assume equal slots. */}
        <div aria-hidden className="relative flex h-full items-end" onPointerLeave={() => setActive(null)}>
          {data.map((d, i) => (
            <div
              key={`${d.label}-${i}`}
              data-slot="bar-slot"
              className="relative flex h-full flex-1 items-end justify-center"
              onPointerEnter={() => setActive(i)}
            >
              <div
                data-slot="bar"
                className={cn(
                  "w-[64%] max-w-12 rounded-t-xs bg-primary transition-opacity duration-fast ease-standard",
                  active !== null && active !== i && "opacity-40",
                )}
                style={{ height: `${(d.value / max) * 100}%` }}
              />
            </div>
          ))}
          {point && active !== null && (
            <Readout point={point} formatValue={formatValue} x={((active + 0.5) / n) * 100} />
          )}
        </div>
      </div>
      <div aria-hidden className="relative ml-11 h-4 text-[11px] text-muted-foreground">
        {data.map((d, i) =>
          shown.has(i) ? (
            <span
              key={`${d.label}-${i}`}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${((i + 0.5) / n) * 100}%` }}
            >
              {d.label}
            </span>
          ) : null,
        )}
      </div>
      <figcaption className="sr-only">{label}</figcaption>
      <DataTable data={data} label={label} formatValue={formatValue} />
    </figure>
  );
}
