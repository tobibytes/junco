/**
 * Deterministic fake data for pages and demos. The same seed always gives the same data, so
 * server and client render the same thing and screenshots stay stable.
 */

/** Mulberry32: tiny, fast, good enough for fake data. */
export function createRandom(seed = 1) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min;
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)]!;
  return { next, int, pick };
}

const FIRST = ["Ada", "Grace", "Alan", "Tobi", "Maya", "Leo", "Zara", "Kenji", "Amara", "Noah", "Ines", "Ravi", "Chloe", "Diego", "Fatima", "Jonah", "Priya", "Sam", "Yuki", "Elena"];
const LAST = ["Lovelace", "Hopper", "Turing", "Olajide", "Chen", "Okafor", "Silva", "Novak", "Haddad", "Kim", "Garcia", "Patel", "Müller", "Rossi", "Nakamura", "Adeyemi", "Larsen", "Costa", "Ibrahim", "Walsh"];
const COMPANIES = ["Northwind", "Acme Co", "Globex", "Initech", "Umbrella", "Hooli", "Stark Labs", "Wayne Tech", "Pied Piper", "Vandelay", "Soylent", "Cyberdyne", "Tyrell", "Wonka", "Monarch"];
const ROLES = ["Owner", "Admin", "Editor", "Member", "Viewer"] as const;
const PLANS = ["Starter", "Pro", "Business", "Enterprise"] as const;

export interface FakePerson {
  id: string;
  name: string;
  email: string;
  role: (typeof ROLES)[number];
  company: string;
  joinedAt: string;
  lastActiveAt: string;
}

const DAY = 86_400_000;
/** A fixed "now" so fake data never depends on the clock. */
export const FAKE_NOW = Date.UTC(2026, 9, 25, 15, 0, 0);

export function fakePeople(count = 12, seed = 1): FakePerson[] {
  const r = createRandom(seed);
  return Array.from({ length: count }, (_, i) => {
    const first = r.pick(FIRST);
    const last = r.pick(LAST);
    const company = r.pick(COMPANIES);
    return {
      id: `usr_${(seed * 1000 + i).toString(36)}`,
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase().normalize("NFD").replace(/[^\w.]/g, "") + `@${company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
      role: i === 0 ? "Owner" : r.pick(ROLES.slice(1)),
      company,
      joinedAt: new Date(FAKE_NOW - r.int(20, 900) * DAY).toISOString(),
      lastActiveAt: new Date(FAKE_NOW - r.int(0, 20 * 60) * 60_000).toISOString(),
    };
  });
}

export interface FakeCompany {
  id: string;
  name: string;
  plan: (typeof PLANS)[number];
  mrr: number;
  seats: number;
}

export function fakeCompanies(count = 8, seed = 2): FakeCompany[] {
  const r = createRandom(seed);
  return Array.from({ length: count }, (_, i) => {
    const plan = r.pick(PLANS);
    const seats = plan === "Enterprise" ? r.int(80, 400) : plan === "Business" ? r.int(15, 80) : r.int(1, 15);
    const perSeat = { Starter: 8, Pro: 16, Business: 28, Enterprise: 45 }[plan];
    return { id: `org_${i}`, name: COMPANIES[i % COMPANIES.length]!, plan, seats, mrr: seats * perSeat };
  });
}

/** A smooth-ish random walk, for charts and sparklines. */
export function fakeSeries(points = 30, { seed = 3, start = 100, volatility = 0.08, trend = 0.01 } = {}): number[] {
  const r = createRandom(seed);
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < points; i++) {
    v = Math.max(0, v * (1 + trend + (r.next() - 0.5) * volatility));
    out.push(Math.round(v * 100) / 100);
  }
  return out;
}

/** ISO dates for the last `days` days ending at FAKE_NOW. */
export function fakeDays(days = 30): string[] {
  return Array.from({ length: days }, (_, i) => new Date(FAKE_NOW - (days - 1 - i) * DAY).toISOString().slice(0, 10));
}

export const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);

/** "3m ago", "2h ago", "5d ago", relative to FAKE_NOW by default. */
export function timeAgo(iso: string, now = FAKE_NOW): string {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 30 * 86_400) return `${Math.floor(s / 86_400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
