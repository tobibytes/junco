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
