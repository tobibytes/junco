import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "../lib/icons";

export const statVariants = tv({
  slots: {
    root: "grid min-w-0 content-start gap-1",
    label: "truncate text-sm text-muted-foreground",
    value: "text-2xl leading-8 font-semibold tracking-tight tabular-nums text-foreground",
    footer: "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs",
    delta: "inline-flex items-center gap-1 font-medium tabular-nums [&_svg]:size-3.5",
    deltaLabel: "text-muted-foreground",
    chart: "mt-2 h-10 w-full text-primary",
  },
  variants: {
    trend: {
      up: { delta: "text-success-text" },
      down: { delta: "text-destructive-text" },
      flat: { delta: "text-muted-foreground" },
    },
    size: {
      sm: { value: "text-xl leading-7" },
      md: {},
      lg: { value: "text-3xl leading-9" },
    },
  },
  defaultVariants: { trend: "flat", size: "md" },
});

export type StatTrend = "up" | "down" | "flat";

export interface StatProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    Pick<VariantProps<typeof statVariants>, "size"> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Change vs the comparison period, as a number (12.5 means +12.5%) or preformatted text. */
  delta?: number | string;
  /** Direction of the change. Inferred from a numeric delta when omitted. */
  trend?: StatTrend;
  /**
   * When a rise is bad (costs, error rate, churn), set this so "up" reads as the warning color.
   * The icon and sign still show the real direction.
   */
  isInverse?: boolean;
  /** Text after the delta, e.g. "vs last month". */
  deltaLabel?: React.ReactNode;
  /** A small chart (sparkline) under the numbers. Colored with currentColor (primary by default). */
  chart?: React.ReactNode;
  classNames?: Partial<Record<"root" | "label" | "value" | "footer" | "delta" | "deltaLabel" | "chart", string>>;
}

function formatDelta(delta: number | string): string {
  if (typeof delta === "string") return delta;
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${Math.abs(delta).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

const trendWords: Record<StatTrend, string> = { up: "Up", down: "Down", flat: "No change" };

const StatGroupContext = React.createContext(false);

/**
 * A single number with its label and change. Direction is shown by icon, sign and screen reader
 * text, never by color alone.
 */
export const Stat = React.forwardRef<HTMLElement, StatProps>(
  ({ className, classNames, size, label, value, delta, trend, isInverse = false, deltaLabel, chart, ...props }, ref) => {
    const direction: StatTrend =
      trend ?? (typeof delta === "number" ? (delta > 0 ? "up" : delta < 0 ? "down" : "flat") : "flat");
    const tone: StatTrend = isInverse && direction !== "flat" ? (direction === "up" ? "down" : "up") : direction;
    const styles = statVariants({ trend: tone, size });
    const Icon = direction === "up" ? TrendingUpIcon : direction === "down" ? TrendingDownIcon : MinusIcon;
    // dt/dd need a <dl>: inside a StatGroup the group is the list, alone the stat is its own list.
    const Root = (React.useContext(StatGroupContext) ? "div" : "dl") as "div";

    return (
      <Root
        ref={ref as React.Ref<HTMLDivElement>}
        data-slot="stat"
        className={styles.root({ className: cn(classNames?.root, className) })}
        {...props}
      >
        <dt className={styles.label({ className: classNames?.label })}>{label}</dt>
        <dd className={styles.value({ className: classNames?.value })}>{value}</dd>
        {delta !== undefined && (
          <dd className={styles.footer({ className: classNames?.footer })}>
            <span data-trend={direction} className={styles.delta({ className: classNames?.delta })}>
              <Icon />
              <span className="sr-only">{trendWords[direction]} </span>
              {formatDelta(delta)}
            </span>
            {deltaLabel && <span className={styles.deltaLabel({ className: classNames?.deltaLabel })}>{deltaLabel}</span>}
          </dd>
        )}
        {chart && (
          <dd aria-hidden className={styles.chart({ className: classNames?.chart })}>
            {chart}
          </dd>
        )}
      </Root>
    );
  },
);
Stat.displayName = "Stat";

/**
 * Wraps one or more Stats in a description list so label/value pairs read correctly.
 *
 *   <StatGroup><Stat label="MRR" value="$48.2k" delta={4.1} /></StatGroup>
 */
export const StatGroup = React.forwardRef<HTMLDListElement, React.HTMLAttributes<HTMLDListElement>>(
  ({ className, ...props }, ref) => (
    <StatGroupContext.Provider value={true}>
      <dl
        ref={ref}
        data-slot="stat-group"
        className={cn("grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-6", className)}
        {...props}
      />
    </StatGroupContext.Provider>
  ),
);
StatGroup.displayName = "StatGroup";

export interface SparklineProps extends React.SVGProps<SVGSVGElement> {
  data: number[];
  /** Fill under the line. Default true. */
  isFilled?: boolean;
}

/** A tiny dependency-free line chart for Stat's `chart` slot. Uses currentColor. */
export function Sparkline({ data, isFilled = true, className, ...props }: SparklineProps) {
  // useId can contain characters that break url(#id) references
  const id = `spark-${React.useId().replace(/[^\w-]/g, "")}`;
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => [(i / (data.length - 1)) * 100, 28 - ((d - min) / range) * 26] as const);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden className={cn("size-full overflow-visible", className)} {...props}>
      {isFilled && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.18} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`${line} L100 30 L0 30 Z`} fill={`url(#${id})`} />
        </>
      )}
      <path d={line} fill="none" stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
