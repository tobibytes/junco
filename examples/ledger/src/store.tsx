import * as React from "react";
import {
  ACCOUNTS,
  categoryById,
  CURRENT_MONTH,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
  lastMonths,
  monthKey,
  SPEND_CATEGORIES,
  type Account,
  type CategoryId,
  type Goal,
  type Transaction,
} from "./data";

interface LedgerState {
  transactions: Transaction[];
  goals: Goal[];
  accounts: Account[];
  addTransaction: (t: Omit<Transaction, "id">) => Transaction;
  removeTransaction: (id: string) => void;
  contribute: (goalId: string, amount: number) => Goal | undefined;
  /** Opens the shared "Add transaction" dialog from anywhere. */
  openAdd: () => void;
  addOpen: boolean;
  setAddOpen: (open: boolean) => void;
}

const LedgerContext = React.createContext<LedgerState | null>(null);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = React.useState(INITIAL_TRANSACTIONS);
  const [goals, setGoals] = React.useState(INITIAL_GOALS);
  const [addOpen, setAddOpen] = React.useState(false);

  // Account balances follow transactions added in this session.
  const accounts = React.useMemo(() => {
    const extra = new Map<string, number>();
    for (const t of transactions) if (!INITIAL_TRANSACTIONS.includes(t)) extra.set(t.accountId, (extra.get(t.accountId) ?? 0) + t.amount);
    const contributed = new Map<string, number>();
    for (const g of goals) {
      const initial = INITIAL_GOALS.find((i) => i.id === g.id);
      contributed.set(g.accountId, (contributed.get(g.accountId) ?? 0) + (g.saved - (initial?.saved ?? 0)));
    }
    return ACCOUNTS.map((a) => ({
      ...a,
      balance: Math.round((a.balance + (extra.get(a.id) ?? 0) + (contributed.get(a.id) ?? 0) - (a.id === "checking" ? [...contributed.values()].reduce((x, y) => x + y, 0) : 0)) * 100) / 100,
    }));
  }, [transactions, goals]);

  const value = React.useMemo<LedgerState>(
    () => ({
      transactions,
      goals,
      accounts,
      addTransaction: (t) => {
        const tx = { ...t, id: `tx_new_${Date.now().toString(36)}` };
        setTransactions((list) => [tx, ...list].sort((a, b) => b.date.localeCompare(a.date)));
        return tx;
      },
      removeTransaction: (id) => setTransactions((list) => list.filter((t) => t.id !== id)),
      contribute: (goalId, amount) => {
        const goal = goals.find((g) => g.id === goalId);
        if (!goal) return undefined;
        const updated = { ...goal, saved: Math.round((goal.saved + amount) * 100) / 100 };
        setGoals((list) => list.map((g) => (g.id === goalId ? updated : g)));
        return updated;
      },
      openAdd: () => setAddOpen(true),
      addOpen,
      setAddOpen,
    }),
    [transactions, goals, accounts, addOpen],
  );
  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const ctx = React.useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used inside LedgerProvider");
  return ctx;
}

/* ------------------------------------------------------------------ derived numbers */

export function spentByCategory(transactions: Transaction[], month = CURRENT_MONTH) {
  const out = new Map<CategoryId, number>();
  for (const t of transactions) {
    if (monthKey(t.date) !== month || t.amount >= 0) continue;
    if (!categoryById[t.category] || categoryById[t.category].budget === 0) continue;
    out.set(t.category, (out.get(t.category) ?? 0) - t.amount);
  }
  return SPEND_CATEGORIES.map((c) => ({ ...c, spent: Math.round((out.get(c.id) ?? 0) * 100) / 100 }));
}

export function monthTotals(transactions: Transaction[], months = lastMonths(6)) {
  return months.map((m) => {
    let income = 0;
    let spent = 0;
    let saved = 0;
    for (const t of transactions) {
      if (monthKey(t.date) !== m) continue;
      if (t.category === "income") income += t.amount;
      else if (t.category === "savings") saved -= t.amount;
      else spent -= t.amount;
    }
    return { month: m, income: Math.round(income), spent: Math.round(spent), saved: Math.round(saved) };
  });
}

/** Average monthly essentials (rent, groceries, transport, health, subscriptions), for the emergency fund. */
export function monthlyEssentials(transactions: Transaction[]) {
  const essentials: CategoryId[] = ["rent", "groceries", "transport", "health", "subscriptions"];
  const months = lastMonths(4).slice(0, 3); // last three full months
  let total = 0;
  for (const t of transactions) if (months.includes(monthKey(t.date)) && essentials.includes(t.category)) total -= t.amount;
  return Math.round(total / months.length);
}
