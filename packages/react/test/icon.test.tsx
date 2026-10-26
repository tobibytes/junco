import { render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button, Icon } from "../src";

const Search = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  // biome-ignore lint/a11y/noSvgWithoutTitle: a stand-in for an icon library; the test checks what Icon adds
  <svg ref={ref} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <circle cx="11" cy="11" r="8" />
  </svg>
));

describe("Icon", () => {
  it("is decorative by default", () => {
    const { container } = render(<Icon as={Search} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveClass("size-4");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("is an image with a name when labelled", () => {
    render(<Icon as={Search} label="Search" />);
    const img = screen.getByRole("img", { name: "Search" });
    expect(img).not.toHaveAttribute("aria-hidden");
  });

  it("sizes from the scale and takes className and a stroke override", () => {
    const { container } = render(<Icon as={Search} size="lg" className="text-primary" strokeWidth={1.5} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveClass("size-5", "text-primary");
    expect(svg.style.strokeWidth).toBe("1.5");
  });

  it("forwards the ref to the svg", () => {
    const ref = React.createRef<SVGSVGElement>();
    render(<Icon as={Search} ref={ref} />);
    expect(ref.current?.tagName.toLowerCase()).toBe("svg");
  });
});

describe("Button icon-only label warning", () => {
  afterEach(() => vi.restoreAllMocks());

  it("warns when an icon button has no accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon"><Icon as={Search} /></Button>);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('size="icon" needs an aria-label'));
  });

  it("stays quiet when labelled", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button size="icon" aria-label="Search"><Icon as={Search} /></Button>);
    expect(warn).not.toHaveBeenCalled();
  });
});
