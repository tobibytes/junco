import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Toaster } from "@junco/react";
import type * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiKeysPage,
  AppShell,
  AreaChart,
  BarChart,
  DashboardPage,
  EmptyWorkspacePage,
  ForgotPasswordPage,
  LogInPage,
  NotificationsPage,
  OnboardingPage,
  SettingsBillingPage,
  SettingsProfilePage,
  SignUpPage,
  TeamMembersPage,
  UserDetailPage,
  UsersPage,
  type AppUser,
} from "../src/app";
import { fakeUsers } from "../src/app/users-data";

// Pages with fake data, one entry per page and variant. Used by the smoke and axe tests.
const pages: Array<[string, () => React.ReactElement, RegExp]> = [
  ["LogInPage", () => <LogInPage />, /log in to northwind/i],
  ["LogInPage split", () => <LogInPage variant="split" />, /log in to northwind/i],
  ["SignUpPage", () => <SignUpPage />, /create your account/i],
  ["SignUpPage split", () => <SignUpPage variant="split" />, /create your account/i],
  ["ForgotPasswordPage", () => <ForgotPasswordPage />, /reset your password/i],
  ["OnboardingPage", () => <OnboardingPage />, /name your workspace/i],
  ["OnboardingPage split", () => <OnboardingPage variant="split" />, /name your workspace/i],
  ["DashboardPage", () => <DashboardPage />, /overview/i],
  ["DashboardPage focused", () => <DashboardPage variant="focused" />, /overview/i],
  ["UsersPage", () => <UsersPage />, /^users$/i],
  ["UsersPage cards", () => <UsersPage variant="cards" />, /^users$/i],
  ["UserDetailPage", () => <UserDetailPage />, /.+/],
  ["SettingsProfilePage", () => <SettingsProfilePage />, /settings/i],
  ["SettingsProfilePage sidebar", () => <SettingsProfilePage variant="sidebar" />, /settings/i],
  ["SettingsBillingPage", () => <SettingsBillingPage />, /settings/i],
  ["TeamMembersPage", () => <TeamMembersPage />, /settings/i],
  ["ApiKeysPage", () => <ApiKeysPage />, /settings/i],
  ["NotificationsPage", () => <NotificationsPage />, /settings/i],
  ["EmptyWorkspacePage", () => <EmptyWorkspacePage />, /welcome to northwind/i],
  ["EmptyWorkspacePage minimal", () => <EmptyWorkspacePage variant="minimal" />, /northwind/i],
  [
    "AppShell + DashboardPage",
    () => (
      <AppShell activeHref="#/dashboard">
        <DashboardPage />
      </AppShell>
    ),
    /overview/i,
  ],
];

