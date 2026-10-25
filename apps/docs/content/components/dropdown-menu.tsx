"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  toast,
} from "@junco/react";
import * as React from "react";
import type { ComponentDoc } from "./types";

function ViewOptions() {
  const [showDone, setShowDone] = React.useState(true);
  const [showArchived, setShowArchived] = React.useState(false);
  const [sort, setSort] = React.useState("updated");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>Show</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={showDone} onCheckedChange={setShowDone}>
          Done issues
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showArchived} onCheckedChange={setShowArchived}>
          Archived
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuRadioItem value="updated">Last updated</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="created">Created</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const doc: ComponentDoc = {
  imports: [
    "DropdownMenu",
    "DropdownMenuTrigger",
    "DropdownMenuContent",
    "DropdownMenuItem",
    "DropdownMenuLabel",
    "DropdownMenuSeparator",
  ],
  playground: {
    controls: [
      { name: "align", type: "select", options: ["start", "center", "end"], default: "start" },
      { name: "shortcuts", type: "boolean", default: true },
      { name: "danger", label: "danger item", type: "boolean", default: true },
    ],
    render: (v) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={v.align as "start"}>
          <DropdownMenuLabel>Project</DropdownMenuLabel>
          <DropdownMenuItem shortcut={v.shortcuts ? "⌘D" : undefined} onSelect={() => toast("Duplicated")}>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem shortcut={v.shortcuts ? "⌘E" : undefined}>Rename</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
          {v.danger && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="danger">Delete</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    code: (v) => `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent${v.align !== "center" ? ` align="${v.align}"` : ""}>
    <DropdownMenuLabel>Project</DropdownMenuLabel>
    <DropdownMenuItem${v.shortcuts ? ' shortcut="⌘D"' : ""} onSelect={duplicate}>Duplicate</DropdownMenuItem>
    <DropdownMenuItem${v.shortcuts ? ' shortcut="⌘E"' : ""}>Rename</DropdownMenuItem>
    <DropdownMenuItem>Share</DropdownMenuItem>${
      v.danger
        ? `
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="danger">Delete</DropdownMenuItem>`
        : ""
    }
  </DropdownMenuContent>
</DropdownMenu>`,
  },
  usage: {
    installed: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Account</DropdownMenuLabel>
    <DropdownMenuItem shortcut="⌘P">Profile</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="danger">Log out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    semantic: `<!-- .menu styles the list. Pair it with the native popover attribute to float it. -->
<button class="btn" popovertarget="options">Options</button>

<ul id="options" popover class="menu popover">
  <li class="menu-title">Project</li>
  <li><button>Duplicate <span class="menu-shortcut">⌘D</span></button></li>
  <li><button>Share</button></li>
  <li class="menu-separator" role="separator"></li>
  <li><button class="menu-danger">Delete</button></li>
</ul>

<!-- The pure-CSS menu has no arrow-key navigation or typeahead; use the installed one for app menus. -->`,
  },
  examples: [
    {
      title: "Checkbox and radio items",
      description: "Toggle settings and pick one option without leaving the menu.",
      Preview: ViewOptions,
      code: `const [showDone, setShowDone] = useState(true);
const [sort, setSort] = useState("updated");

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">View</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuLabel>Show</DropdownMenuLabel>
    <DropdownMenuCheckboxItem checked={showDone} onCheckedChange={setShowDone}>
      Done issues
    </DropdownMenuCheckboxItem>
    <DropdownMenuSeparator />
    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
    <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
      <DropdownMenuRadioItem value="updated">Last updated</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="created">Created</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`,
    },
    {
      title: "Submenu",
      Preview: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Move to</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              <DropdownMenuItem>Inbox</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Project</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Website</DropdownMenuItem>
                  <DropdownMenuItem>Mobile app</DropdownMenuItem>
                  <DropdownMenuItem>Design system</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      code: `<DropdownMenuContent>
  <DropdownMenuItem>Inbox</DropdownMenuItem>
  <DropdownMenuSub>
    <DropdownMenuSubTrigger>Project</DropdownMenuSubTrigger>
    <DropdownMenuSubContent>
      <DropdownMenuItem>Website</DropdownMenuItem>
      <DropdownMenuItem>Mobile app</DropdownMenuItem>
    </DropdownMenuSubContent>
  </DropdownMenuSub>
</DropdownMenuContent>`,
    },
  ],
  props: [
    {
      component: "DropdownMenu",
      props: [
        { name: "open", type: "boolean", description: "Controlled open state." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the menu opens or closes." },
        { name: "modal", type: "boolean", default: "true", description: "Blocks the rest of the page while open." },
      ],
    },
    {
      component: "DropdownMenuContent",
      props: [
        { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment against the trigger." },
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Preferred side; flips when there isn't room." },
        { name: "sideOffset", type: "number", default: "6", description: "Gap from the trigger in px." },
      ],
    },
    {
      component: "DropdownMenuItem",
      props: [
        { name: "variant", type: '"default" | "danger"', default: '"default"', description: "danger for destructive actions." },
        { name: "shortcut", type: "string", description: "Trailing keyboard hint. Visual only: wire the shortcut yourself." },
        { name: "inset", type: "boolean", description: "Indent to line up with checkbox and radio items." },
        { name: "onSelect", type: "(event) => void", description: "Runs on click or Enter. event.preventDefault() keeps the menu open." },
        { name: "disabled", type: "boolean", description: "Skipped by the keyboard and not selectable." },
        { name: "asChild", type: "boolean", description: "Render your own element (a router Link) as the item." },
      ],
    },
    {
      component: "DropdownMenuCheckboxItem / DropdownMenuRadioItem",
      props: [
        { name: "checked", type: "boolean", description: "Checkbox item state, with onCheckedChange." },
        { name: "value", type: "string", description: "Radio item value, inside a DropdownMenuRadioGroup with value and onValueChange." },
      ],
    },
  ],
  keyboard: [
    { keys: ["Enter"], action: "Opens the menu from the trigger, or selects the focused item." },
    { keys: ["Space"], action: "Same as Enter." },
    { keys: ["↓", "↑"], action: "Moves between items." },
    { keys: ["→"], action: "Opens a submenu." },
    { keys: ["←"], action: "Closes a submenu." },
    { keys: ["A–Z"], action: "Jumps to the item starting with that letter." },
    { keys: ["Esc"], action: "Closes the menu and returns focus to the trigger." },
  ],
  a11y: [
    "Uses the menu, menuitem, menuitemcheckbox and menuitemradio roles, with checked states announced.",
    "Danger items say what they do in words; red is an extra cue, not the only one.",
    "Shortcuts are hints only. Implement them yourself so they work without opening the menu.",
  ],
};
