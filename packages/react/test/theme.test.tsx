import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider, themeScript, useTheme } from "../src";

function Probe() {
  const { theme, resolvedTheme, setTheme, motion, setMotion } = useTheme();
  return (
    <div>
      <span data-testid="state">{`${theme}/${resolvedTheme}/${motion}`}</span>
      <button type="button" onClick={() => setTheme("dark")}>dark</button>
      <button type="button" onClick={() => setTheme("light")}>light</button>
      <button type="button" onClick={() => setMotion("off")}>motion off</button>
    </div>
  );
}

const html = document.documentElement;

describe("ThemeProvider", () => {
  it("applies the default theme and motion to <html>", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("light/light/full");
    expect(html).not.toHaveClass("dark");
    expect(html.dataset.theme).toBe("light");
    expect(html.dataset.motion).toBe("full");
  });

  it("switches theme and motion, and persists both", async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <Probe />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByText("dark"));
    await userEvent.click(screen.getByText("motion off"));
    expect(html).toHaveClass("dark");
    expect(html.dataset.theme).toBe("dark");
    expect(html.dataset.motion).toBe("off");
    expect(localStorage.getItem("junco-theme")).toBe("dark");
    expect(localStorage.getItem("junco-motion")).toBe("off");
  });

  it("restores a saved choice", () => {
    localStorage.setItem("junco-theme", "dark");
    render(
      <ThemeProvider defaultTheme="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("dark/dark/full");
  });

  it("follows the OS setting in system mode", () => {
    let listener: (() => void) | undefined;
    const mq = { matches: true, addEventListener: (_: string, fn: () => void) => (listener = fn), removeEventListener: vi.fn() };
    vi.stubGlobal("matchMedia", () => mq);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("system/dark/full");
    act(() => {
      mq.matches = false;
      listener?.();
    });
    expect(screen.getByTestId("state")).toHaveTextContent("system/light/full");
    vi.unstubAllGlobals();
  });

  it("controlled mode reports changes without storing them", async () => {
    const onThemeChange = vi.fn();
    render(
      <ThemeProvider theme="light" onThemeChange={onThemeChange}>
        <Probe />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByText("dark"));
    expect(onThemeChange).toHaveBeenCalledWith("dark");
    expect(screen.getByTestId("state")).toHaveTextContent("light/light/full");
    expect(localStorage.getItem("junco-theme")).toBeNull();
  });

  it("useTheme throws outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
  });
});

describe("themeScript", () => {
  it("applies the saved theme without React", () => {
    localStorage.setItem("junco-theme", "dark");
    localStorage.setItem("junco-motion", "subtle");
    html.className = "";
    new Function(themeScript({ defaultTheme: "light" }))();
    expect(html).toHaveClass("dark");
    expect(html.dataset.motion).toBe("subtle");
  });
});
