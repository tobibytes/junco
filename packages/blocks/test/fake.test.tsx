import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakePeople, fakeSeries, timeAgo, FAKE_NOW } from "../src/lib/fake";
import { renderSlot, type Slots } from "../src/lib/slots";

describe("fake data", () => {
  it("is deterministic per seed", () => {
    expect(fakePeople(5, 7)).toEqual(fakePeople(5, 7));
    expect(fakePeople(5, 7)).not.toEqual(fakePeople(5, 8));
    expect(fakeSeries(10)).toEqual(fakeSeries(10));
  });

  it("makes plausible people", () => {
    const [owner, ...rest] = fakePeople(10);
    expect(owner!.role).toBe("Owner");
    expect(rest.every((p) => p.role !== "Owner")).toBe(true);
    expect(rest.every((p) => /^[\w.]+@[a-z]+\.com$/.test(p.email))).toBe(true);
  });

  it("formats relative time", () => {
    expect(timeAgo(new Date(FAKE_NOW - 5 * 60_000).toISOString())).toBe("5m ago");
    expect(timeAgo(new Date(FAKE_NOW - 3 * 3_600_000).toISOString())).toBe("3h ago");
  });
});

describe("slots", () => {
  type P = { header: { title: string } };
  const Default = ({ title }: { title: string }) => <h1>{title}</h1>;
  const Mine = ({ title }: { title: string }) => <h2>Custom {title}</h2>;
  const Page = ({ slots }: { slots?: Slots<P> }) => <div>{renderSlot(slots, "header", Default, { title: "Hi" })}</div>;

  it("renders the default, an override with the same props, or nothing", () => {
    const { rerender } = render(<Page />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hi");
    rerender(<Page slots={{ header: Mine }} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Custom Hi");
    rerender(<Page slots={{ header: null }} />);
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
