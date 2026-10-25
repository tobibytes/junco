import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../src";

describe("Button", () => {
  it("renders a button that responds to clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("isLoading disables the button, sets aria-busy and keeps the label", async () => {
    const onClick = vi.fn();
    render(<Button isLoading onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("asChild renders the child element with button styles", () => {
    render(
      <Button asChild variant="outline">
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveClass("border-border");
  });

  it("className overrides win over variant classes", () => {
    render(<Button className="h-12">Tall</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-12");
    expect(button).not.toHaveClass("h-9");
  });
});
