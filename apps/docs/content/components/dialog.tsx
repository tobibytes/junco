"use client";

import {
  Button,
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
  toast,
} from "junco";
import * as React from "react";
import type { ComponentDoc } from "./types";

function Controlled() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("Junco");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Rename project</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            toast.success(`Renamed to ${name}`);
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>Everyone on the team sees the new name.</DialogDescription>
          </DialogHeader>
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const doc: ComponentDoc = {
  imports: ["Dialog", "DialogTrigger", "DialogContent", "DialogHeader", "DialogTitle", "DialogDescription", "DialogFooter", "DialogClose"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["sm", "md", "lg", "xl"], default: "md" },
      { name: "showClose", type: "boolean", default: true },
      { name: "title", type: "text", default: "Delete project?" },
    ],
    render: (v) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </DialogTrigger>
        <DialogContent size={v.size as "md"} showClose={v.showClose as boolean}>
          <DialogHeader>
            <DialogTitle>{String(v.title)}</DialogTitle>
            <DialogDescription>This removes the project and its history. It can&apos;t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="danger">Delete</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    code: (v) => {
      const attrs = [v.size !== "md" && `size="${v.size}"`, !v.showClose && "showClose={false}"].filter(Boolean);
      return `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open dialog</Button>
  </DialogTrigger>
  <DialogContent${attrs.length ? " " + attrs.join(" ") : ""}>
    <DialogHeader>
      <DialogTitle>${String(v.title)}</DialogTitle>
      <DialogDescription>This removes the project and its history. It can't be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <DialogClose asChild><Button variant="danger">Delete</Button></DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`;
    },
  },
  usage: {
    installed: `<Dialog>
  <DialogTrigger asChild>
    <Button>Edit profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Changes show up for your whole team.</DialogDescription>
    </DialogHeader>
    {/* form fields */}
    <DialogFooter>
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
    semantic: `<!-- The native <dialog> element: showModal() traps focus, Esc closes it. -->
<button class="btn" onclick="document.getElementById('confirm').showModal()">Delete project</button>

<dialog id="confirm" class="modal modal-sm" aria-labelledby="confirm-title">
  <h2 id="confirm-title" class="modal-title">Delete project?</h2>
  <p class="modal-description">This removes the project and its history.</p>
  <form method="dialog" class="modal-actions">
    <button class="btn">Cancel</button>
    <button class="btn btn-danger" value="delete">Delete</button>
  </form>
</dialog>`,
  },
  examples: [
    {
      title: "With a form",
      description: "Control open state to close the dialog after a successful submit.",
      Preview: Controlled,
      code: `const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Rename project</Button>
  </DialogTrigger>
  <DialogContent size="sm">
    <form onSubmit={(e) => { e.preventDefault(); setOpen(false); toast.success("Renamed"); }}>
      <DialogHeader>
        <DialogTitle>Rename project</DialogTitle>
        <DialogDescription>Everyone on the team sees the new name.</DialogDescription>
      </DialogHeader>
      <Field label="Name"><Input defaultValue="Junco" required /></Field>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>`,
    },
    {
      title: "Hidden title",
      description: "Every dialog needs a title for screen readers. When the design has no heading, hide it visually.",
      Preview: () => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Show image</Button>
          </DialogTrigger>
          <DialogContent size="sm">
            <DialogTitle isHidden>Team photo</DialogTitle>
            <div className="grid aspect-video place-items-center rounded-control bg-muted text-sm text-muted-foreground">
              Image goes here
            </div>
          </DialogContent>
        </Dialog>
      ),
      code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Show image</Button>
  </DialogTrigger>
  <DialogContent size="sm">
    <DialogTitle isHidden>Team photo</DialogTitle>
    <img src="/team.jpg" alt="The team at the offsite" />
  </DialogContent>
</Dialog>`,
    },
  ],
  props: [
    {
      component: "Dialog",
      description: "The root. Uncontrolled by default.",
      props: [
        { name: "open", type: "boolean", description: "Controlled open state." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Initial open state when uncontrolled." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the dialog opens or closes." },
        { name: "modal", type: "boolean", default: "true", description: "Blocks the rest of the page while open." },
      ],
    },
    {
      component: "DialogContent",
      description: "The window, rendered in a portal with the scrim behind it.",
      props: [
        { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"md"', description: "Max width. full fills the viewport with a small margin." },
        { name: "showClose", type: "boolean", default: "true", description: "Show the × button in the corner." },
        { name: "closeLabel", type: "string", default: '"Close"', description: "Accessible name for the × button." },
        { name: "classNames", type: "{ overlay?, content?, close? }", description: "Class overrides for each part." },
        { name: "onEscapeKeyDown", type: "(event) => void", description: "Call event.preventDefault() to keep it open on Esc." },
      ],
    },
    {
      component: "DialogTitle",
      props: [{ name: "isHidden", type: "boolean", default: "false", description: "Visually hidden, still read by screen readers." }],
    },
    {
      component: "DialogTrigger / DialogClose",
      props: [{ name: "asChild", type: "boolean", default: "false", description: "Use your own button (usually a Junco Button) as the trigger or close control." }],
    },
  ],
  keyboard: [
    { keys: ["Esc"], action: "Closes the dialog and returns focus to the trigger." },
    { keys: ["Tab"], action: "Moves focus to the next control inside the dialog; focus can't leave it." },
    { keys: ["Shift", "Tab"], action: "Moves focus back, wrapping inside the dialog." },
  ],
  a11y: [
    "Focus moves into the dialog on open and returns to the trigger on close.",
    "The rest of the page is hidden from assistive tech and can't be focused while it's open.",
    "DialogTitle labels the dialog and DialogDescription describes it; a dialog without a title is a bug.",
    "The scrim uses the --overlay token, and animations follow the motion switch.",
  ],
};
