import { contrastRatio, MIN_TEXT_CONTRAST, textPairs, tokens } from "@junco/tokens";
import { Badge } from "@junco/react";
import { DataTable } from "./prose";

const light = tokens.light;
const dark = { ...tokens.light, ...tokens.dark };
const colorNames = Object.keys(light).filter((k) => light[k]!.startsWith("oklch("));

function Swatch({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className="size-5 shrink-0 rounded-xs border border-border" style={{ background: value }} />
      <code className="font-mono text-xs whitespace-nowrap">{value}</code>
    </span>
  );
}

export function ColorTokenTable() {
  return (
    <DataTable
      caption="Color tokens"
      head={["Token", "Light", "Dark"]}
      rows={colorNames.map((name) => [
        <code key="n" className="font-mono text-xs">--{name}</code>,
        <Swatch key="l" value={light[name]!} />,
        <Swatch key="d" value={dark[name]!} />,
      ])}
    />
  );
}

function Ratio({ value }: { value: number }) {
  const pass = value >= MIN_TEXT_CONTRAST;
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span className="font-mono text-xs tabular-nums">{value.toFixed(2)}:1</span>
      <Badge variant="outline" color={pass ? "success" : "danger"} className="h-5 px-1.5 text-[11px]">
        {pass ? "AA" : "Fail"}
      </Badge>
    </span>
  );
}

export function ContrastTable() {
  return (
    <DataTable
      caption="Contrast of every text and background pair"
      head={["Text on background", "Light", "Dark"]}
      rows={textPairs.map(([fg, bg]) => [
        <span key="p" className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-6 w-9 shrink-0 place-items-center rounded-xs border border-border text-xs font-medium"
            style={{ background: light[bg], color: light[fg] }}
          >
            Aa
          </span>
          <code className="font-mono text-xs">
            {fg} / {bg}
          </code>
        </span>,
        <Ratio key="l" value={contrastRatio(light[fg]!, light[bg]!)} />,
        <Ratio key="d" value={contrastRatio(dark[fg]!, dark[bg]!)} />,
      ])}
    />
  );
}

const pick = (prefix: string) => Object.entries(light).filter(([k]) => k.startsWith(prefix));

export function TypeScaleTable() {
  const sizes = pick("text-").filter(([k]) => !k.includes("line-height"));
  return (
    <DataTable
      caption="Type scale"
      head={["Token", "Size", "Sample"]}
      rows={sizes.map(([k, v]) => [
        <code key="k" className="font-mono text-xs">--{k}</code>,
        <code key="v" className="font-mono text-xs">{v}</code>,
        <span key="s" className="block truncate text-foreground" style={{ fontSize: v, lineHeight: light[`${k}--line-height`] }}>
          Ship it
        </span>,
      ])}
    />
  );
}

export function ScaleTable({ prefixes, caption }: { prefixes: string[]; caption: string }) {
  const rows = prefixes.flatMap((p) => (p.endsWith("-") ? pick(p) : light[p] ? [[p, light[p]!] as [string, string]] : []));
  return (
    <DataTable
      caption={caption}
      head={["Token", "Value"]}
      rows={rows.map(([k, v]) => [
        <code key="k" className="font-mono text-xs">--{k}</code>,
        <code key="v" className="font-mono text-xs break-all">{v}</code>,
      ])}
    />
  );
}
