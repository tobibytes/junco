import { createRandom, FAKE_NOW, fakeCompanies, fakeDays, fakePeople, fakeSeries } from "../lib/fake";

/** Fake data the app pages fall back to. Seeded, so it never changes between renders. */

const DAY = 86_400_000;

export interface ActivityItem {
  id: string;
  actor: { name: string; avatarUrl?: string };
  /** What happened, after the actor's name: "invited". */
  action: string;
  /** What the action is about, shown emphasized: "Q4 roadmap". */
  target?: string;
  at: string;
}

export function fakeActivity(count = 6, seed = 11): ActivityItem[] {
  const r = createRandom(seed);
  const people = fakePeople(8, seed);
  const actions: Array<[string, string?]> = [
    ["invited", undefined],
    ["created the project", "Mobile launch"],
    ["upgraded the plan to", "Business"],
    ["commented on", "Q4 roadmap"],
    ["exported", "Revenue report"],
    ["rotated the API key", "Production"],
    ["paid", "INV-1043"],
  ];
  let t = FAKE_NOW;
  return Array.from({ length: count }, (_, i) => {
    t -= r.int(4, 180) * 60_000;
    // Walk the list with a stride so neighbors differ, then jitter the start per seed.
    const [action, target] = actions[(i * 3 + (seed % actions.length)) % actions.length]!;
    const actor = people[i % people.length]!;
    return {
      id: `act_${i}`,
      actor: { name: actor.name },
      action,
      target: action === "invited" ? people[(i + 3) % people.length]!.name : target,
      at: new Date(t).toISOString(),
    };
  });
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: "paid" | "open" | "failed";
}

export function fakeInvoices(count = 6, seed = 13): Invoice[] {
  const r = createRandom(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: `in_${i}`,
    number: `INV-${1048 - i}`,
    date: new Date(FAKE_NOW - (i * 30 + 3) * DAY).toISOString(),
    amount: 1280 + r.int(-120, 160),
    status: i === 0 ? "open" : i === 3 ? "failed" : "paid",
  }));
}

export interface ApiKey {
  id: string;
  name: string;
  /** Only the last few characters; the full secret is shown once, when it's created. */
  preview: string;
  createdAt: string;
  lastUsedAt?: string;
  scope: "read" | "write" | "admin";
}

export function fakeApiKeys(): ApiKey[] {
  return [
    {
      id: "key_1",
      name: "Production",
      preview: "jk_live_…9f2a",
      createdAt: new Date(FAKE_NOW - 120 * DAY).toISOString(),
      lastUsedAt: new Date(FAKE_NOW - 4 * 60_000).toISOString(),
      scope: "write",
    },
    {
      id: "key_2",
      name: "CI deploys",
      preview: "jk_live_…41c7",
      createdAt: new Date(FAKE_NOW - 64 * DAY).toISOString(),
      lastUsedAt: new Date(FAKE_NOW - 3 * 3_600_000).toISOString(),
      scope: "admin",
    },
    {
      id: "key_3",
      name: "Analytics export",
      preview: "jk_live_…b08e",
      createdAt: new Date(FAKE_NOW - 9 * DAY).toISOString(),
      scope: "read",
    },
  ];
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface DashboardStat {
  label: string;
  value: string;
  /** Percent change, e.g. 12.4 */
  delta?: number;
  /** Set when a rise is bad (churn, costs). */
  isInverse?: boolean;
  series?: number[];
}

export interface DashboardCustomer {
  id: string;
  name: string;
  plan: string;
  mrr: number;
  seats: number;
}

export function fakeDashboardStats(): DashboardStat[] {
  return [
    {
      label: "Revenue",
      value: "$48,210",
      delta: 12.4,
      series: fakeSeries(30, { seed: 21, start: 3200, volatility: 0.12, trend: 0.012 }),
    },
    { label: "Active users", value: "2,914", delta: 4.1, series: fakeSeries(30, { seed: 23, start: 2400 }) },
    { label: "Conversion", value: "3.8%", delta: -0.6, series: fakeSeries(30, { seed: 24, start: 4, trend: -0.002 }) },
    {
      label: "Churn",
      value: "1.9%",
      delta: -0.4,
      isInverse: true,
      series: fakeSeries(30, { seed: 25, start: 2.3, trend: -0.004 }),
    },
  ];
}

export function fakeRevenue(count = 30): ChartPoint[] {
  const days = fakeDays(count);
  const values = fakeSeries(count, { seed: 21, start: 1400 * (1 - count * 0.004), volatility: 0.12, trend: 0.012 });
  return values.map((value, i) => ({
    label: new Date(days[i]!).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    value: Math.round(value),
  }));
}

export function fakeSignups(): ChartPoint[] {
  const values = fakeSeries(12, { seed: 22, start: 40, volatility: 0.5, trend: 0.03 });
  return values.map((value, i) => ({
    label: new Date(Date.UTC(2025, 10 + i, 1)).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
    value: Math.round(value),
  }));
}

export function fakeTopCustomers(): DashboardCustomer[] {
  return fakeCompanies(8).sort((a, b) => b.mrr - a.mrr);
}

export interface UsageMeter {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

export function fakeUsage(): UsageMeter[] {
  return [
    { label: "Seats", used: 18, limit: 30 },
    { label: "API requests", used: 812_400, limit: 1_000_000 },
    { label: "Storage", used: 46.5, limit: 50, unit: "GB" },
  ];
}
