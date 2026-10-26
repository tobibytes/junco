import { useEffect, useState } from "react";
import { DataDemo, OverlaysDemo } from "./more";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Field,
  Input,
  Kbd,
  Label,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  useTheme,
  type Motion,
  type Theme,
} from "@junco/react";

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
        <button type="button"
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
          <Button asChild variant="ghost" size="sm">
            <a href="https://github.com">GitHub</a>
          </Button>
        </div>
      </Section>

      <Section title="Form">
        <div className="grid gap-4">
          <Field label="Email" description="We only use this for receipts." isRequired>
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field label="Handle" error={handleTaken ? "That handle is taken. Try another." : undefined}>
            <Input value={handle} onChange={(e) => setHandle(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role">
              <Select defaultValue="engineer">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="pm">Product manager</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Team size">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Just me</SelectItem>
                  <SelectItem value="10">2 to 10</SelectItem>
                  <SelectItem value="50">11 to 50</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Bio" description="Grows as you type.">
            <Textarea autoResize placeholder="A sentence or two about you" />
          </Field>
          <Separator />
          <RadioGroup aria-label="Billing" defaultValue="monthly" orientation="horizontal">
            {["monthly", "yearly"].map((v) => (
              <div key={v} className="flex items-center gap-2">
                <Radio value={v} id={`billing-${v}`} />
                <Label htmlFor={`billing-${v}`} className="capitalize">
                  {v}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="terms" defaultChecked />
              <Label htmlFor="terms">Accept terms</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="notify" defaultChecked />
              <Label htmlFor="notify">Email notifications</Label>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Tabs and tooltips">
        <Tabs defaultValue="overview">
          <TabsList aria-label="Project">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                <Avatar name="Ada Lovelace" size="sm" className="ring-2 ring-card" />
                <Avatar name="Grace Hopper" size="sm" className="ring-2 ring-card" />
                <Avatar name="Alan Turing" size="sm" className="ring-2 ring-card" />
              </div>
              <p className="text-sm text-muted-foreground">3 people are working on this.</p>
            </div>
          </TabsContent>
          <TabsContent value="activity">
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          </TabsContent>
          <TabsContent value="settings">
            <Tabs defaultValue="general" variant="segmented">
              <TabsList aria-label="Settings">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <p className="text-sm text-muted-foreground">General settings.</p>
              </TabsContent>
              <TabsContent value="members">
                <p className="text-sm text-muted-foreground">Members settings.</p>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
        <Separator className="my-4" />
        <div className="flex gap-2">
          <Tooltip content="Add item" shortcut="A">
            <Button variant="outline" size="icon" aria-label="Add item">
              +
            </Button>
          </Tooltip>
          <Tooltip content="Copy link">
            <Button variant="outline">Share</Button>
          </Tooltip>
        </div>
      </Section>

      <Section title="Overlays">
        <OverlaysDemo />
      </Section>

      <DataDemo />

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
