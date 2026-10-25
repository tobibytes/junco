import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { parseCssColor, readMotion, readThemeColors, useMotion, useThemeColors } from "../src";

describe("parseCssColor", () => {
  it("reads oklch into linear sRGB", () => {
    const [r, g, b] = parseCssColor("oklch(1 0 0)");
    expect(r).toBeCloseTo(1, 2);
    expect(g).toBeCloseTo(1, 2);
    expect(b).toBeCloseTo(1, 2);
    expect(parseCssColor("oklch(0 0 0)")).toEqual([0, 0, 0]);
  });

  it("reads hex and converts to linear light", () => {
    const [r, g, b] = parseCssColor("#808080");
    expect(r).toBeCloseTo(0.2159, 3);
    expect(g).toBeCloseTo(r);
    expect(b).toBeCloseTo(r);
  });

  it("falls back to mid gray for empty or unreadable values", () => {
    expect(parseCssColor("")).toEqual([0.5, 0.5, 0.5]);
    expect(parseCssColor("not-a-color")).toEqual([0.5, 0.5, 0.5]);
  });
});

describe("readThemeColors", () => {
  it("reads CSS variables from <html>", () => {
    document.documentElement.style.setProperty("--primary", "oklch(0.55 0.2 260)");
    const { "--primary": primary } = readThemeColors(["--primary"]);
    expect(primary.css).toBe("oklch(0.55 0.2 260)");
    expect(primary.rgb[2]).toBeGreaterThan(primary.rgb[0]);
  });

  it("can read from a scoped element", () => {
    const el = document.createElement("div");
    el.style.setProperty("--primary", "#ff0000");
    document.body.append(el);
    expect(readThemeColors(["--primary"], el)["--primary"].rgb).toEqual([1, 0, 0]);
    el.remove();
  });
});

function Probe() {
  const colors = useThemeColors(["--primary"]);
  const { level, scale } = useMotion();
  return (
    <p>
      {colors["--primary"].css}|{level}|{scale}
    </p>
  );
}

describe("live updates", () => {
  it("re-reads colors when the theme changes on <html>", async () => {
    document.documentElement.style.setProperty("--primary", "#111111");
    render(<Probe />);
    expect(screen.getByText(/#111111/)).toBeInTheDocument();
    await act(async () => {
      document.documentElement.style.setProperty("--primary", "#222222");
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(screen.getByText(/#222222/)).toBeInTheDocument();
  });

  it("follows data-motion", async () => {
    render(<Probe />);
    expect(screen.getByText(/\|full\|1/)).toBeInTheDocument();
    await act(async () => {
      document.documentElement.setAttribute("data-motion", "subtle");
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(screen.getByText(/\|subtle\|0.6/)).toBeInTheDocument();
  });
});

describe("readMotion", () => {
  it("reads the nearest data-motion", () => {
    const outer = document.createElement("div");
    outer.setAttribute("data-motion", "off");
    const inner = document.createElement("span");
    outer.append(inner);
    document.body.append(outer);
    expect(readMotion(inner)).toBe("off");
    outer.remove();
  });

  it("lets prefers-reduced-motion win over data-motion='full'", () => {
    document.documentElement.setAttribute("data-motion", "full");
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {} }));
    expect(readMotion()).toBe("off");
  });
});
