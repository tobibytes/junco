import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TiltCard } from "../src";

function setup(props: React.ComponentProps<typeof TiltCard> = {}) {
  render(
    <TiltCard data-testid="card" {...props}>
      <p>Card</p>
    </TiltCard>,
  );
  const card = screen.getByTestId("card");
  card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} });
  return card;
}

const move = (el: HTMLElement, x: number, y: number, pointerType = "mouse") =>
  fireEvent.pointerMove(el, { clientX: x, clientY: y, pointerType });

describe("TiltCard", () => {
  it("tilts toward the pointer", async () => {
    const card = setup({ maxTilt: 10 });
    move(card, 200, 0); // top right corner
    await waitFor(() => expect(card.dataset.tilting).toBe("true"));
    expect(card.style.getPropertyValue("--tilt-y")).toBe("10.00deg");
    expect(card.style.getPropertyValue("--tilt-x")).toBe("10.00deg");
  });

  it("settles flat when the pointer leaves", async () => {
    const card = setup();
    move(card, 200, 100);
    await waitFor(() => expect(card.dataset.tilting).toBe("true"));
    fireEvent.pointerLeave(card);
    expect(card.dataset.tilting).toBe("false");
    expect(card.style.getPropertyValue("--tilt-y")).toBe("0.00deg");
  });

  it("never tilts with motion off", async () => {
    document.documentElement.setAttribute("data-motion", "off");
    const card = setup();
    move(card, 200, 0);
    await new Promise((r) => setTimeout(r, 40));
    expect(card.dataset.tilting).toBe("false");
    expect(card.style.getPropertyValue("--tilt-y")).toBe("");
  });

  it("scales its tilt by --motion-scale in CSS, so subtle motion softens it", () => {
    const card = setup();
    expect(card.style.transform).toContain("var(--motion-scale, 1)");
  });

  it("ignores touch so scrolling stays smooth", async () => {
    const card = setup();
    move(card, 200, 0, "touch");
    await new Promise((r) => setTimeout(r, 40));
    expect(card.dataset.tilting).toBe("false");
  });

  it("keeps the glare decorative", () => {
    const card = setup();
    expect(card.querySelector("[data-tilt-glare]")).toHaveAttribute("aria-hidden", "true");
  });
});
