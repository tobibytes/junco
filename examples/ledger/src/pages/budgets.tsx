import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@junco/react";
import { Reveal } from "@junco/motion";
import { CURRENT_MONTH, monthLabel, TODAY, usd } from "../data";
import { spentByCategory, useLedger } from "../store";
import { CategoryIcon, Meter } from "../ui";

function daysLeftInMonth() {
  const d = new Date(TODAY);
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return end - d.getUTCDate() + 1;
}

export function BudgetsPage() {
  const { transactions } = useLedger();
  const cats = spentByCategory(transactions).sort((a, b) => b.spent / b.budget - a.spent / a.budget);
  const budget = cats.reduce((n, c) => n + c.budget, 0);
  const spent = cats.reduce((n, c) => n + c.spent, 0);
  const left = budget - spent;
  const days = daysLeftInMonth();
  const over = cats.filter((c) => c.spent > c.budget);

  return (
    <div className="grid gap-6 md:gap-8">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
        <p className="text-sm text-muted-foreground">
          {monthLabel(CURRENT_MONTH, "long")} · {days} days left
        </p>
      </header>

      <Card>
        <CardContent className="grid gap-5 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">{usd(spent, { cents: false })}</span>
              <span className="text-sm text-muted-foreground">spent of {usd(budget, { cents: false })}</span>
            </div>
            <Meter value={spent} max={budget} label="Total budget used" size="lg" tone={left < 0 ? "danger" : spent / budget > 0.85 ? "warning" : "primary"} />
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border text-sm sm:w-80">
            <div className="bg-card p-3">
              <div className="text-xs text-muted-foreground">{left >= 0 ? "Left to spend" : "Over budget"}</div>
              <div className={left >= 0 ? "mt-0.5 font-semibold tabular-nums" : "mt-0.5 font-semibold text-destructive-text tabular-nums"}>{usd(Math.abs(left), { cents: false })}</div>
            </div>
            <div className="bg-card p-3">
              <div className="text-xs text-muted-foreground">Safe per day</div>
              <div className="mt-0.5 font-semibold tabular-nums">{usd(Math.max(0, left) / days, { cents: false })}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {over.length > 0 && (
        <p className="rounded-card border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <span className="font-medium">Heads up:</span> {over.map((c) => c.label).join(" and ")}{" "}
          {over.length === 1 ? "is" : "are"} over budget this month.
        </p>
      )}

      <Reveal stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => {
          const ratio = c.spent / c.budget;
          const isExact = Math.abs(c.spent - c.budget) < 0.5; // fixed costs like rent land exactly on budget
          const isOver = ratio > 1 && !isExact;
          const isClose = !isExact && !isOver && ratio > 0.85;
          const tone = isOver ? "danger" : isClose ? "warning" : "primary";
          return (
            <Card key={c.id}>
              <CardHeader className="flex items-center gap-3">
                <CategoryIcon category={c.id} />
                <div className="grid min-w-0 flex-1 gap-0.5">
                  <CardTitle as="h2" className="truncate text-sm">{c.label}</CardTitle>
                  <CardDescription className="text-xs tabular-nums">
                    {usd(c.spent, { cents: false })} of {usd(c.budget, { cents: false })}
                  </CardDescription>
                </div>
                {isOver ? (
                  <Badge color="danger" hasDot>
                    Over
                  </Badge>
                ) : isClose ? (
                  <Badge color="warning" hasDot>
                    Close
                  </Badge>
                ) : null}
              </CardHeader>
              <CardContent className="grid gap-2">
                <Meter value={c.spent} max={c.budget} label={`${c.label} budget used`} tone={tone} />
                <p className="text-xs text-muted-foreground tabular-nums">
                  {isOver ? (
                    <span className="text-destructive-text">{usd(c.spent - c.budget, { cents: false })} over</span>
                  ) : isExact ? (
                    <>Paid in full</>
                  ) : (
                    <>{usd(c.budget - c.spent, { cents: false })} left</>
                  )}{" "}
                  · {Math.round(ratio * 100)}% used
                </p>
              </CardContent>
            </Card>
          );
        })}
      </Reveal>
    </div>
  );
}
