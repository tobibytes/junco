import { createRandom, fakeDays, fakePeople, fakeSeries, FAKE_NOW } from "@junco/blocks/fake";

/** Everything Pulse shows is seeded, so it's the same on every load (and in every screenshot). */

export const PRODUCT = "Northwind Docs";

export const EVENT_TYPES = [
  { name: "Page viewed", weight: 38 },
  { name: "Search performed", weight: 14 },
  { name: "Document created", weight: 11 },
  { name: "Document shared", weight: 8 },
  { name: "Comment added", weight: 9 },
  { name: "Invite sent", weight: 6 },
  { name: "Signed up", weight: 6 },
  { name: "Export downloaded", weight: 5 },
  { name: "Plan upgraded", weight: 2 },
] as const;

export type EventName = (typeof EVENT_TYPES)[number]["name"];

export const DEVICES = ["Desktop", "Mobile", "Tablet"] as const;
export const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge", "Arc"] as const;
export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "NG", name: "Nigeria" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "JP", name: "Japan" },
  { code: "CA", name: "Canada" },
] as const;
export const PLANS = ["Free", "Pro", "Team", "Enterprise"] as const;
export type Plan = (typeof PLANS)[number];

export interface PulseUser {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: Plan;
  country: string;
  device: (typeof DEVICES)[number];
  events: number;
  sessions: number;
  firstSeen: string;
  lastSeen: string;
}

export interface PulseEvent {
  id: string;
  name: EventName;
  userId: string;
  userName: string;
  country: string;
  device: (typeof DEVICES)[number];
  browser: (typeof BROWSERS)[number];
  path: string;
  at: string;
  properties: Record<string, string | number | boolean>;
}

const r = createRandom(2026);

function weighted<T extends { weight: number }>(items: readonly T[]): T {
  const total = items.reduce((n, i) => n + i.weight, 0);
  let roll = r.next() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1]!;
}

export const users: PulseUser[] = fakePeople(48, 7).map((p, i) => {
  const plan: Plan = i < 4 ? "Enterprise" : r.pick(["Free", "Free", "Pro", "Pro", "Team"] as const);
  const sessions = r.int(2, 140);
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    company: p.company,
    plan,
    country: r.pick(COUNTRIES).name,
    device: r.pick(["Desktop", "Desktop", "Desktop", "Mobile", "Mobile", "Tablet"] as const),
    events: sessions * r.int(4, 18),
    sessions,
    firstSeen: p.joinedAt,
    lastSeen: p.lastActiveAt,
  };
});

const PATHS = ["/", "/docs", "/docs/getting-started", "/pricing", "/editor", "/editor/share", "/settings", "/search"];

export const events: PulseEvent[] = Array.from({ length: 640 }, (_, i) => {
  const user = r.pick(users);
  const type = weighted(EVENT_TYPES);
  const minutesAgo = Math.floor(r.next() ** 1.6 * 7 * 24 * 60);
  const properties: PulseEvent["properties"] = { session_id: `s_${(9000 + r.int(0, 900)).toString(36)}` };
  if (type.name === "Search performed") properties.query = r.pick(["roadmap", "pricing", "api keys", "onboarding", "q4 okrs"]);
  if (type.name === "Document created" || type.name === "Document shared") properties.words = r.int(80, 4200);
  if (type.name === "Plan upgraded") properties.to_plan = r.pick(["Pro", "Team"]);
  if (type.name === "Invite sent") properties.invites = r.int(1, 6);
  if (type.name === "Export downloaded") properties.format = r.pick(["pdf", "markdown", "docx"]);
  properties.first_visit = r.next() < 0.12;
  return {
    id: `evt_${(100000 + i * 37).toString(36)}`,
    name: type.name,
    userId: user.id,
    userName: user.name,
    country: user.country,
    device: user.device,
    browser: r.pick(BROWSERS),
    path: type.name === "Page viewed" ? r.pick(PATHS) : r.pick(["/editor", "/editor/share", "/search", "/settings/billing"]),
    at: new Date(FAKE_NOW - minutesAgo * 60_000).toISOString(),
    properties,
  };
}).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

/* ------------------------------------------------------------------ time series */

export type Range = "7d" | "30d" | "90d";
export const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };

const ALL_DAYS = fakeDays(90);
const dau = fakeSeries(90, { seed: 41, start: 2400, volatility: 0.09, trend: 0.006 }).map((v, i) => {
  // a weekday rhythm: weekends are quieter
  const day = new Date(ALL_DAYS[i]!).getUTCDay();
  return Math.round(v * (day === 0 || day === 6 ? 0.72 : 1));
});
const signups = fakeSeries(90, { seed: 42, start: 60, volatility: 0.22, trend: 0.004 }).map(Math.round);

