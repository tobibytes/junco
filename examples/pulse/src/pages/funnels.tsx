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
  DialogTrigger,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "junco";
import { PageContainer, PageHeader } from "@junco/blocks/app";
import type { PageProps } from "../app";
import { EVENT_TYPES, funnels as initialFunnels, type Funnel } from "../data";
import { PlusIcon } from "../icons";

const nf = new Intl.NumberFormat("en-US");
const pct = (n: number) => `${(Math.round(n * 1000) / 10).toFixed(1)}%`;

function FunnelChart({ funnel }: { funnel: Funnel }) {
  const first = funnel.steps[0]!.users;
  const last = funnel.steps[funnel.steps.length - 1]!.users;
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-border bg-border">
        {[
          ["Entered", nf.format(first)],
          ["Converted", nf.format(last)],
          ["Overall conversion", pct(last / first)],
        ].map(([label, value]) => (
          <div key={label} className="bg-card p-4">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      <ol className="grid gap-3" aria-label={`${funnel.name} funnel steps`}>
        {funnel.steps.map((step, i) => {
          const prev = i === 0 ? step.users : funnel.steps[i - 1]!.users;
          const ofTotal = step.users / first;
          const fromPrev = step.users / prev;
          const dropped = prev - step.users;
          return (
            <li key={step.name} className="grid gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span className="grid size-5 place-items-center rounded-pill bg-muted font-mono text-[11px] text-muted-foreground">
                    {i + 1}
                  </span>
                  {step.name}
                </span>
                <span className="flex items-center gap-3 text-muted-foreground tabular-nums">
                  {step.medianTime && <span className="text-xs max-sm:hidden">median {step.medianTime}</span>}
                  <span className="font-medium text-foreground">{nf.format(step.users)}</span>
                  <span className="w-14 text-right">{pct(ofTotal)}</span>
                </span>
              </div>
              <div className="relative h-9 overflow-hidden rounded-control bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-control bg-primary transition-[width] duration-slow ease-standard"
                  style={{ width: `${Math.max(ofTotal * 100, 1.5)}%` }}
                  aria-hidden
                />
              </div>
              {i > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground">{pct(fromPrev)}</span> continued from the previous step ·{" "}
                  <span className="text-destructive-text">{nf.format(dropped)} dropped off</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function NewFunnelDialog({ onCreate }: { onCreate: (f: Funnel) => void }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [steps, setSteps] = React.useState<string[]>(["Signed up", "Document created"]);
  const [error, setError] = React.useState<string>();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Give the funnel a name.");
    let users = 12000;
    onCreate({
      id: `f_${Date.now()}`,
      name: name.trim(),
      description: `${steps.length} steps, last 30 days.`,
      steps: steps.map((s, i) => ({ name: s, users: i === 0 ? users : (users = Math.round(users * (0.45 + i * 0.1))) })),
    });
    toast.success("Funnel created", { description: `“${name.trim()}” is calculating now.` });
    setOpen(false);
    setName("");
    setError(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-4" /> New funnel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-5" noValidate>
          <DialogHeader>
            <DialogTitle>New funnel</DialogTitle>
            <DialogDescription>Pick the events people should do, in order.</DialogDescription>
          </DialogHeader>
          <Field label="Name" error={error} isRequired>
            <Input value={name} onChange={(e) => (setName(e.target.value), setError(undefined))} placeholder="e.g. Onboarding" autoFocus />
          </Field>
          <div className="grid gap-3">
            {steps.map((step, i) => (
              <Field key={i} label={`Step ${i + 1}`}>
                <Select value={step} onValueChange={(v) => setSteps((s) => s.map((x, j) => (j === i ? v : x)))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.name} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ))}
            {steps.length < 5 && (
              <Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={() => setSteps((s) => [...s, "Plan upgraded"])}>
                <PlusIcon className="size-4" /> Add step
              </Button>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create funnel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FunnelsPage(_: PageProps) {
  const [list, setList] = React.useState<Funnel[]>(initialFunnels);
  const [active, setActive] = React.useState(initialFunnels[0]!.id);

  return (
    <PageContainer>
      <PageHeader
        title="Funnels"
        description="Where people drop off between the steps that matter."
        actions={
          <NewFunnelDialog
            onCreate={(f) => {
              setList((l) => [...l, f]);
              setActive(f.id);
            }}
          />
        }
      />
      <Tabs value={active} onValueChange={setActive}>
        <TabsList aria-label="Funnels">
          {list.map((f) => (
            <TabsTrigger key={f.id} value={f.id}>
              {f.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {list.map((f) => (
          <TabsContent key={f.id} value={f.id}>
            <Card>
              <CardHeader>
                <CardTitle as="h2" className="flex items-center gap-2">
                  {f.name}
                  <Badge variant="outline">{f.steps.length} steps</Badge>
                </CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <FunnelChart funnel={f} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </PageContainer>
  );
}
