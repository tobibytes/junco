import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Input } from "../src";

describe("Input", () => {
  it("accepts typing and forwards its ref", async () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Email" />);
    await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "hi@junco.dev");
    expect(ref.current?.value).toBe("hi@junco.dev");
  });

  it("isInvalid sets aria-invalid", () => {
    render(<Input aria-label="Email" isInvalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("is valid by default", () => {
    render(<Input aria-label="Email" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("applies size variants", () => {
    render(<Input aria-label="Email" size="lg" />);
    expect(screen.getByRole("textbox")).toHaveClass("h-11");
  });
});
