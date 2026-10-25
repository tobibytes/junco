import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "../src";

function Toggle() {
  const { resolvedTheme, setTheme, isMounted } = useTheme();
  return (
    <button aria-pressed={resolvedTheme === "dark"} data-mounted={isMounted} onClick={() => setTheme("dark")}>
      Dark mode is {resolvedTheme}
    </button>
  );
}

describe("ThemeProvider with server rendering", () => {
  it("hydrates without a mismatch, then applies the saved theme", async () => {
    const app = (
      <ThemeProvider defaultTheme="light">
        <Toggle />
      </ThemeProvider>
    );
    // The server has no localStorage, so it renders the default.
    const html = renderToString(app);
    expect(html).toContain("Dark mode is <!-- -->light");

    // The visitor saved "dark" on a previous visit.
    localStorage.setItem("junco-theme", "dark");
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const onRecoverableError = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => {
      hydrateRoot(container, app, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    const button = container.querySelector("button")!;
    expect(button.textContent).toBe("Dark mode is dark");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.dataset.mounted).toBe("true");
    expect(document.documentElement).toHaveClass("dark");
    consoleError.mockRestore();
    container.remove();
  });
});
