import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "../src";

describe("Badge", () => {
  it("renders neutral solid by default", () => {
    render(<Badge>Beta</Badge>);
    expect(screen.getByText("Beta")).toHaveClass("bg-secondary", "text-secondary-foreground");
  });

  it("uses the solid fill pair for a color", () => {
    render(<Badge color="success">Paid</Badge>);
    expect(screen.getByText("Paid")).toHaveClass("bg-success", "text-success-foreground");
  });

  it("uses the page-safe text token for outline status badges", () => {
    render(<Badge variant="outline" color="danger">Failed</Badge>);
    expect(screen.getByText("Failed")).toHaveClass("text-destructive-text", "bg-transparent");
  });

  it("hasDot adds a dot before the label", () => {
    render(<Badge hasDot color="warning">Pending</Badge>);
    expect(screen.getByText("Pending").className).toContain("before:bg-current");
  });
});