async function axeViolations(container: HTMLElement) {
  const result = await axe.run(container, {
    rules: {
      // Needs real layout; covered by the token contrast test.
      "color-contrast": { enabled: false },
      // Components render standalone in tests, without the app's landmarks around them.
      region: { enabled: false },
    },
  });
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html.slice(0, 120)).join(" | ")}`);
}

describe("every page renders with fake data", () => {
  it.each(pages)("%s", (_name, make, heading) => {
    render(make());
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(heading);
  });
});

describe("accessibility (axe) on every page", () => {
  it.each(pages)("%s", async (_name, make) => {
    const { container } = render(make());
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("custom data", () => {
  it("DashboardPage shows the stats it is given", () => {
    render(<DashboardPage stats={[{ label: "Orders", value: "1,204", delta: 8 }]} customers={[]} activity={[]} />);
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("1,204")).toBeInTheDocument();
    expect(screen.queryByText("Revenue", { selector: "dt" })).toBeNull();
  });

  it("UsersPage lists the users it is given", () => {
    const users: AppUser[] = [
      { id: "u1", name: "Tobi Olajide", email: "tobi@junco.dev", role: "Owner", status: "active" },
      { id: "u2", name: "Grace Hopper", email: "grace@junco.dev", role: "Editor", status: "invited" },
    ];
    render(<UsersPage users={users} />);
    expect(screen.getByText("2 people in this workspace.")).toBeInTheDocument();
    expect(screen.getByText("Tobi Olajide")).toBeInTheDocument();
    expect(screen.getByText("Invited")).toBeInTheDocument();
  });

  it("UserDetailPage shows the given user", () => {
    render(
      <UserDetailPage
        user={{ id: "x", name: "Alan Turing", email: "alan@junco.dev", role: "Admin", status: "active" }}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Alan Turing");
  });
});

describe("slots", () => {
  it("hide a region with null", () => {
    render(<DashboardPage slots={{ activity: null, signups: null }} />);
    expect(screen.queryByRole("heading", { name: "Activity" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Signups" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Revenue" })).toBeInTheDocument();
  });

  it("replace a region and get the default's props", () => {
    const Header = ({ title, range }: { title: string; range: string }) => (
      <h1>
        {title} / {range}
      </h1>
    );
    render(<DashboardPage title="Sales" defaultRange="7d" slots={{ header: Header }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sales / 7d");
  });

  it("replace the auth brand panel", () => {
    render(
      <LogInPage variant="split" slots={{ brand: ({ appName }) => <p>Brand for {appName}</p> }} appName="Junco" />,
    );
    expect(screen.getByText("Brand for Junco")).toBeInTheDocument();
  });

  it("replace the app shell sidebar", () => {
    render(
      <AppShell slots={{ sidebar: () => <nav aria-label="Custom">Mine</nav>, topbar: null }}>
        <p>Body</p>
      </AppShell>,
    );
    expect(screen.getAllByRole("navigation", { name: "Custom" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /collapse sidebar/i })).toBeNull();
  });
});

describe("LogInPage", () => {
  it("shows field errors and doesn't submit when empty", async () => {
    const onSubmit = vi.fn();
    render(<LogInPage onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByText("Enter your email")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("explains a malformed email", async () => {
    render(<LogInPage onSubmit={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Email"), "ada@");
    await userEvent.type(screen.getByLabelText("Password"), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });

  it("submits valid values and shows a thrown error on the form", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Wrong email or password."));
    render(<LogInPage onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Email"), "ada@northwind.com");
    await userEvent.type(screen.getByLabelText("Password"), "hunter22");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ email: "ada@northwind.com", password: "hunter22", remember: true }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong email or password.");
  });

  it("toggles password visibility", async () => {
    render(<LogInPage />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("SignUpPage", () => {
  it("requires the terms and a strong enough password", async () => {
    const onSubmit = vi.fn();
    render(<SignUpPage onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText("Work email"), "ada@northwind.com");
    await userEvent.type(screen.getByLabelText("Password"), "short");
    expect(screen.getByText("Too short")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("Use at least 8 characters")).toBeInTheDocument();
    expect(screen.getByText("Accept the terms to continue")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ForgotPasswordPage", () => {
  it("confirms where the link went", async () => {
    const onSubmit = vi.fn();
    render(<ForgotPasswordPage onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Email"), "ada@northwind.com");
    await userEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByRole("heading", { name: "Check your email" })).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith({ email: "ada@northwind.com" });
    await userEvent.click(screen.getByRole("button", { name: "Use a different email" }));
    expect(screen.getByRole("heading", { name: "Reset your password" })).toBeInTheDocument();
  });
});

describe("OnboardingPage", () => {
  it("validates each step, fills the URL from the name, and finishes", async () => {
    const onComplete = vi.fn();
    render(<OnboardingPage onComplete={onComplete} />);
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(await screen.findAllByText("At least 2 characters")).not.toHaveLength(0);

    await userEvent.type(screen.getByLabelText("Workspace name"), "Acme Labs");
    expect(screen.getByLabelText("Workspace URL")).toHaveValue("acme-labs");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(await screen.findByRole("heading", { name: "What will you use it for?" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(await screen.findByText("Pick one to continue")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: /engineering/i }));
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByRole("heading", { name: "Invite your team" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Skip" }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onComplete.mock.calls[0]![0]).toMatchObject({
      workspace: "Acme Labs",
      slug: "acme-labs",
      useCase: "engineering",
      invites: "",
    });
    expect(await screen.findByRole("heading", { name: "You're all set" })).toBeInTheDocument();
  });
});

describe("UsersPage", () => {
  it("invites people from the dialog and lists them as invited", async () => {
    const onInvite = vi.fn();
    render(<UsersPage users={undefined} onInvite={onInvite} />);
    await userEvent.click(screen.getByRole("button", { name: "Invite people" }));
    const dialog = await screen.findByRole("dialog", { name: "Invite people" });

    await userEvent.type(within(dialog).getByLabelText("Emails"), "grace@acme.com, nope");
    await userEvent.click(within(dialog).getByRole("button", { name: "Send invites" }));
    expect(await within(dialog).findByText(/isn't a valid email/)).toBeInTheDocument();

    await userEvent.clear(within(dialog).getByLabelText("Emails"));
    await userEvent.type(within(dialog).getByLabelText("Emails"), "grace@acme.com, alan@acme.com");
    await userEvent.click(within(dialog).getByRole("button", { name: "Send invites" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onInvite).toHaveBeenCalledWith({ emails: ["grace@acme.com", "alan@acme.com"], role: "Member" });
    expect(screen.getByText("26 people in this workspace.")).toBeInTheDocument();
    expect(screen.getByText("grace@acme.com")).toBeInTheDocument();
  });

  it("removes a user after confirming, with undo", async () => {
    render(
      <>
        <UsersPage users={undefined} />
        <Toaster />
      </>,
    );
    const actions = screen.getAllByRole("button", { name: /^Actions for / })[1]!;
    const name = actions.getAttribute("aria-label")!.replace("Actions for ", "");
    await userEvent.click(actions);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Remove from workspace" }));
    const confirm = await screen.findByRole("alertdialog");
    expect(confirm).toHaveTextContent(`Remove ${name}?`);
    await userEvent.click(within(confirm).getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(screen.getByText("23 people in this workspace.")).toBeInTheDocument());
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));
    await waitFor(() => expect(screen.getByText("24 people in this workspace.")).toBeInTheDocument());
  });

  it("calls the latest onUsersChange, not the one from the first render", async () => {
    const first = vi.fn();
    const latest = vi.fn();
    const users = fakeUsers(3);
    const { rerender } = render(<UsersPage users={users} onUsersChange={first} />);
    rerender(<UsersPage users={users} onUsersChange={latest} />);
    await userEvent.click(screen.getAllByRole("button", { name: /^Actions for / })[1]!);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Remove from workspace" }));
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(latest).toHaveBeenCalledWith(users.filter((u) => u !== users[1])));
    expect(first).not.toHaveBeenCalled();
  });

  it("filters by role", async () => {
    render(<UsersPage />);
    await userEvent.click(screen.getByRole("combobox", { name: "Filter by role" }));
    await userEvent.click(await screen.findByRole("option", { name: "Owner" }));
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(1);
  });
});

describe("ApiKeysPage", () => {
  it("shows a new key's secret once", async () => {
    const onCreate = vi.fn(async (v: { name: string; scope: "read" | "write" | "admin" }) => ({
      secret: "jk_live_SECRET123",
      key: { id: "k9", name: v.name, scope: v.scope, preview: "jk_live_…T123", createdAt: new Date().toISOString() },
    }));
    render(<ApiKeysPage onCreate={onCreate} />);
    await userEvent.click(screen.getByRole("button", { name: "Create key" }));
    let dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Create key" }));
    expect(await within(dialog).findByText(/name the key/i)).toBeInTheDocument();

    await userEvent.type(within(dialog).getByLabelText("Name"), "Staging");
    await userEvent.click(within(dialog).getByRole("button", { name: "Create key" }));
    expect(await within(dialog).findByRole("heading", { name: "Save your key" })).toBeInTheDocument();
    expect(within(dialog).getByLabelText("API key")).toHaveValue("jk_live_SECRET123");
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    // The list shows only the preview, and reopening starts a fresh form.
    expect(screen.getByText("Staging")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("jk_live_SECRET123")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Create key" }));
    dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Create API key" })).toBeInTheDocument();
  });

  it("measures relative times from the real clock when given real data", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    render(
      <ApiKeysPage
        keys={[{ id: "k", name: "Real", preview: "jk_live_…abcd", createdAt: fiveMinutesAgo, scope: "read" }]}
      />,
    );
    expect(screen.getByText("5m ago")).toBeInTheDocument();
  });

  it("uses an explicit clock when given one", () => {
    const now = Date.parse("2030-01-01T12:00:00Z");
    render(
      <ApiKeysPage
        now={now}
        keys={[{ id: "k", name: "Old", preview: "jk_live_…abcd", createdAt: "2030-01-01T10:00:00Z", scope: "read" }]}
      />,
    );
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("revokes a key after confirming", async () => {
    render(<ApiKeysPage />);
    await userEvent.click(screen.getByRole("button", { name: "Revoke Production" }));
    const confirm = await screen.findByRole("alertdialog");
    await userEvent.click(within(confirm).getByRole("button", { name: "Revoke key" }));
    await waitFor(() => expect(screen.queryByText("Production")).toBeNull());
  });
});

describe("NotificationsPage", () => {
  it("enables save only after a change and sends the new prefs", async () => {
    const onSave = vi.fn();
    render(<NotificationsPage onSave={onSave} />);
    const save = screen.getByRole("button", { name: "Save changes" });
    expect(save).toBeDisabled();
    await userEvent.click(screen.getByRole("switch", { name: "Product news by Email" }));
    expect(save).toBeEnabled();
    await userEvent.click(save);
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0]![0].product.email).toBe(true);
  });
});

describe("TeamMembersPage", () => {
  it("refuses invites past the seat limit", async () => {
    render(<TeamMembersPage seats={{ used: 10, limit: 10 }} />);
    await userEvent.click(screen.getByRole("button", { name: "Invite" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(within(dialog).getByLabelText("Emails"), "new@acme.com");
    await userEvent.click(within(dialog).getByRole("button", { name: "Send invites" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(/your plan has 10/);
  });
});

describe("AppShell", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: false,
      media: q,
      addEventListener() {},
      removeEventListener() {},
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("marks the active nav item and has a skip link", () => {
    render(
      <AppShell activeHref="#/users">
        <p>Body</p>
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("link", { name: /^Users/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("names buttons by their visible text (WCAG 2.5.3), labelling only when there's no text", () => {
    const { rerender } = render(
      <AppShell onSearch={() => {}} sidebar={{ user: { name: "Tobi Olajide", email: "tobi@example.com" } }}>
        <p>Body</p>
      </AppShell>,
    );
    // Search: the visible "Search…" is the name; the shortcut comes from aria-keyshortcuts.
    const search = screen.getByRole("button", { name: "Search…" });
    expect(search).not.toHaveAttribute("aria-label");
    expect(search).toHaveAttribute("aria-keyshortcuts", "Meta+K Control+K");
    // Account menu: expanded, the visible name and email are the label (no duplicate avatar name).
    const account = screen.getAllByRole("button", { name: /tobi@example\.com/ })[0]!;
    expect(account).not.toHaveAttribute("aria-label");
    expect(account).toHaveAccessibleName("Tobi Olajide tobi@example.com");
    // Collapsed: no visible text, so it gets a label.
    rerender(
      <AppShell isCollapsed onSearch={() => {}} sidebar={{ user: { name: "Tobi Olajide", email: "tobi@example.com" } }}>
        <p>Body</p>
      </AppShell>,
    );
    expect(screen.getAllByRole("button", { name: "Account menu for Tobi Olajide" }).length).toBeGreaterThan(0);
  });

  it("collapses with the button and with Ctrl+B", async () => {
    const onCollapsedChange = vi.fn();
    render(
      <AppShell onCollapsedChange={onCollapsedChange}>
        <p>Body</p>
      </AppShell>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute("aria-pressed", "true");
    act(() => {
      fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    });
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
  });

  it("opens the mobile nav sheet and closes it on navigate", async () => {
    render(
      <AppShell sidebar={{ groups: [{ items: [{ label: "Home", onSelect: () => {} }] }] }}>
        <p>Body</p>
      </AppShell>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const sheet = await screen.findByRole("dialog", { name: "Navigation" });
    await userEvent.click(within(sheet).getByRole("button", { name: "Home" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});

describe("charts", () => {
  const data = [
    { label: "Jan", value: 10 },
    { label: "Feb", value: 30 },
    { label: "Mar", value: 20 },
  ];
  it.each([
    ["AreaChart", AreaChart],
    ["BarChart", BarChart],
  ] as const)("%s exposes its numbers as a table", (_n, Chart) => {
    render(<Chart data={data} label="Signups by month" formatValue={(v) => `${v} people`} />);
    const table = screen.getByRole("table", { name: "Signups by month" });
    expect(within(table).getByRole("rowheader", { name: "Feb" })).toBeInTheDocument();
    expect(within(table).getByText("30 people")).toBeInTheDocument();
  });

  it("BarChart keeps bars a fixed share of their slot however many there are", () => {
    // A percentage gap between bars grew with the count (6% x 29 gaps > 100% at 30 bars), squeezing
    // bars to slivers and misaligning the axis labels, which assume equal slots.
    const many = Array.from({ length: 30 }, (_, i) => ({ label: `D${i}`, value: i + 1 }));
    const { container } = render(<BarChart data={many} label="Daily" />);
    const slots = container.querySelectorAll('[data-slot="bar-slot"]');
    expect(slots).toHaveLength(30);
    expect(slots[0]!.parentElement!.className).not.toMatch(/gap-\[/);
    for (const bar of container.querySelectorAll('[data-slot="bar"]')) expect(bar.className).toContain("w-[64%]");
  });

  it("handles empty data", () => {
    render(<AreaChart data={[]} label="Nothing" />);
    expect(screen.getByRole("table", { name: "Nothing" })).toBeInTheDocument();
  });
});
