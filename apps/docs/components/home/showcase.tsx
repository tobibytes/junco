"use client";

import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Field,
  Input,
  Kbd,
  Label,
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
  Tooltip,
} from "junco";
import * as React from "react";
import { AccentPicker } from "../accent-picker";
import { CopyIcon, PlusIcon, SearchIcon } from "../icons";

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={`flex flex-col rounded-card border border-border bg-card ${className}`}>
      <h3 className="border-b border-border px-5 py-3 text-sm font-medium">{title}</h3>
      <div className="flex-1 p-5">{children}</div>
    </section>
  );
}

function Settings() {
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState("junco-web");
  const invalid = name.trim().length === 0 || /\s/.test(name);
  return (
    <Panel title="Project settings">
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (invalid) return;
          setSaving(true);
          setTimeout(() => setSaving(false), 1400);
        }}
      >
        <Field
          label="Project name"
          description="Used in URLs. No spaces."
          error={invalid ? "Use letters, numbers and dashes." : undefined}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Region">
          <Select defaultValue="iad">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="iad">Washington, D.C. (iad1)</SelectItem>
              <SelectItem value="sfo">San Francisco (sfo1)</SelectItem>
              <SelectItem value="fra">Frankfurt (fra1)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="sc-preview">Preview deployments</Label>
            <p className="text-xs text-muted-foreground">Every branch gets a URL.</p>
          </div>
          <Switch id="sc-preview" defaultChecked />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="sc-protect" defaultChecked />
          <Label htmlFor="sc-protect" className="font-normal">
            Require approval for production
          </Label>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost">
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            {saving ? "Saving" : "Save"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

const deploys = [
  { id: "a1f9c2e", branch: "main", by: "Ada Lovelace", status: "Ready", color: "success", when: "2m ago" },
  { id: "7be03d1", branch: "feat/billing", by: "Grace Hopper", status: "Building", color: "warning", when: "5m ago" },
  { id: "c44e81a", branch: "fix/nav", by: "Alan Turing", status: "Failed", color: "danger", when: "1h ago" },
  { id: "09ad7f3", branch: "main", by: "Katherine Johnson", status: "Ready", color: "success", when: "3h ago" },
] as const;

function Deploys() {
  return (
    <Panel title="Deployments">
      <Tabs defaultValue="all" variant="segmented">
        <TabsList aria-label="Filter deployments">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="prod">Production</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        {["all", "prod", "preview"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <ul className="divide-y divide-border">
              {deploys
                .filter((d) => tab === "all" || (tab === "prod" ? d.branch === "main" : d.branch !== "main"))
                .map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <Avatar name={d.by} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.branch}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {d.id} · {d.when}
                      </p>
                    </div>
                    <Badge variant="outline" color={d.color} hasDot={d.status !== "Building"} className="shrink-0">
                      {d.status === "Building" && <Spinner size="sm" label={null} className="-ml-0.5 size-2.5 border-[1.5px]" />}
                      {d.status}
                    </Badge>
                  </li>
                ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </Panel>
  );
}

function Toolbar() {
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <Panel title="Details">
      <div className="grid gap-4">
        <div className="flex items-center gap-1">
          <Tooltip content="Search" shortcut="/">
            <Button variant="outline" size="icon" aria-label="Search">
              <SearchIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Copy link" shortcut="⌘C">
            <Button variant="outline" size="icon" aria-label="Copy link">
              <CopyIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Invite" shortcut="I">
            <Button variant="outline" size="icon" aria-label="Invite">
              <PlusIcon />
            </Button>
          </Tooltip>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Kbd title="Command">⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </div>
        <Separator />
        <div className="flex items-center gap-3" aria-busy={!loaded}>
          <Skeleton isLoaded={loaded} className="size-10 rounded-pill">
            <Avatar name="Grace Hopper" />
          </Skeleton>
          <div className="grid flex-1 gap-1.5">
            <Skeleton isLoaded={loaded} className="h-4 w-1/2">
              <p className="text-sm font-medium">Grace Hopper</p>
            </Skeleton>
            <Skeleton isLoaded={loaded} className="h-3 w-3/4">
              <p className="text-xs text-muted-foreground">Owner · joined 2024</p>
            </Skeleton>
          </div>
        </div>
        <div className="flex -space-x-2">
          {["Ada Lovelace", "Alan Turing", "Katherine Johnson", "Margaret Hamilton"].map((n) => (
            <Avatar key={n} name={n} size="sm" className="ring-2 ring-card" />
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function Showcase() {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Settings />
      <div className="grid gap-4">
        <Deploys />
        <Toolbar />
      </div>
      <Panel title="Make it yours" className="md:col-span-2 lg:col-span-1">
        <AccentPicker compact />
      </Panel>
    </div>
  );
}
