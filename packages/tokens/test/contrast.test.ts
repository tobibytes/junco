import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "../src/color.ts";
import { controlPairs, MIN_CONTROL_CONTRAST, MIN_TEXT_CONTRAST, textPairs } from "../src/pairs.ts";
import { parseTokens } from "../src/parse.ts";

const css = readFileSync(new URL("../src/tokens.css", import.meta.url), "utf8");
const { light, dark } = parseTokens(css);
const modes = { light, dark: { ...light, ...dark } };

describe("color math", () => {
  it("matches known WCAG ratios", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 1);
    expect(contrastRatio("oklch(0 0 0)", "oklch(1 0 0)")).toBeCloseTo(21, 1);
    expect(contrastRatio("#777", "#fff")).toBeCloseTo(4.48, 1);
  });
});

describe("tokens", () => {
  it("every light color token has a dark value", () => {
    const colors = Object.keys(light).filter((k) => light[k]!.startsWith("oklch(") || k.startsWith("shadow-"));
    const missing = colors.filter((k) => !(k in dark));
    expect(missing).toEqual([]);
  });

  for (const [mode, values] of Object.entries(modes)) {
    describe(`${mode} mode`, () => {
      it.each(textPairs.map(([fg, bg]) => [fg, bg]))(`%s on %s hits ${MIN_TEXT_CONTRAST}:1`, (fg, bg) => {
        const ratio = contrastRatio(values[fg]!, values[bg]!);
        expect(ratio, `${fg} on ${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      });
      it.each(controlPairs.map(([part, bg]) => [part, bg]))(`%s on %s hits ${MIN_CONTROL_CONTRAST}:1`, (part, bg) => {
        const ratio = contrastRatio(values[part]!, values[bg]!);
        expect(ratio, `${part} on ${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(MIN_CONTROL_CONTRAST);
      });
    });
  }
});

describe("parsers on hostile input", () => {
  it("parseOklch stays fast and strict", async () => {
    const { parseOklch } = await import("../src/color.ts");
    const t = performance.now();
    expect(parseOklch("oklch(0.5 0.1 200" + " ".repeat(50_000))).toBeNull();
    expect(parseOklch("oklch(0.5" + " ".repeat(50_000) + "x)")).toBeNull();
    // Generous bound: linear code takes ~1ms here, the old regex took seconds. Tight wall-clock
    // limits flake on busy CI runners.
    expect(performance.now() - t).toBeLessThan(2000);
    expect(parseOklch("oklch(0.55 0.2 260)")).toEqual({ l: 0.55, c: 0.2, h: 260, alpha: 1 });
    expect(parseOklch("oklch(55% 0.2 260deg / 50%)")).toEqual({ l: 0.55, c: 0.2, h: 260, alpha: 0.5 });
    expect(parseOklch("oklch(0.5 0.1)")).toBeNull();
    expect(parseOklch("oklch(0.5 0.1 200 / 1 / 2)")).toBeNull();
  });

  it("parseTokens strips comments in linear time, including unclosed ones", () => {
    const t = performance.now();
    parseTokens("/*" + "a/*".repeat(100_000));
    expect(performance.now() - t).toBeLessThan(2000);
    expect(parseTokens(":root { /* a */ --x: 1; /* b */ }").light).toEqual({ x: "1" });
  });
});

describe("parseTokens scanner", () => {
  it("parses the real file the same as before", () => {
    expect(Object.keys(light).length).toBeGreaterThan(70);
    expect(light["primary"]).toMatch(/^oklch\(/);
    expect(dark["primary"]).toMatch(/^oklch\(/);
    expect(light["font-sans"]).toBe('"Geist", ui-sans-serif, system-ui, sans-serif');
    expect(light["motion-scale"]).toBe("1"); // the @media override must not leak in
  });

  it("stays linear on hostile declarations and selectors", () => {
    const t = performance.now();
    parseTokens(":root {" + "--".repeat(50_000) + "}");
    parseTokens(":root { ---:" + " ".repeat(100_000) + "}");
    parseTokens(" ".repeat(100_000) + "{}" + "}".repeat(10_000));
    expect(performance.now() - t).toBeLessThan(2000);
  });
});
