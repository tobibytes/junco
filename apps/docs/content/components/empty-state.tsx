"use client";

import { Button, EmptyState } from "junco";
import { FileIcon, PlusIcon, SearchIcon } from "@/components/icons";
import type { ComponentDoc } from "./types";

export const doc: ComponentDoc = {
  imports: ["EmptyState"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "isBordered", type: "boolean", default: true },
      { name: "actions", type: "boolean", default: true },
      { name: "title", type: "text", default: "No invoices yet" },
    ],
    render: (v) => (
      <EmptyState
        className="w-full"
        size={v.size as "md"}
        isBordered={v.isBordered as boolean}
        icon={<FileIcon />}
        title={String(v.title)}
        description="Invoices you send show up here, with their payment status."
        actions={
          v.actions ? (
            <>
              <Button>
                <PlusIcon /> New invoice
              </Button>
              <Button variant="outline">Import</Button>
            </>
          ) : undefined
        }
      />
    ),
    code: (v) => {
      const attrs = [
        v.size !== "md" && `size="${v.size}"`,
        v.isBordered && "isBordered",
        `icon={<FileIcon />}`,
        `title="${v.title}"`,
        `description="Invoices you send show up here, with their payment status."`,
        v.actions &&
          `actions={
    <>
      <Button><PlusIcon /> New invoice</Button>
      <Button variant="outline">Import</Button>
    </>
  }`,
      ].filter(Boolean);
      return `<EmptyState\n  ${attrs.join("\n  ")}\n/>`;
    },
  },
  usage: {
    installed: `<EmptyState
  icon={<InboxIcon />}
  title="No invoices yet"
  description="Invoices you send show up here."
  actions={<Button>New invoice</Button>}
/>`,
    semantic: `<div class="empty empty-bordered">
  <div class="empty-icon"><svg aria-hidden="true"><!-- icon --></svg></div>
  <h3 class="empty-title">No invoices yet</h3>
  <p class="empty-description">Invoices you send show up here.</p>
  <div class="empty-actions"><button class="btn btn-primary">New invoice</button></div>
</div>`,
  },
  examples: [
    {
      title: "No search results",
      description: "Say why it's empty and offer the way out.",
      Preview: () => (
        <EmptyState
          className="w-full"
          size="sm"
          icon={<SearchIcon />}
          title="No results for “northwnd”"
          description="Check the spelling, or search all workspaces."
          actions={
            <Button variant="outline" size="sm">
              Clear search
            </Button>
          }
        />
      ),
      code: `<EmptyState
  size="sm"
  icon={<SearchIcon />}
  title="No results for “northwnd”"
  description="Check the spelling, or search all workspaces."
  actions={<Button variant="outline" size="sm">Clear search</Button>}
/>`,
    },
  ],
  props: [
    {
      component: "EmptyState",
      props: [
        { name: "title", type: "ReactNode", description: "Required. What's empty, in plain words." },
        { name: "description", type: "ReactNode", description: "Why, and what happens next." },
        { name: "icon", type: "ReactNode", description: "A small icon in a bordered tile." },
        { name: "actions", type: "ReactNode", description: "Buttons for the next step. Lead with one primary action." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Padding and type size." },
        { name: "isBordered", type: "boolean", default: "false", description: "A dashed outline, for an area the user can fill." },
        { name: "titleAs", type: '"h2" | "h3" | "h4" | "p"', default: '"h3"', description: "Element for the title, to fit the page outline." },
        { name: "classNames", type: "{ root?, icon?, title?, description?, actions? }", description: "Class overrides for each part." },
      ],
    },
  ],
  a11y: [
    "The title is a heading by default, so the empty state is easy to find with a screen reader.",
    "The icon is decorative; the title and description carry the message.",
  ],
};
