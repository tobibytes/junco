import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Scene3D, StaticGradient } from "../src";
import { createLazyScene } from "../src/lib/scene-3d";

/** Makes jsdom look like a browser with WebGL. */
function stubWebGL() {
  vi.stubGlobal("WebGLRenderingContext", class {});
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((type: string) =>
    type === "webgl2" || type === "webgl" ? {} : null) as never);
}

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("reduce"),
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

const FakeScene = ({ label }: { label: string }) => <p>scene: {label}</p>;

function loader() {
  return vi.fn(() => Promise.resolve({ default: FakeScene }));
}

describe("Scene3D", () => {
  it("shows the theme gradient and never loads three.js without WebGL", async () => {
    const load = loader();
    const { container } = render(<Scene3D load={load} props={{ label: "x" }} className="h-64" />);
    await new Promise((r) => setTimeout(r, 20));
    expect(load).not.toHaveBeenCalled();
    expect(container.querySelector("[data-junco-scene]")).toHaveAttribute("data-junco-scene", "fallback");
    expect(container.querySelector("[aria-hidden]")?.getAttribute("style")).toContain("var(--primary");
  });

  it("uses a poster with alt text as the fallback", () => {
    render(<Scene3D load={loader()} poster="/globe.png" alt="A globe with our offices" />);
    expect(screen.getByRole("img", { name: "A globe with our offices" })).toHaveAttribute("src", "/globe.png");
  });

  it("uses a custom fallback", () => {
    render(<Scene3D load={loader()} fallback={<p>Still image</p>} />);
    expect(screen.getByText("Still image")).toBeInTheDocument();
  });

  it("loads the scene when WebGL is available", async () => {
    stubWebGL();
    const load = loader();
    render(<Scene3D load={load} props={{ label: "globe" }} />);
    expect(await screen.findByText("scene: globe")).toBeInTheDocument();
    expect(load).toHaveBeenCalledOnce();
  });

  it("waits until near the screen before loading", async () => {
    stubWebGL();
    let trigger: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: typeof trigger) {
          trigger = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const load = loader();
    render(<Scene3D load={load} props={{ label: "late" }} />);
    await new Promise((r) => setTimeout(r, 20));
    expect(load).not.toHaveBeenCalled();
    trigger?.([{ isIntersecting: true }]);
    expect(await screen.findByText("scene: late")).toBeInTheDocument();
  });

  it("with reduced motion and reducedMotion='fallback', shows the fallback and skips the download", async () => {
    stubWebGL();
    stubReducedMotion(true);
    const load = loader();
    render(<Scene3D load={load} reducedMotion="fallback" fallback={<p>Still</p>} />);
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByText("Still")).toBeInTheDocument();
    expect(load).not.toHaveBeenCalled();
  });

  it("data-motion='off' counts as reduced motion", async () => {
    stubWebGL();
    document.documentElement.setAttribute("data-motion", "off");
    const load = loader();
    render(<Scene3D load={load} reducedMotion="fallback" fallback={<p>Still</p>} />);
    await new Promise((r) => setTimeout(r, 20));
    expect(load).not.toHaveBeenCalled();
  });

  it("with reduced motion by default, still loads (the canvas freezes on one frame)", async () => {
    stubWebGL();
    stubReducedMotion(true);
    render(<Scene3D load={loader()} props={{ label: "frozen" }} />);
    expect(await screen.findByText("scene: frozen")).toBeInTheDocument();
  });

  it("skips 3D in data-saver mode", async () => {
    stubWebGL();
    vi.stubGlobal("navigator", { ...navigator, connection: { saveData: true } });
    const load = loader();
    render(<Scene3D load={load} fallback={<p>Saver</p>} />);
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByText("Saver")).toBeInTheDocument();
    expect(load).not.toHaveBeenCalled();
  });

  it("falls back when the scene fails to load", async () => {
    stubWebGL();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const load = vi.fn(() => Promise.reject(new Error("chunk failed")));
    render(<Scene3D load={load} fallback={<p>Recovered</p>} />);
    await waitFor(() => expect(load).toHaveBeenCalled());
    expect(await screen.findByText("Recovered")).toBeInTheDocument();
  });

  it("createLazyScene passes scene props through and frame props to the wrapper", async () => {
    stubWebGL();
    const Lazy = createLazyScene<{ label: string }>(() => Promise.resolve({ default: FakeScene }), "Fake");
    const { container } = render(<Lazy label="wrapped" className="hero" />);
    expect(await screen.findByText("scene: wrapped")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("hero");
  });
});

describe("lazy ModelViewer defaults", () => {
  it("without WebGL says 3D isn't available instead of pretending to load", async () => {
    const { ModelViewer } = await import("../src");
    render(<ModelViewer src="/m.glb" label="Speaker" />);
    expect(screen.getByText(/isn't available on this device/)).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows a loading status while the scene downloads, separate from the fallback", async () => {
    stubWebGL();
    let resolve: (m: { default: typeof FakeScene }) => void = () => {};
    const Lazy = createLazyScene<{ label: string }>(() => new Promise((r) => (resolve = r)), "Slow", {
      loading: <p role="status">Loading 3D model</p>,
      fallback: <p>Unavailable</p>,
    });
    render(<Lazy label="slow" />);
    expect(await screen.findByRole("status")).toHaveTextContent("Loading 3D model");
    expect(screen.queryByText("Unavailable")).toBeNull();
    resolve({ default: FakeScene });
    expect(await screen.findByText("scene: slow")).toBeInTheDocument();
  });

  it("shows the loading state, not 'unavailable', while waiting to scroll into view", async () => {
    stubWebGL();
    let trigger: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: typeof trigger) {
          trigger = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const Lazy = createLazyScene<{ label: string }>(() => Promise.resolve({ default: FakeScene }), "Below", {
      loading: <p role="status">Loading 3D model</p>,
      fallback: <p>Unavailable</p>,
    });
    render(<Lazy label="below" />);
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByRole("status")).toHaveTextContent("Loading 3D model");
    expect(screen.queryByText("Unavailable")).toBeNull();
    trigger?.([{ isIntersecting: true }]);
    expect(await screen.findByText("scene: below")).toBeInTheDocument();
  });
});

describe("StaticGradient", () => {
  it("is decorative and built from theme variables", () => {
    const { container } = render(<StaticGradient />);
    const el = container.firstElementChild!;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el.getAttribute("style")).toMatch(/var\(--chart-2/);
  });
});
