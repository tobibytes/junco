import { createRandom, FAKE_NOW } from "@junco/blocks/fake";

/** Seeded so Ledger looks the same on every load. "Today" is FAKE_NOW (Oct 25, 2026). */

export const TODAY = FAKE_NOW;
const DAY = 86_400_000;

export const CATEGORIES = [
  { id: "rent", label: "Rent", budget: 1200 },
  { id: "groceries", label: "Groceries", budget: 340 },
  { id: "dining", label: "Dining out", budget: 180 },
  { id: "transport", label: "Transport", budget: 110 },
  { id: "shopping", label: "Shopping", budget: 220 },
  { id: "subscriptions", label: "Subscriptions", budget: 55 },
  { id: "fun", label: "Going out", budget: 150 },
  { id: "health", label: "Health", budget: 60 },
  { id: "income", label: "Income", budget: 0 },
  { id: "savings", label: "Transfer to savings", budget: 0 },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  (typeof CATEGORIES)[number]
>;
export const SPEND_CATEGORIES = CATEGORIES.filter((c) => c.budget > 0);

export interface Account {
  id: string;
  name: string;
  institution: string;
  kind: "checking" | "savings" | "investment" | "credit";
  balance: number;
  /** e.g. "3.80% APY" */
  note?: string;
}

export const ACCOUNTS: Account[] = [
  { id: "checking", name: "Everyday checking", institution: "Chase", kind: "checking", balance: 2418.32 },
  { id: "emergency", name: "Emergency fund", institution: "Capital One 360", kind: "savings", balance: 6450, note: "3.80% APY" },
  { id: "hysa", name: "High-yield savings", institution: "Axos", kind: "savings", balance: 3120.55, note: "4.21% APY" },
  { id: "brokerage", name: "Brokerage", institution: "Fidelity", kind: "investment", balance: 4860.2, note: "VOO · MSFT · NVDA" },
  { id: "card", name: "Credit card", institution: "Discover it", kind: "credit", balance: -312.4, note: "Due Nov 3" },
];

export interface Transaction {
  id: string;
  description: string;
  /** Positive for income, negative for spending. */
  amount: number;
  category: CategoryId;
  accountId: string;
  date: string; // YYYY-MM-DD
}

const MERCHANTS: Partial<Record<CategoryId, { name: string; min: number; max: number }[]>> = {
  groceries: [
    { name: "Trader Joe's", min: 28, max: 74 },
    { name: "Whole Foods", min: 18, max: 66 },
    { name: "H Mart", min: 22, max: 58 },
  ],
  dining: [
    { name: "Chipotle", min: 11, max: 16 },
    { name: "Sweetgreen", min: 13, max: 18 },
    { name: "Suya Spot", min: 15, max: 32 },
    { name: "Blue Bottle", min: 5, max: 9 },
  ],
  transport: [
    { name: "Uber", min: 9, max: 28 },
    { name: "Metro card reload", min: 20, max: 40 },
  ],
  shopping: [
    { name: "Uniqlo", min: 29, max: 89 },
    { name: "Amazon", min: 12, max: 64 },
    { name: "New Balance", min: 90, max: 140 },
  ],
  fun: [
    { name: "AMC Theatres", min: 14, max: 32 },
    { name: "Bowlero", min: 25, max: 45 },
  ],
  health: [{ name: "Planet Fitness", min: 25, max: 25 }],
};

const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

function seedTransactions(): Transaction[] {
  const r = createRandom(1717);
  const out: Transaction[] = [];
  let n = 0;
  const add = (t: Omit<Transaction, "id">) => out.push({ ...t, id: `tx_${(n++).toString(36)}` });
  const round = (x: number) => Math.round(x * 100) / 100;

  // Six months back from today.
  for (let d = 0; d < 182; d++) {
    const t = TODAY - d * DAY;
    const date = new Date(t);
    const dom = date.getUTCDate();
    const dow = date.getUTCDay();
    if (dom === 1) add({ description: "Rent · Parkview Apartments", amount: -1200, category: "rent", accountId: "checking", date: iso(t) });
    // Paid on the 7th and 21st, so the current month already has both paychecks.
    if (dom === 7 || dom === 21) add({ description: "Paycheck · Northwind", amount: 2050, category: "income", accountId: "checking", date: iso(t) });
    if (dom === 22) {
      const month = date.getUTCMonth();
      add({ description: "Transfer to emergency fund", amount: -(300 + (month % 3) * 100), category: "savings", accountId: "checking", date: iso(t) });
    }
    if (dom === 3) add({ description: "Spotify", amount: -11.99, category: "subscriptions", accountId: "card", date: iso(t) });
    if (dom === 9) add({ description: "iCloud+", amount: -2.99, category: "subscriptions", accountId: "card", date: iso(t) });
    if (dom === 12) add({ description: "Netflix", amount: -15.49, category: "subscriptions", accountId: "card", date: iso(t) });
    if (dom === 5) add({ description: "Planet Fitness", amount: -25, category: "health", accountId: "card", date: iso(t) });
    if (dow === 0 || dow === 3) {
      const m = r.pick(MERCHANTS.groceries!);
      add({ description: m.name, amount: -round(m.min + r.next() * (m.max - m.min)), category: "groceries", accountId: "card", date: iso(t) });
    }
    if (r.next() < 0.42) {
      const m = r.pick(MERCHANTS.dining!);
      add({ description: m.name, amount: -round(m.min + r.next() * (m.max - m.min)), category: "dining", accountId: "card", date: iso(t) });
    }
    if (r.next() < 0.22) {
      const m = r.pick(MERCHANTS.transport!);
      add({ description: m.name, amount: -round(m.min + r.next() * (m.max - m.min)), category: "transport", accountId: "card", date: iso(t) });
    }
    if (r.next() < 0.07) {
      const m = r.pick(MERCHANTS.shopping!);
      add({ description: m.name, amount: -round(m.min + r.next() * (m.max - m.min)), category: "shopping", accountId: "card", date: iso(t) });
    }
    if ((dow === 5 || dow === 6) && r.next() < 0.35) {
      const m = r.pick(MERCHANTS.fun!);
      add({ description: m.name, amount: -round(m.min + r.next() * (m.max - m.min)), category: "fun", accountId: "card", date: iso(t) });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export const INITIAL_TRANSACTIONS = seedTransactions();

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  /** YYYY-MM */
  by?: string;
  accountId: string;
}

export const INITIAL_GOALS: Goal[] = [
  { id: "emergency", name: "Emergency fund", target: 11400, saved: 6450, accountId: "emergency" },
  { id: "laptop", name: "New laptop", target: 2000, saved: 1240, by: "2027-01", accountId: "hysa" },
  { id: "car", name: "Car down payment", target: 5000, saved: 1150, by: "2027-08", accountId: "hysa" },
  { id: "seattle", name: "Summer in Seattle", target: 1200, saved: 730, by: "2027-05", accountId: "hysa" },
  { id: "ps5", name: "PS5 Pro", target: 550, saved: 410, by: "2026-12", accountId: "hysa" },
];

/** Money in USD with cents only when there are cents. */
export function usd(v: number, opts: { sign?: boolean; cents?: boolean } = {}) {
  const abs = Math.abs(v);
  const s = abs.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.cents === false ? 0 : abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: opts.cents === false ? 0 : 2,
  });
  if (v < 0) return `−${s}`;
  return opts.sign && v > 0 ? `+${s}` : s;
}

export const monthKey = (date: string) => date.slice(0, 7);
export const CURRENT_MONTH = iso(TODAY).slice(0, 7);

export function monthLabel(key: string, style: "short" | "long" = "short") {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, 1)).toLocaleDateString("en-US", { month: style, timeZone: "UTC" });
}

export function lastMonths(count: number) {
  const [y, m] = CURRENT_MONTH.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y!, m! - 1 - (count - 1 - i), 1));
    return d.toISOString().slice(0, 7);
  });
}

export function dayLabel(date: string) {
  const diff = Math.round((Date.parse(iso(TODAY)) - Date.parse(date)) / DAY);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export const todayIso = () => iso(TODAY);