const label = (iso: string, days: number) =>
  new Date(iso).toLocaleDateString("en-US", days > 30 ? { month: "short", day: "numeric" } : { month: "short", day: "numeric" });

export function series(range: Range) {
  const n = RANGE_DAYS[range];
  const days = ALL_DAYS.slice(-n);
  return {
    activeUsers: dau.slice(-n).map((value, i) => ({ label: label(days[i]!, n), value })),
    signups: signups.slice(-n).map((value, i) => ({ label: label(days[i]!, n), value })),
  };
}

function sum(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0);
}

const pct = (a: number, b: number) => Math.round(((a - b) / Math.max(1, b)) * 1000) / 10;

/** Headline numbers for the range, compared with the period before it. */
export function stats(range: Range) {
  const n = RANGE_DAYS[range];
  const cur = dau.slice(-n);
  const prev = dau.slice(-2 * n, -n).length ? dau.slice(-2 * n, -n) : dau.slice(0, n);
  const curSign = signups.slice(-n);
  const prevSign = signups.slice(-2 * n, -n).length ? signups.slice(-2 * n, -n) : signups.slice(0, n);
  const avgDau = Math.round(sum(cur) / n);
  const avgPrev = Math.round(sum(prev) / prev.length);
  const conv = 4.2 + (n === 7 ? 0.6 : n === 30 ? 0.3 : 0);
  return [
    { label: "Active users", value: avgDau.toLocaleString("en-US"), delta: pct(avgDau, avgPrev), series: cur.slice(-14) },
    { label: "Sign-ups", value: sum(curSign).toLocaleString("en-US"), delta: pct(sum(curSign), sum(prevSign)), series: curSign.slice(-14) },
    { label: "Trial → paid", value: `${conv.toFixed(1)}%`, delta: n === 7 ? 6.1 : 2.4, series: [3.6, 3.8, 3.7, 4, 3.9, 4.1, 4.2, 4.4, 4.3, 4.5, 4.6, 4.5, 4.7, 4.8] },
    { label: "Median session", value: n === 7 ? "6m 12s" : "5m 48s", delta: n === 7 ? -3.2 : 1.8, series: [6.1, 5.9, 6.3, 6.2, 5.8, 6, 6.4, 6.2, 6, 5.9, 6.1, 6.3, 6.2, 6.1] },
  ];
}

export function topEvents() {
  const counts = new Map<string, number>();
  for (const e of events) counts.set(e.name, (counts.get(e.name) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count: count * 37 }))
    .sort((a, b) => b.count - a.count);
}

export function breakdown(key: "country" | "device" | "browser") {
  const counts = new Map<string, number>();
  for (const e of events) counts.set(e[key], (counts.get(e[key]) ?? 0) + 1);
  const total = events.length;
  return [...counts.entries()]
    .map(([name, count]) => ({ name, share: Math.round((count / total) * 1000) / 10 }))
    .sort((a, b) => b.share - a.share);
}

/* ------------------------------------------------------------------ funnels */

export interface Funnel {
  id: string;
  name: string;
  description: string;
  steps: { name: string; users: number; medianTime?: string }[];
}

export const funnels: Funnel[] = [
  {
    id: "activation",
    name: "Activation",
    description: "From first visit to a shared document, last 30 days.",
    steps: [
      { name: "Landing page viewed", users: 48210 },
      { name: "Signed up", users: 9734, medianTime: "3m" },
      { name: "Document created", users: 6912, medianTime: "8m" },
      { name: "Invite sent", users: 3108, medianTime: "1d 4h" },
      { name: "Document shared", users: 2214, medianTime: "2d 6h" },
    ],
  },
  {
    id: "upgrade",
    name: "Upgrade",
    description: "Free workspaces that reached a paid plan, last 90 days.",
    steps: [
      { name: "Workspace created", users: 12840 },
      { name: "Hit a free-plan limit", users: 4120, medianTime: "9d" },
      { name: "Pricing page viewed", users: 2987, medianTime: "2h" },
      { name: "Checkout started", users: 1033, medianTime: "14m" },
      { name: "Plan upgraded", users: 612, medianTime: "3m" },
    ],
  },
  {
    id: "search",
    name: "Search success",
    description: "Searches that led to opening a result, last 7 days.",
    steps: [
      { name: "Search performed", users: 18420 },
      { name: "Result clicked", users: 13110, medianTime: "6s" },
      { name: "Document opened > 30s", users: 9870, medianTime: "31s" },
    ],
  },
];

export const NOW = FAKE_NOW;
