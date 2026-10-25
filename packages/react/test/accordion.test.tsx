import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../src";

function Faq(props: { variant?: "line" | "card"; type?: "single" | "multiple" }) {
  const items = [
    ["free", "Is it free?", "Yes, MIT licensed."],
    ["react", "Do I need React?", "No. The semantic classes are plain CSS."],
  ] as const;
  const inner = items.map(([value, q, a]) => (
    <AccordionItem key={value} value={value}>
      <AccordionTrigger>{q}</AccordionTrigger>
      <AccordionContent>{a}</AccordionContent>
    </AccordionItem>
  ));
  return props.type === "multiple" ? (
    <Accordion type="multiple" variant={props.variant}>
      {inner}
    </Accordion>
  ) : (
    <Accordion type="single" collapsible variant={props.variant}>
      {inner}
    </Accordion>
  );
}

describe("Accordion", () => {
  it("opens one item at a time and can close it", async () => {
    render(<Faq />);
    const free = screen.getByRole("button", { name: "Is it free?" });
    const react = screen.getByRole("button", { name: "Do I need React?" });
    expect(free).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(free);
    expect(free).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Is it free?" })).toHaveTextContent("MIT");
    await userEvent.click(react);
    expect(free).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(react);
    expect(react).toHaveAttribute("aria-expanded", "false");
  });

  it("type=multiple keeps several open", async () => {
    render(<Faq type="multiple" />);
    await userEvent.click(screen.getByRole("button", { name: "Is it free?" }));
    await userEvent.click(screen.getByRole("button", { name: "Do I need React?" }));
    expect(screen.getAllByRole("region")).toHaveLength(2);
  });

  it("moves between triggers with arrow keys and wraps them in headings", async () => {
    render(<Faq />);
    screen.getByRole("button", { name: "Is it free?" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "Do I need React?" })).toHaveFocus();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  it("applies the card variant to items", () => {
    render(<Faq variant="card" />);
    const item = screen.getByRole("button", { name: "Is it free?" }).closest("h3")!.parentElement;
    expect(item).toHaveClass("rounded-card", "border");
  });

  it("has no axe violations, open or closed", async () => {
    const { container } = render(<Faq />);
    await userEvent.click(screen.getByRole("button", { name: "Is it free?" }));
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations.map((v) => v.id)).toEqual([]);
  });
});
