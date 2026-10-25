import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BorderBeam,
  confetti,
  MagneticButton,
  Marquee,
  NumberTicker,
  readMotionScale,
  Reveal,
  ShimmerText,
  startViewTransition,
  TextReveal,
  Typewriter,
  useMotionScale,
} from "../src";

const html = document.documentElement;

function setMotion(value?: "off" | "subtle" | "full") {
  if (value) html.setAttribute("data-motion", value);
  else html.removeAttribute("data-motion");
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduce") ? matches : false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

/** A controllable IntersectionObserver. */
let intersect: (visible: boolean) => void = () => {};
function stubIntersectionObserver() {
  class IO {
    constructor(private cb: IntersectionObserverCallback) {
      intersect = (visible) => act(() => this.cb([{ isIntersecting: visible } as IntersectionObserverEntry], this as never));
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  vi.stubGlobal("IntersectionObserver", IO);
}

beforeEach(() => setMotion());
afterEach(() => {
  vi.unstubAllGlobals();
  setMotion();
});

describe("motion scale", () => {
  it("reads data-motion and prefers-reduced-motion", () => {
    expect(readMotionScale()).toBe(1);
    setMotion("subtle");
    expect(readMotionScale()).toBe(0.6);
    setMotion("off");
    expect(readMotionScale()).toBe(0);
    setMotion("full");
    stubReducedMotion(true);
    expect(readMotionScale()).toBe(0);
  });

  it("updates live when data-motion changes", async () => {
    function Probe() {
      return <span data-testid="scale">{useMotionScale()}</span>;
    }
    render(<Probe />);
    expect(screen.getByTestId("scale")).toHaveTextContent("1");
    setMotion("off");
    await waitFor(() => expect(screen.getByTestId("scale")).toHaveTextContent("0"));
  });
});

describe("Reveal", () => {
  it("stays hidden until it scrolls into view", () => {
    stubIntersectionObserver();
    render(<Reveal data-testid="r">Hello</Reveal>);
    const el = screen.getByTestId("r");
    expect(el).toHaveAttribute("data-state", "hidden");
    intersect(true);
    expect(el).toHaveAttribute("data-state", "visible");
  });

  it("staggers children with an index and keeps their own classes", () => {
    render(
      <Reveal stagger>
        <div className="a">One</div>
        <div>Two</div>
      </Reveal>,
    );
    const two = screen.getByText("Two");
    expect(screen.getByText("One")).toHaveClass("a", "reveal-item");
    expect(two.style.getPropertyValue("--reveal-index")).toBe("1");
  });
});

describe("TextReveal", () => {
  it("gives assistive tech the whole text once and hides the pieces", () => {
    const { container } = render(<TextReveal as="h1">Ship the whole product</TextReveal>);
    expect(screen.getByRole("heading")).toHaveTextContent(/^Ship the whole product/);
    const words = container.querySelectorAll(".text-reveal-word");
    expect(words).toHaveLength(4);
    expect(words[0]!.closest("[aria-hidden]")).not.toBeNull();
  });
});

describe("NumberTicker", () => {
  it("shows the final value instantly with motion off", () => {
    setMotion("off");
    const { container } = render(<NumberTicker value={12840} />);
    expect(container.querySelector("[aria-hidden]")).toHaveTextContent("12,840");
  });

  it("always exposes the final value to screen readers, and counts up to it", async () => {
    const { container } = render(<NumberTicker value={1234.5} duration={120} />);
    const visible = container.querySelector("[aria-hidden]")!;
    const spoken = container.querySelector("span > span:not([aria-hidden])")!;
    expect(spoken).toHaveTextContent("1,234.5");
    await waitFor(() => expect(visible).toHaveTextContent("1,234.5"), { timeout: 2000 });
  });

  it("takes Intl options", () => {
    setMotion("off");
    const { container } = render(<NumberTicker value={0.42} format={{ style: "percent" }} />);
    expect(container.querySelector("[aria-hidden]")).toHaveTextContent("42%");
  });
});

describe("Typewriter", () => {
  it("shows the first word, complete and still, with motion off", async () => {
    setMotion("off");
    const { container } = render(<Typewriter words={["the web", "phones"]} />);
    await waitFor(() => expect(container.querySelector("[aria-hidden]")).toHaveTextContent("the web"));
    expect(container).toHaveTextContent("the web, phones");
  });

  it("types the word out with motion on", async () => {
    const { container } = render(<Typewriter words="hi there" speed={5} />);
    await waitFor(() => expect(container.querySelector("[aria-hidden]")).toHaveTextContent("hi there"), { timeout: 2000 });
  });
});

describe("Marquee", () => {
  it("duplicates content for the loop but hides copies from assistive tech and focus", () => {
    const { container } = render(
      <Marquee>
        <a href="#a">Acme</a>
      </Marquee>,
    );
    const tracks = container.querySelectorAll(".marquee-track");
    expect(tracks).toHaveLength(2);
    expect(tracks[0]).not.toHaveAttribute("aria-hidden");
    expect(tracks[1]).toHaveAttribute("aria-hidden", "true");
    expect(tracks[1]).toHaveAttribute("inert");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("becomes a single still row with motion off", async () => {
    setMotion("off");
    const { container } = render(<Marquee>Acme</Marquee>);
    await waitFor(() => expect(container.querySelectorAll(".marquee-track")).toHaveLength(1));
    expect(container.firstElementChild).toHaveAttribute("data-static");
  });

  it("respects prefers-reduced-motion", async () => {
    stubReducedMotion(true);
    const { container } = render(<Marquee>Acme</Marquee>);
    await waitFor(() => expect(container.firstElementChild).toHaveAttribute("data-static"));
  });
});

describe("MagneticButton", () => {
  it("leans toward the pointer with motion on, never with motion off", () => {
    const { rerender } = render(<MagneticButton>Go</MagneticButton>);
    const button = screen.getByRole("button");
    button.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 40 }) as DOMRect;
    fireEvent.pointerMove(button, { clientX: 100, clientY: 20, pointerType: "mouse" });
    expect(button.style.translate).toBe("12.5px 0px");
    fireEvent.pointerLeave(button);
    expect(button.style.translate).toBe("0px 0px");

    setMotion("off");
    rerender(<MagneticButton>Go</MagneticButton>);
    fireEvent.pointerMove(button, { clientX: 100, clientY: 20, pointerType: "mouse" });
    expect(button.style.translate).toBe("0px 0px");
  });
});

describe("small pieces", () => {
  it("ShimmerText and BorderBeam render their classes; the beam is decorative", () => {
    const { container } = render(
      <div>
        <ShimmerText>Thinking</ShimmerText>
        <BorderBeam />
      </div>,
    );
    expect(screen.getByText("Thinking")).toHaveClass("shimmer");
    expect(container.querySelector(".border-beam")).toHaveAttribute("aria-hidden", "true");
  });

  it("confetti does nothing with motion off", async () => {
    setMotion("off");
    await confetti();
    expect(document.querySelector("canvas")).toBeNull();
  });

  it("startViewTransition falls back to running the update", async () => {
    const update = vi.fn();
    await startViewTransition(update);
    expect(update).toHaveBeenCalledOnce();
  });
});
