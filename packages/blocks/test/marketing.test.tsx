import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BlogIndexPage,
  BlogPostPage,
  ChangelogPage,
  defaultPlans,
  Faq,
  LandingPage,
  LinkProvider,
  NotFoundPage,
  PricingPage,
  PricingTable,
  ServerErrorPage,
  WaitlistPage,
} from "../src/marketing";

afterEach(() => document.documentElement.removeAttribute("data-motion"));

async function violations(container: HTMLElement) {
  // Color contrast needs real layout; the token contrast test covers it.
  const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return result.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.html.slice(0, 120)).join(" | ")}`);
}

const pages = [
  ["LandingPage product", <LandingPage key="a" variant="product" />],
  ["LandingPage bold", <LandingPage key="b" variant="bold" />],
  ["LandingPage minimal", <LandingPage key="c" variant="minimal" />],
  ["PricingPage", <PricingPage key="d" />],
  ["ChangelogPage", <ChangelogPage key="e" />],
  ["ChangelogPage compact", <ChangelogPage key="e2" variant="compact" />],
  ["BlogIndexPage", <BlogIndexPage key="f" />],
  ["BlogIndexPage list", <BlogIndexPage key="f2" variant="list" />],
  ["BlogPostPage", <BlogPostPage key="g" />],
  ["NotFoundPage", <NotFoundPage key="h" />],
  ["ServerErrorPage", <ServerErrorPage key="i" />],
  ["WaitlistPage", <WaitlistPage key="j" />],
  ["WaitlistPage split", <WaitlistPage key="k" variant="split" />],
] as const;

describe("every page with fake data", () => {
  it.each(pages)("%s renders one h1 inside main, and passes axe", async (_, page) => {
    const { container } = render(page);
    const main = screen.getByRole("main");
    expect(within(main).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(await violations(container)).toEqual([]);
  });
});

describe("custom data and slots", () => {
  it("LandingPage takes hero overrides and real data", () => {
    render(
      <LandingPage
        variant="minimal"
        brand={{ name: "Acme" }}
        hero={{ title: "Ship rockets faster", primaryAction: { label: "Launch", href: "/go" } }}
        features={[{ title: "Fuel", description: "Lots of it" }]}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ship rockets faster");
    expect(screen.getByRole("link", { name: /Launch/ })).toHaveAttribute("href", "/go");
    expect(screen.getByRole("heading", { name: "Fuel" })).toBeInTheDocument();
    expect(screen.getAllByText("Acme").length).toBeGreaterThan(0);
  });

  it("slots replace a section with your component, or hide it with null", () => {
    function MyHero({ title }: { title?: string }) {
      return <h1>Custom: {title}</h1>;
    }
    render(<LandingPage variant="product" hero={{ title: "Hello" }} slots={{ hero: MyHero, footer: null, pricing: null }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Custom: Hello");
    expect(screen.queryByRole("contentinfo")).toBeNull();
    expect(screen.queryByRole("tablist", { name: "Billing period" })).toBeNull();
  });

  it("LinkProvider routes internal links through your component; external ones stay plain", () => {
    const Link = ({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
      <a data-router href={href} {...props} />
    );
    render(
      <LinkProvider component={Link}>
        <NotFoundPage suggestions={[{ label: "Docs", href: "/docs" }, { label: "GitHub", href: "https://github.com" }]} />
      </LinkProvider>,
    );
    const suggested = screen.getByRole("navigation", { name: "Suggested pages" });
    expect(within(suggested).getByRole("link", { name: "Docs" })).toHaveAttribute("data-router");
    const ext = within(suggested).getByRole("link", { name: "GitHub" });
    expect(ext).not.toHaveAttribute("data-router");
    expect(ext).toHaveAttribute("rel", "noreferrer");
  });
});

describe("PricingTable", () => {
  it("switches between yearly and monthly prices", async () => {
    const onBillingChange = vi.fn();
    render(<PricingTable onBillingChange={onBillingChange} />);
    const panel = () => screen.getByRole("tabpanel");
    expect(within(panel()).getByText("$10")).toBeInTheDocument();
    expect(within(panel()).getAllByText(/billed yearly/).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("tab", { name: /Monthly/ }));
    expect(onBillingChange).toHaveBeenCalledWith("monthly");
    expect(within(panel()).getByText("$12")).toBeInTheDocument();
    expect(within(panel()).getAllByText(/billed monthly/).length).toBeGreaterThan(0);
  });

  it("computes the yearly saving and names each plan's button", () => {
    render(<PricingTable plans={defaultPlans} />);
    expect(screen.getByRole("tab", { name: /Save 17%/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start 14-day trial on the Pro plan" })).toBeInTheDocument();
  });

  it("the comparison marks included and missing features in words, not just icons", () => {
    render(<PricingPage />);
    const table = screen.getByRole("table");
    expect(within(table).getAllByText("Included").length).toBeGreaterThan(5);
    expect(within(table).getAllByText("Not included").length).toBeGreaterThan(3);
    expect(within(table).getByRole("rowheader", { name: "SSO (SAML, OIDC)" })).toBeInTheDocument();
  });
});

describe("Faq", () => {
  it("opens an answer", async () => {
    render(<Faq />);
    const q = screen.getByRole("button", { name: "Can I try Orbit before paying?" });
    await userEvent.click(q);
    expect(q).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Can I try Orbit before paying?" })).toHaveTextContent("14-day trial");
  });
});

describe("BlogIndexPage", () => {
  it("filters by topic and announces the result", async () => {
    render(<BlogIndexPage />);
    const engineering = screen.getByRole("button", { name: "Engineering" });
    await userEvent.click(engineering);
    expect(engineering).toHaveAttribute("aria-pressed", "true");
    const titles = within(screen.getByRole("main"))
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent);
    expect(titles).toEqual(["How we cut our cycle time in half", "Inside Orbit's sync engine"]);
    expect(screen.getByText("2 posts about Engineering")).toBeInTheDocument();
  });
});

describe("forms", () => {
  it("WaitlistPage validates, then confirms", async () => {
    document.documentElement.setAttribute("data-motion", "off");
    const onJoin = vi.fn();
    render(<WaitlistPage onJoin={onJoin} />);
    const email = screen.getByRole("textbox", { name: "Work email" });
    await userEvent.type(email, "nope");
    await userEvent.click(screen.getByRole("button", { name: "Join the waitlist" }));
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription(/Enter an email/);
    expect(onJoin).not.toHaveBeenCalled();
    await userEvent.clear(email);
    await userEvent.type(email, "ada@acme.com{Enter}");
    expect(onJoin).toHaveBeenCalledWith("ada@acme.com");
    expect(await screen.findByRole("status")).toHaveTextContent("You're on the list");
  });

  it("WaitlistPage shows the error when joining fails", async () => {
    render(<WaitlistPage onJoin={() => Promise.reject(new Error("That email is already on the list."))} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Work email" }), "ada@acme.com{Enter}");
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Work email" })).toHaveAccessibleDescription(/already on the list/));
  });

  it("ChangelogPage subscribe calls back with the email", async () => {
    const onSubscribe = vi.fn();
    render(<ChangelogPage onSubscribe={onSubscribe} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "me@site.dev");
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(onSubscribe).toHaveBeenCalledWith("me@site.dev");
  });

  it("ServerErrorPage retries", async () => {
    const onRetry = vi.fn();
    render(<ServerErrorPage onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("BlogPostPage", () => {
  it("links the table of contents to headings in the article", () => {
    render(<BlogPostPage />);
    const toc = screen.getByRole("navigation", { name: "On this page" });
    for (const link of within(toc).getAllByRole("link")) {
      const id = link.getAttribute("href")!.slice(1);
      expect(document.getElementById(id)).not.toBeNull();
    }
  });
});
