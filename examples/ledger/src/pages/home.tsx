import * as React from "react";
import { Badge, Button, Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "junco";
import { AreaChart, BarChart, StatRow } from "@junco/blocks/app";
import { NumberTicker, Reveal } from "@junco/motion";
import { CURRENT_MONTH, dayLabel, lastMonths, monthLabel, usd } from "../data";
import { accountIcon, ArrowRightIcon, LifebuoyIcon, TrendUpIcon } from "../icons";
import { monthlyEssentials, monthTotals, useLedger } from "../store";
import { Amount, CategoryIcon, categoryLabel, Meter, SectionTitle } from "../ui";

const pctChange = (a: number, b: number) => Math.round(((a - b) / Math.max(1, Math.abs(b))) * 1000) / 10;

export function HomePage() {
  const { transactions, accounts, goals, openAdd } = useLedger();
  const months = lastMonths(6);
  const totals = monthTotals(transactions, months);
  const cur = totals[totals.length - 1]!;
  const prev = totals[totals.length - 2]!;

  const netWorth = accounts.reduce((n, a) => n + a.balance, 0);
  // Walk back from today: each earlier month is today's net worth minus what was kept since.
  const worthSeries = React.useMemo(() => {
    const out: number[] = [];
    let w = netWorth;
    for (let i = totals.length - 1; i >= 0; i--) {
      out.unshift(Math.round(w));
      w -= totals[i]!.income - totals[i]!.spent + 120; // what was kept that month, plus small market gains
    }
    return out;
  }, [netWorth, totals]);
  const monthGain = worthSeries[worthSeries.length - 1]! - worthSeries[worthSeries.length - 2]!;

  const savingsRate = cur.income ? Math.round(((cur.income - cur.spent) / cur.income) * 100) : 0;
  const prevRate = prev.income ? Math.round(((prev.income - prev.spent) / prev.income) * 100) : 0;

  const emergency = goals.find((g) => g.id === "emergency")!;
  const essentials = monthlyEssentials(transactions);
  const monthsCovered = emergency.saved / essentials;

  const hour = 15; // the demo's "now" is mid-afternoon
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="grid gap-6 md:gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Sunday, October 25</p>
          <h1 className="text-2xl font-semibold tracking-tight">{greeting}, Tobi</h1>
        </div>
        <Button variant="outline" size="sm" onClick={openAdd} className="max-md:hidden">
          Add transaction
        </Button>
      </header>

      <Reveal stagger className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardDescription>Net worth</CardDescription>
            {/* The number isn't a heading, so it's a plain div styled like one. */}
            <div className="text-4xl leading-tight font-semibold tracking-tight tabular-nums">
              <NumberTicker value={netWorth} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
            </div>
            <CardAction>
              <Badge variant="outline" color="success">
                <TrendUpIcon className="size-3" aria-hidden /> {usd(monthGain, { sign: true, cents: false })} this month
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={worthSeries.map((value, i) => ({ label: monthLabel(months[i]!), value }))}
              label="Net worth, last 6 months"
              height={150}
              xTicks={6}
              formatValue={(v) => usd(v, { cents: false })}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2">
              <LifebuoyIcon className="size-4 text-primary" /> Emergency fund
            </CardTitle>
            <CardDescription>Target: 6 months of essentials ({usd(essentials, { cents: false })}/mo).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">{monthsCovered.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">of 6 months covered</span>
            </div>
            <Meter value={emergency.saved} max={emergency.target} label="Emergency fund progress" size="lg" />
            <div className="flex items-center justify-between text-sm">
              <span className="tabular-nums">
                <span className="font-medium">{usd(emergency.saved, { cents: false })}</span>
                <span className="text-muted-foreground"> of {usd(emergency.target, { cents: false })}</span>
              </span>
              <Button asChild variant="ghost" size="sm">
                <a href="#/goals">
                  Add money <ArrowRightIcon className="size-3.5" />
                </a>
              </Button>
            </div>
            <p className="rounded-card bg-muted/60 p-3 text-xs text-muted-foreground">
              At $400 a month you'll hit 6 months by <span className="font-medium text-foreground">September 2027</span>.
            </p>
          </CardContent>
        </Card>
      </Reveal>

      <StatRow
        variant="cards"
        deltaLabel="vs last month"
        stats={[
          { label: `Spent in ${monthLabel(CURRENT_MONTH, "long")}`, value: usd(cur.spent, { cents: false }), delta: pctChange(cur.spent, prev.spent), isInverse: true, series: totals.map((t) => t.spent) },
          { label: "Moved to savings", value: usd(cur.saved, { cents: false }), delta: pctChange(cur.saved, prev.saved), series: totals.map((t) => t.saved) },
          { label: "Savings rate", value: `${savingsRate}%`, delta: savingsRate - prevRate, series: totals.map((t) => (t.income ? ((t.income - t.spent) / t.income) * 100 : 0)) },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle as="h2">Monthly spending</CardTitle>
            <CardDescription>Everything except rent and savings transfers.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={totals.map((t) => ({ label: monthLabel(t.month), value: Math.max(0, t.spent - 1200) }))}
              label="Spending excluding rent, last 6 months"
              height={200}
              xTicks={6}
              formatValue={(v) => usd(v, { cents: false })}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle as="h2">Accounts</CardTitle>
            <CardDescription>{accounts.length} linked</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid">
              {accounts.map((a) => {
                const AccIcon = accountIcon[a.kind];
                return (
                  <li key={a.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
                    <span className="grid size-9 shrink-0 place-items-center rounded-card bg-muted text-muted-foreground" aria-hidden>
                      <AccIcon className="size-4" />
                    </span>
                    <span className="grid min-w-0 flex-1">
                      <span className="truncate text-sm font-medium">{a.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {a.institution}
                        {a.note ? ` · ${a.note}` : ""}
                      </span>
                    </span>
                    <span className="text-sm font-medium tabular-nums">{usd(a.balance)}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-3">
        <SectionTitle
          action={
            <Button asChild variant="ghost" size="sm">
              <a href="#/activity">
                See all <ArrowRightIcon className="size-3.5" />
              </a>
            </Button>
          }
        >
          Recent activity
        </SectionTitle>
        <Card>
          <ul className="grid px-4 sm:px-5">
            {transactions.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                <CategoryIcon category={t.category} />
                <span className="grid min-w-0 flex-1">
                  <span className="truncate text-sm font-medium">{t.description}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {categoryLabel(t.category)} · {dayLabel(t.date)}
                  </span>
                </span>
                <Amount value={t.amount} className="text-sm" />
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
