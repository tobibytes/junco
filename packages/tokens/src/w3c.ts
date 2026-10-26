import { parseOklch } from "./color.ts";
import type { ParsedTokens } from "./parse.ts";

/**
 * Converts parsed tokens to the W3C Design Tokens (DTCG) format.
 * Dark values ride along in `$extensions["dev.junco"].modes.dark` since DTCG has no modes yet.
 */

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Token = { $type: string; $value: Json; $description?: string; $extensions?: Json };
type Group = { [key: string]: Token | Group };

function color(value: string): Json {
  const c = parseOklch(value);
  if (!c) return value;
  return { colorSpace: "oklch", components: [c.l, c.c, c.h], ...(c.alpha < 1 ? { alpha: c.alpha } : {}) };
}

function dimension(value: string): Json {
  const m = /^(-?[\d.]+)(px|rem)?$/.exec(value);
  if (!m) return value;
  return { value: parseFloat(m[1]!), unit: m[2] ?? "px" };
}

function duration(value: string): Json {
  const m = /^([\d.]+)(ms|s)$/.exec(value)!;
  return { value: parseFloat(m[1]!), unit: m[2]! };
}

function cubicBezier(value: string): Json {
  return /cubic-bezier\(([^)]+)\)/.exec(value)![1]!.split(",").map((n) => parseFloat(n));
}

function fontFamily(value: string): Json {
  return value.split(",").map((f) => f.trim().replace(/^"|"$/g, ""));
}

function shadow(value: string): Json {
  // split on commas that are not inside parentheses
  return value.split(/,(?![^(]*\))/).map((layer) => {
    const colorStart = layer.indexOf("oklch(");
    const [x, y, blur, spread] = layer.slice(0, colorStart).trim().split(/\s+/);
    return {
      color: color(layer.slice(colorStart).trim()),
      offsetX: dimension(x!),
      offsetY: dimension(y!),
      blur: dimension(blur!),
      spread: dimension(spread ?? "0"),
    };
  });
}

function categorize(name: string, value: string): { group: string; key: string; type: string; convert: (v: string) => Json } {
  if (name.startsWith("font-weight-")) return { group: "fontWeight", key: name.slice(12), type: "fontWeight", convert: Number };
  if (name.startsWith("font-")) return { group: "fontFamily", key: name.slice(5), type: "fontFamily", convert: fontFamily };
  if (name.startsWith("text-")) {
    const key = name.slice(5).replace("--line-height", "-line-height");
    const isDimension = /rem$/.test(value);
    return { group: "fontSize", key, type: isDimension ? "dimension" : "number", convert: (v) => (isDimension ? dimension(v) : Number(v)) };
  }
  if (name.startsWith("tracking-")) return { group: "letterSpacing", key: name.slice(9), type: "dimension", convert: (v) => ({ value: parseFloat(v), unit: "em" }) };
  if (name === "spacing") return { group: "spacing", key: "unit", type: "dimension", convert: dimension };
  if (name.startsWith("radius")) return { group: "radius", key: name.slice(7) || "default", type: "dimension", convert: dimension };
  if (name.startsWith("shadow-")) return { group: "shadow", key: name.slice(7), type: "shadow", convert: shadow };
  if (name.startsWith("z-")) return { group: "zIndex", key: name.slice(2), type: "number", convert: Number };
  if (name.startsWith("duration-") || name === "stagger") return { group: "duration", key: name.replace("duration-", ""), type: "duration", convert: duration };
  if (name.startsWith("ease-")) return { group: "easing", key: name.slice(5), type: "cubicBezier", convert: cubicBezier };
  if (name === "motion-scale") return { group: "motion", key: "scale", type: "number", convert: Number };
  return { group: "color", key: name, type: "color", convert: color };
}

export function toW3C(tokens: ParsedTokens): Group {
  const root: Group = {};
  for (const [name, value] of Object.entries(tokens.light)) {
    const cat = categorize(name, value);
    root[cat.group] ??= {};
    const group = root[cat.group] as Group;
    const token: Token = { $type: cat.type, $value: cat.convert(value) };
    const dark = tokens.dark[name];
    if (dark !== undefined && dark !== value) {
      token.$extensions = { "dev.junco": { cssVariable: `--${name}`, modes: { dark: cat.convert(dark) } } };
    } else {
      token.$extensions = { "dev.junco": { cssVariable: `--${name}` } };
    }
    group[cat.key] = token;
  }
  return root;
}
