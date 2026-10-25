import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kbd, Skeleton, Spinner } from "../src";

describe("Kbd", () => {
  it("renders a kbd element", () => {
    render(<Kbd title="Command">⌘</Kbd>);
    const kbd = screen.getByTitle("Command");
    expect(kbd.tagName).toBe("KBD");
    expect(kbd).toHaveClass("font-mono");
  });
});

describe("Spinner", () => {
  it("announces itself as a status with a label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("takes a custom label", () => {
    render(<Spinner label="Saving" />);
    expect(screen.getByRole("status", { name: "Saving" })).toBeInTheDocument();
  });

  it("hides itself from assistive tech when label is null", () => {
    const { container } = render(<Spinner label={null} />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Skeleton", () => {
  it("renders a hidden placeholder", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const el = container.firstElementChild!;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("h-4", "w-32", "animate-skeleton");
  });

  it("renders children once loaded", () => {
    render(<Skeleton isLoaded>Ready</Skeleton>);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
});
