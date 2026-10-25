"use client";

import {
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Kbd,
  toast,
} from "junco";
import * as React from "react";
import type { ComponentDoc } from "./types";

const pages = ["Dashboard", "Issues", "Projects", "Settings"];
const actions = [
  { label: "New issue", shortcut: "C" },
  { label: "Invite teammate", shortcut: "I" },
  { label: "Toggle dark mode", shortcut: "D" },
];

function Palette() {
  const [open, setOpen] = React.useState(false);
  const run = (label: string) => {
    setOpen(false);
    toast(label);
  };
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open palette <Kbd>⌘J</Kbd>
      </Button>
      {/* This site already uses ⌘K for its own search, so the demo listens for ⌘J. */}
      <CommandDialog open={open} onOpenChange={setOpen} shortcut="j">
        <CommandInput placeholder="Search pages and actions…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((p) => (
              <CommandItem key={p} onSelect={() => run(`Go to ${p}`)}>
                {p}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            {actions.map((a) => (
              <CommandItem key={a.label} onSelect={() => run(a.label)}>
                {a.label}
                <CommandShortcut>{a.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export const doc: ComponentDoc = {
  imports: ["CommandDialog", "CommandInput", "CommandList", "CommandEmpty", "CommandGroup", "CommandItem", "CommandShortcut"],
  usage: {
    installed: `<CommandDialog>
  <CommandInput placeholder="Search…" />
  <CommandList>
    <CommandEmpty>No results.</CommandEmpty>
    <CommandGroup heading="Pages">
      <CommandItem onSelect={() => go("/settings")}>
        Settings <CommandShortcut>⌘,</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`,
  },
  examples: [
    {
      title: "Command palette",
      description:
        "CommandDialog listens for ⌘K / Ctrl+K on its own. This site already uses ⌘K for search, so this demo sets shortcut=\"j\": click the button or press ⌘J / Ctrl+J. Esc returns focus to where you were.",
      Preview: Palette,
      code: `const [open, setOpen] = useState(false);

<Button variant="outline" onClick={() => setOpen(true)}>
  Search <Kbd>⌘K</Kbd>
</Button>
<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Search pages and actions…" />
  <CommandList>
    <CommandEmpty>No results.</CommandEmpty>
    <CommandGroup heading="Pages">
      {pages.map((p) => (
        <CommandItem key={p} onSelect={() => go(p)}>{p}</CommandItem>
      ))}
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Actions">
      <CommandItem onSelect={newIssue}>
        New issue <CommandShortcut>C</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`,
    },
    {
      title: "Inline",
      description: "Command also works on the page, for pickers and searchable lists.",
      Preview: () => (
        <Command className="w-full max-w-sm rounded-card border border-border">
          <CommandInput placeholder="Find a teammate…" />
          <CommandList>
            <CommandEmpty>Nobody by that name.</CommandEmpty>
            <CommandGroup heading="Team">
              {["Ada Lovelace", "Grace Hopper", "Alan Turing", "Katherine Johnson"].map((n) => (
                <CommandItem key={n}>{n}</CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      ),
      code: `<Command className="rounded-card border border-border">
  <CommandInput placeholder="Find a teammate…" />
  <CommandList>
    <CommandEmpty>Nobody by that name.</CommandEmpty>
    <CommandGroup heading="Team">
      <CommandItem>Ada Lovelace</CommandItem>
      <CommandItem>Grace Hopper</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
    },
  ],
  props: [
    {
      component: "CommandDialog",
      description: "Command inside a Dialog, with a keyboard shortcut. Also takes every Command prop.",
      props: [
        { name: "open", type: "boolean", description: "Controlled open state." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Initial open state when uncontrolled." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when it opens or closes, including from the shortcut." },
        { name: "shortcut", type: "string | null", default: '"k"', description: "Letter that toggles it with ⌘ or Ctrl. null turns the shortcut off." },
        { name: "title", type: "string", default: '"Command palette"', description: "Dialog title for screen readers." },
        { name: "description", type: "string", default: '"Search for a command to run."', description: "Dialog description for screen readers." },
        { name: "classNames", type: "{ content?, command? }", description: "Class overrides for the dialog and the list." },
      ],
    },
    {
      component: "Command",
      description: "The searchable list (cmdk).",
      props: [
        { name: "filter", type: "(value, search) => number", description: "Custom ranking. Return 0 to hide an item." },
        { name: "shouldFilter", type: "boolean", default: "true", description: "Set false when you filter on the server." },
        { name: "loop", type: "boolean", default: "false", description: "Arrow keys wrap from the last item to the first." },
      ],
    },
    {
      component: "CommandItem",
      props: [
        { name: "onSelect", type: "(value: string) => void", description: "Runs on click or Enter." },
        { name: "value", type: "string", description: "Text matched by search. Defaults to the item's text." },
        { name: "keywords", type: "string[]", description: "Extra words that should match this item." },
        { name: "disabled", type: "boolean", description: "Shown but not selectable." },
      ],
    },
  ],
  keyboard: [
    { keys: ["⌘", "K"], action: "Opens or closes CommandDialog (Ctrl+K on Windows and Linux)." },
    { keys: ["↓", "↑"], action: "Moves between results." },
    { keys: ["Enter"], action: "Runs the highlighted result." },
    { keys: ["Esc"], action: "Closes the dialog and returns focus." },
  ],
  a11y: [
    "The input is a combobox that controls a listbox; the highlighted result is announced as you move.",
    "CommandDialog includes a hidden title and description, so screen readers know what opened.",
    "Every action in the palette should also exist somewhere visible: the palette is a shortcut, not the only way.",
  ],
};
