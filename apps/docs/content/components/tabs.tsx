"use client";

import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "junco";
import type { ComponentDoc } from "./types";

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">{children}</div>;
}

export const doc: ComponentDoc = {
  imports: ["Tabs", "TabsList", "TabsTrigger", "TabsContent"],
  playground: {
    controls: [{ name: "variant", type: "select", options: ["line", "segmented"], default: "line" }],
    render: (v) => (
      <Tabs key={String(v.variant)} defaultValue="overview" variant={v.variant as "line"} className="w-full max-w-md">
        <TabsList aria-label="Project">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Panel>Deploys, traffic and errors at a glance.</Panel>
        </TabsContent>
        <TabsContent value="activity">
          <Panel>Everything your team did this week.</Panel>
        </TabsContent>
        <TabsContent value="settings">
          <Panel>Domains, environment variables and members.</Panel>
        </TabsContent>
      </Tabs>
    ),
    code: (v) => `<Tabs defaultValue="overview"${v.variant !== "line" ? ` variant="${v.variant}"` : ""}>
  <TabsList aria-label="Project">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="activity">...</TabsContent>
  <TabsContent value="settings">...</TabsContent>
</Tabs>`,
  },
  usage: {
    installed: `<Tabs defaultValue="overview">
  <TabsList aria-label="Project">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="activity">...</TabsContent>
</Tabs>`,
    semantic: `<!-- Styles only: use for page navigation with links -->
<nav class="tabs" aria-label="Project">
  <a class="tab" href="/overview" aria-current="page">Overview</a>
  <a class="tab" href="/activity">Activity</a>
</nav>`,
  },
  examples: [
    {
      title: "With counts",
      description: "Badges sit inside triggers. Disabled tabs are skipped by the arrow keys.",
      Preview: () => (
        <Tabs defaultValue="open" className="w-full max-w-md">
          <TabsList aria-label="Issues">
            <TabsTrigger value="open">
              Open <Badge className="h-5 px-1.5">12</Badge>
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed <Badge className="h-5 px-1.5">48</Badge>
            </TabsTrigger>
            <TabsTrigger value="archived" disabled>
              Archived
            </TabsTrigger>
          </TabsList>
          <TabsContent value="open">
            <Panel>12 open issues.</Panel>
          </TabsContent>
          <TabsContent value="closed">
            <Panel>48 closed issues.</Panel>
          </TabsContent>
        </Tabs>
      ),
      code: `<TabsTrigger value="open">
  Open <Badge className="h-5 px-1.5">12</Badge>
</TabsTrigger>
<TabsTrigger value="archived" disabled>Archived</TabsTrigger>`,
    },
  ],
  props: [
    {
      component: "Tabs",
      props: [
        { name: "value / defaultValue", type: "string", description: "Controlled or initial tab." },
        { name: "onValueChange", type: "(value: string) => void", description: "Called when the tab changes." },
        { name: "variant", type: '"line" | "segmented"', default: '"line"', description: "Underline for page sections, segmented for compact view switches." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Which arrow keys move between tabs." },
        { name: "activationMode", type: '"automatic" | "manual"', default: '"automatic"', description: "Manual means arrows move focus and Enter/Space activates." },
      ],
    },
    { component: "TabsTrigger", props: [{ name: "value", type: "string", description: "Required. Matches a TabsContent." }, { name: "disabled", type: "boolean", default: "false", description: "Skipped by the keyboard." }] },
    { component: "TabsContent", props: [{ name: "value", type: "string", description: "Required. Shown when its trigger is active." }] },
  ],
  keyboard: [
    { keys: ["Tab"], action: "Moves focus to the active tab, then into the panel." },
    { keys: ["←", "→"], action: "Moves to the previous or next tab." },
    { keys: ["Home", "End"], action: "Moves to the first or last tab." },
  ],
  a11y: [
    "Follows the WAI-ARIA tabs pattern: tablist, tab and tabpanel roles with aria-selected and aria-controls.",
    "Give the TabsList an aria-label that says what the tabs switch between.",
    "The active tab is marked by an underline or raised surface and bolder text, not color alone.",
  ],
};
