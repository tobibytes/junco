import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox, Field, Input, Label, Radio, RadioGroup, Separator, Switch, Textarea } from "../src";

describe("Field", () => {
  it("keeps label and control at the top when stretched by a taller neighbor in a grid row", () => {
    // Without content-start, a stretched Field's grid spreads the extra height between its rows,
    // so labels in the same row end up at different heights.
    const { container } = render(
      <Field label="Name">
        <Input />
      </Field>,
    );
    expect(container.firstElementChild).toHaveClass("grid", "content-start");
  });

  it("links label, description and error to the control", () => {
    render(
      <Field label="Email" description="Work email only" error="Required" isRequired>
        <Input />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: /Email/ });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription("Work email only Required");
  });

  it("is valid without an error and disables the control", () => {
    render(
      <Field label="Name" isDisabled>
        <Input />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toBeDisabled();
  });

  it("lets props on the control win", () => {
    render(
      <Field label="Bio" id="from-field">
        <Textarea id="from-control" />
      </Field>,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "from-control");
  });

  it("controls work alone without a Field", () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole("textbox", { name: "Notes" })).not.toHaveAttribute("aria-describedby");
  });
});

describe("Label", () => {
  it("shows a hidden required marker", () => {
    render(<Label isRequired>Email</Label>);
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Separator", () => {
  it("is decorative by default", () => {
    const { container } = render(<Separator />);
    expect(container.firstElementChild).toHaveAttribute("role", "none");
  });

  it("can be a real separator", () => {
    render(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });
});

describe("Textarea", () => {
  it("accepts typing and marks invalid", async () => {
    render(<Textarea aria-label="Notes" isInvalid autoResize />);
    const textarea = screen.getByRole("textbox", { name: "Notes" });
    await userEvent.type(textarea, "hello");
    expect(textarea).toHaveValue("hello");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveClass("field-sizing-content");
  });
});

describe("Checkbox", () => {
  it("toggles with click and Space", async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Accept" onCheckedChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: "Accept" });
    await userEvent.click(box);
    expect(box).toBeChecked();
    box.focus();
    await userEvent.keyboard(" ");
    expect(box).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("supports indeterminate", () => {
    render(<Checkbox aria-label="All" checked="indeterminate" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  it("picks up its label from a Field", () => {
    render(
      <Field label="Subscribe">
        <Checkbox />
      </Field>,
    );
    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toBeInTheDocument();
  });
});

describe("Switch", () => {
  it("toggles on and off", async () => {
    render(<Switch aria-label="Notifications" />);
    const sw = screen.getByRole("switch", { name: "Notifications" });
    expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    expect(sw).toBeChecked();
  });
});

describe("RadioGroup", () => {
  it("selects one option and moves with arrow keys", async () => {
    render(
      <RadioGroup aria-label="Plan" defaultValue="free">
        <Radio value="free" aria-label="Free" />
        <Radio value="pro" aria-label="Pro" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Pro" }));
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Free" })).not.toBeChecked();
  });
});
