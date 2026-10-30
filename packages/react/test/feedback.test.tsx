import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert, AlertDescription, AlertTitle, Field, Progress, Slider } from "../src";

describe("Progress", () => {
  it("exposes the value as a progressbar", () => {
    render(<Progress value={30} aria-label="Upload" />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "30");
    expect(bar).toHaveAttribute("aria-valuetext", "30%");
    expect(bar).toHaveAttribute("data-state", "loading");
  });

  it("clamps, takes a custom max and value label", () => {
    render(<Progress value={15} max={12} getValueLabel={(v, m) => `${v} of ${m} cards`} aria-label="Review" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "12");
    expect(bar).toHaveAttribute("aria-valuetext", "12 of 12 cards");
    expect(bar).toHaveAttribute("data-state", "complete");
  });

  it("is indeterminate without a value", () => {
    render(<Progress aria-label="Syncing" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-state", "indeterminate");
    expect(bar.firstElementChild).toHaveClass("animate-progress");
  });
});

describe("Slider", () => {
  it("moves with the arrow keys", async () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={[50]} step={5} aria-label="Volume" onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb).toHaveAttribute("aria-valuenow", "50");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith([55]);
  });

  it("names each thumb of a range", () => {
    render(<Slider defaultValue={[10, 40]} thumbLabels={["Minimum", "Maximum"]} getValueLabel={(v) => `${v} pages`} />);
    expect(screen.getByRole("slider", { name: "Minimum" })).toHaveAttribute("aria-valuetext", "10 pages");
    expect(screen.getByRole("slider", { name: "Maximum" })).toHaveAttribute("aria-valuenow", "40");
  });

  it("takes its label from a Field", () => {
    render(
      <Field label="Daily goal">
        <Slider defaultValue={[20]} />
      </Field>,
    );
    expect(screen.getByRole("slider", { name: "Daily goal" })).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("is a status with a title and description", () => {
    render(
      <Alert>
        <AlertTitle>This looks like a scan</AlertTitle>
        <AlertDescription>Text may be missing.</AlertDescription>
      </Alert>,
    );
    const alert = screen.getByRole("status");
    expect(alert).toHaveTextContent("This looks like a scan");
    expect(alert).toHaveTextContent("Text may be missing.");
  });

  it("danger alerts are announced at once and color the title", () => {
    render(
      <Alert color="danger" icon={<svg />} action={<button type="button">Retry</button>}>
        <AlertTitle>Couldn't read this file</AlertTitle>
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(screen.getByText("Couldn't read this file")).toHaveClass("text-destructive-text");
    expect(alert.querySelector("[aria-hidden]")).toContainHTML("svg");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
