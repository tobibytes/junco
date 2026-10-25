import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Input,
  Kbd,
  Skeleton,
  Spinner,
  useTheme,
  type Motion,
  type Theme,
} from "junco";

const themes: Theme[] = ["light", "dark", "system"];
const motions: Motion[] = ["full", "subtle", "off"];

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-control border border-border bg-surface p-0.5">
      {options.map((option) => (
        <button
          key={option}
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className="h-7 rounded-xs px-2.5 text-xs font-medium text-muted-foreground capitalize transition-colors duration-fast ease-standard hover:text-foreground aria-checked:bg-accent aria-checked:text-foreground"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="animate-rise rounded-card border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}

const invoices = [
  { id: "INV-1042", customer: "Northwind", amount: "$1,280.00", status: "Paid" },
  { id: "INV-1043", customer: "Acme Co", amount: "$640.00", status: "Pending" },
  { id: "INV-1044", customer: "Globex", amount: "$2,115.50", status: "Failed" },
] as const;

const statusColor = { Paid: "success", Pending: "warning", Failed: "danger" } as const;

export function App() {
  const { theme, setTheme, motion, setMotion } = useTheme();
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [handle, setHandle] = useState("taken");
  const handleTaken = handle.trim().toLowerCase() === "taken";

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

  return (
    <main className="mx-auto grid max-w-2xl gap-6 px-4 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Junco + Vite</h1>
          <p className="mt-1 text-sm text-muted-foreground">Installed components from the junco package.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Segmented label="Theme" options={themes} value={theme} onChange={setTheme} />
          <Segmented label="Motion" options={motions} value={motion} onChange={setMotion} />
        </div>
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-2">
          <Button isLoading={saving} onClick={save}>
            {saving ? "Saving" : "Save changes"}
          </Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="outline" size="icon" aria-label="Add item">
            +
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="https://github.com">A link</a>
          </Button>
        </div>
      </Section>

      <Section title="Form">
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="handle" className="text-sm font-medium">
              Handle
            </label>
            <Input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              isInvalid={handleTaken}
              aria-describedby={handleTaken ? "handle-error" : undefined}
            />
            {handleTaken && (
              <p id="handle-error" className="text-xs text-destructive-text">
                That handle is taken. Try another.
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section title="Invoices">
        <ul className="divide-y divide-border">
          {invoices.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium">{inv.customer}</p>
                <p className="font-mono text-xs text-muted-foreground">{inv.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm tabular-nums">{inv.amount}</span>
                <Badge variant="outline" color={statusColor[inv.status]} hasDot>
                  {inv.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Loading">
        <div className="mb-4 flex items-center gap-3">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" />
          <span className="text-sm text-muted-foreground">
            Search with <Kbd title="Command">⌘</Kbd> <Kbd>K</Kbd>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton isLoaded={loaded} className="size-10 rounded-pill">
            <div className="grid size-10 place-items-center rounded-pill bg-primary text-sm font-medium text-primary-foreground">
              TO
            </div>
          </Skeleton>
          <div className="grid flex-1 gap-2">
            <Skeleton isLoaded={loaded} className="h-4 w-1/3">
              <p className="text-sm font-medium">Tobi Olajide</p>
            </Skeleton>
            <Skeleton isLoaded={loaded} className="h-3 w-2/3">
              <p className="text-xs text-muted-foreground">Loaded after 1.5 seconds</p>
            </Skeleton>
          </div>
        </div>
      </Section>
    </main>
  );
}
