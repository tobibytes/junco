import * as React from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  toast,
} from "junco";
import { confetti, Reveal } from "@junco/motion";
import { ACCOUNTS, monthLabel, usd, type Goal } from "../data";
import { goalIcon, PlusIcon, SparkleIcon } from "../icons";
import { monthlyEssentials, useLedger } from "../store";
import { Meter } from "../ui";

function AddMoneyDialog({ goal, open, onOpenChange }: { goal: Goal | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { contribute } = useLedger();
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string>();
  const remaining = goal ? Math.max(0, goal.target - goal.saved) : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    const n = Number(amount.replace(/[$,]/g, ""));
    if (!amount.trim() || Number.isNaN(n)) return setError("Enter an amount, like 50");
    if (n <= 0) return setError("The amount has to be more than $0");
    if (n > 5000) return setError("Transfers over $5,000 need a bank confirmation");
    const updated = contribute(goal.id, n);
    onOpenChange(false);
    setAmount("");
    if (updated && updated.saved >= updated.target && goal.saved < goal.target) {
      void confetti();
      toast.success(`${goal.name} is fully funded`, { description: "Nice work. That's a goal done." });
    } else {
      toast.success(`Added ${usd(n)} to ${goal.name}`, {
        description: updated ? `${usd(updated.saved, { cents: false })} of ${usd(updated.target, { cents: false })} saved` : undefined,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setAmount("");
          setError(undefined);
        }
      }}
    >
      <DialogContent size="sm">
        {goal && (
          <form onSubmit={submit} className="grid gap-5" noValidate>
            <DialogHeader>
              <DialogTitle>Add to {goal.name}</DialogTitle>
              <DialogDescription>
                Moves money from Everyday checking to {ACCOUNTS.find((a) => a.id === goal.accountId)?.name}.{" "}
                {remaining > 0 ? `${usd(remaining, { cents: false })} to go.` : "This goal is already funded."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Quick amounts">
              {[25, 50, 100, remaining > 0 ? Math.min(remaining, 500) : 250].map((n, i) => (
                <Button key={`${n}-${i}`} type="button" variant="outline" size="sm" onClick={() => (setAmount(String(n)), setError(undefined))}>
                  {i === 3 && remaining > 0 && remaining <= 500 ? `Finish (${usd(n, { cents: false })})` : usd(n, { cents: false })}
                </Button>
              ))}
            </div>
            <Field label="Amount" error={error}>
              <Input value={amount} onChange={(e) => (setAmount(e.target.value), setError(undefined))} inputMode="decimal" placeholder="0.00" autoFocus />
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add money</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GoalCard({ goal, onAdd }: { goal: Goal; onAdd: () => void }) {
  const GoalIcon = goalIcon[goal.id] ?? SparkleIcon;
  const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  const done = goal.saved >= goal.target;
  return (
    <Card>
      <CardHeader className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-card bg-primary/10 text-primary" aria-hidden>
          <GoalIcon className="size-5" />
        </span>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <CardTitle className="truncate text-base">{goal.name}</CardTitle>
          <CardDescription className="text-xs">{goal.by ? `By ${monthLabel(goal.by, "long")} ${goal.by.slice(0, 4)}` : "No deadline"}</CardDescription>
        </div>
        {done ? (
          <Badge color="success" hasDot>
            Funded
          </Badge>
        ) : (
          <span className="text-sm font-medium tabular-nums">{pct}%</span>
        )}
      </CardHeader>
      <CardContent className="grid gap-3">
        <Meter value={goal.saved} max={goal.target} label={`${goal.name} progress`} tone={done ? "success" : "primary"} />
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm tabular-nums">
            <span className="font-medium">{usd(goal.saved, { cents: false })}</span>
            <span className="text-muted-foreground"> of {usd(goal.target, { cents: false })}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={onAdd} disabled={done} aria-label={`Add money to ${goal.name}`}>
            <PlusIcon className="size-3.5" /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalsPage() {
  const { goals, transactions } = useLedger();
  const [active, setActive] = React.useState<Goal | null>(null);
  const emergency = goals.find((g) => g.id === "emergency")!;
  const rest = goals.filter((g) => g.id !== "emergency");
  const total = goals.reduce((n, g) => n + g.saved, 0);
  const essentials = monthlyEssentials(transactions);
  const covered = emergency.saved / essentials;

  return (
    <div className="grid gap-6 md:gap-8">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
        <p className="text-sm text-muted-foreground tabular-nums">
          {usd(total, { cents: false })} saved across {goals.length} goals
        </p>
      </header>

      <Card className="overflow-hidden">
        <CardContent className="grid gap-6 pt-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div className="grid gap-4">
            <div className="grid gap-1">
              <Badge variant="outline" className="justify-self-start">
                Priority
              </Badge>
              <h2 className="text-xl font-semibold tracking-tight">Emergency fund</h2>
              <p className="text-sm text-muted-foreground">
                Six months of essentials ({usd(essentials, { cents: false })}/mo) so a surprise bill never becomes a crisis.
              </p>
            </div>
            <Meter value={emergency.saved} max={emergency.target} label="Emergency fund progress" size="lg" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm tabular-nums">
                <span className="font-medium">{usd(emergency.saved, { cents: false })}</span>
                <span className="text-muted-foreground"> of {usd(emergency.target, { cents: false })}</span>
              </span>
              <Button size="sm" onClick={() => setActive(emergency)}>
                <PlusIcon className="size-4" /> Add money
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-border bg-border text-center">
            {[
              ["Covered", `${covered.toFixed(1)} mo`],
              ["Monthly", "$400"],
              ["Full by", "Sep 2027"],
            ].map(([k, v]) => (
              <div key={k} className="bg-card px-2 py-4">
                <div className="text-xs text-muted-foreground">{k}</div>
                <div className="mt-1 font-semibold tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Reveal stagger className="grid gap-3 sm:grid-cols-2">
        {rest.map((g) => (
          <GoalCard key={g.id} goal={g} onAdd={() => setActive(g)} />
        ))}
      </Reveal>

      <AddMoneyDialog goal={active} open={active !== null} onOpenChange={(o) => !o && setActive(null)} />
    </div>
  );
}
