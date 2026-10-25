"use client";

import { Button, toast } from "@junco/react";
import type { ComponentDoc } from "./types";

const wait = (ms: number, fail = false) =>
  new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Network error")) : resolve()), ms));

export const doc: ComponentDoc = {
  imports: ["Toaster", "toast"],
  playground: {
    controls: [
      { name: "type", type: "select", options: ["default", "success", "error", "warning", "info", "loading"], default: "success" },
      { name: "title", type: "text", default: "Invoice sent" },
      { name: "description", type: "text", default: "Northwind will get it in a minute." },
      { name: "action", label: "undo action", type: "boolean", default: false },
    ],
    render: (v) => {
      const options = {
        description: v.description ? String(v.description) : undefined,
        action: v.action ? { label: "Undo", onClick: () => toast("Undone") } : undefined,
      };
      const show = () => {
        const title = String(v.title);
        if (v.type === "default") toast(title, options);
        else toast[v.type as "success"](title, options);
      };
      return <Button onClick={show}>Show toast</Button>;
    },
    code: (v) => {
      const opts = [
        v.description && `description: "${v.description}"`,
        v.action && `action: { label: "Undo", onClick: undo }`,
      ].filter(Boolean);
      const fn = v.type === "default" ? "toast" : `toast.${v.type}`;
      return `${fn}("${v.title}"${opts.length ? `, {\n  ${opts.join(",\n  ")},\n}` : ""});`;
    },
  },
  usage: {
    installed: `// Once, near the root of your app
<Toaster />

// Anywhere
toast("Saved");
toast.success("Invoice sent", { description: "Northwind will get it in a minute." });
toast.error("Couldn't save", { action: { label: "Retry", onClick: save } });
toast.promise(upload(), { loading: "Uploading…", success: "Uploaded", error: "Upload failed" });`,
    semantic: `<!-- .toast is the look only. Showing, stacking, timing and announcing need JS: use toast(). -->
<div class="toast-stack" role="status" aria-live="polite">
  <div class="toast toast-success">
    <svg class="toast-icon" aria-hidden="true"><!-- check icon --></svg>
    <div>
      <p class="toast-title">Invoice sent</p>
      <p class="toast-description">Northwind will get it in a minute.</p>
    </div>
  </div>
</div>`,
  },
  examples: [
    {
      title: "Types",
      description: "Each status has its own icon and words, so it never relies on color.",
      Preview: () => (
        <>
          <Button variant="outline" onClick={() => toast("Draft saved")}>
            Default
          </Button>
          <Button variant="outline" onClick={() => toast.success("Payment received")}>
            Success
          </Button>
          <Button variant="outline" onClick={() => toast.error("Card declined", { description: "Try another card." })}>
            Error
          </Button>
          <Button variant="outline" onClick={() => toast.warning("Storage almost full")}>
            Warning
          </Button>
          <Button variant="outline" onClick={() => toast.info("New version available")}>
            Info
          </Button>
        </>
      ),
      code: `toast("Draft saved");
toast.success("Payment received");
toast.error("Card declined", { description: "Try another card." });
toast.warning("Storage almost full");
toast.info("New version available");`,
    },
    {
      title: "Promise",
      description: "Shows a loading toast that turns into success or error when the promise settles.",
      Preview: () => (
        <>
          <Button
            variant="outline"
            onClick={() => toast.promise(wait(1500), { loading: "Deploying…", success: "Deployed to production", error: "Deploy failed" })}
          >
            Deploy
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.promise(wait(1500, true), {
                loading: "Uploading…",
                success: "Uploaded",
                error: (err) => `Upload failed: ${(err as Error).message}`,
              })
            }
          >
            Upload (fails)
          </Button>
        </>
      ),
      code: `toast.promise(deploy(), {
  loading: "Deploying…",
  success: "Deployed to production",
  error: "Deploy failed",
});

toast.promise(upload(), {
  loading: "Uploading…",
  success: "Uploaded",
  error: (err) => \`Upload failed: \${err.message}\`,
});`,
    },
    {
      title: "Action and update in place",
      description: "Reuse an id to update a toast instead of stacking a new one.",
      Preview: () => (
        <Button
          variant="outline"
          onClick={() => {
            const id = toast.loading("Archiving 3 issues…");
            setTimeout(
              () => toast.success("3 issues archived", { id, action: { label: "Undo", onClick: () => toast("Restored") } }),
              1200,
            );
          }}
        >
          Archive
        </Button>
      ),
      code: `const id = toast.loading("Archiving 3 issues…");
await archive();
toast.success("3 issues archived", {
  id,
  action: { label: "Undo", onClick: restore },
});`,
    },
  ],
  props: [
    {
      component: "toast(title, options?)",
      description: "Also toast.success, .error, .warning, .info, .loading, .promise and .dismiss(id?). Returns the toast id.",
      props: [
        { name: "description", type: "ReactNode", description: "Second line of text." },
        { name: "id", type: "string | number", description: "Reuse an id to update a toast in place." },
        { name: "duration", type: "number", default: "Toaster's duration", description: "Ms before it closes. Infinity keeps it open; loading toasts never auto-close." },
        { name: "action", type: "{ label, onClick }", description: "A button in the toast. It closes after onClick unless you call event.preventDefault()." },
        { name: "dismissible", type: "boolean", default: "true", description: "Whether close button, swipe and Esc can close it." },
        { name: "ariaLabel", type: "string", description: "Text for screen readers when title or description aren't plain strings." },
        { name: "onDismiss / onAutoClose", type: "(toast) => void", description: "Called when the user closes it, or when it times out." },
      ],
    },
    {
      component: "Toaster",
      description: "Render once near the root of your app.",
      props: [
        { name: "position", type: '"top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"', default: '"bottom-right"', description: "Where the stack sits." },
        { name: "visibleToasts", type: "number", default: "3", description: "How many show at once; older ones wait behind." },
        { name: "duration", type: "number", default: "5000", description: "Default auto-close time in ms." },
        { name: "expand", type: "boolean", default: "false", description: "Always show the full stack instead of collapsing it until hover or focus." },
        { name: "closeButton", type: "boolean", default: "true", description: "Show the × button on each toast." },
        { name: "hotkey", type: "string[]", default: '["altKey", "KeyT"]', description: "Keys that move focus to the toasts." },
        { name: "classNames", type: "Partial<Record<slot, string>>", description: "Class overrides for each part." },
      ],
    },
  ],
  keyboard: [
    { keys: ["Alt", "T"], action: "Moves focus to the newest toast." },
    { keys: ["Tab"], action: "Moves between toasts and their buttons." },
    { keys: ["Esc"], action: "Closes the focused toast." },
  ],
  a11y: [
    "New toasts are announced through live regions that stay mounted: errors assertively, everything else politely.",
    "Timers pause while you hover or focus the stack, so there's time to read and act.",
    "Status comes from the icon shape and the words, not color alone.",
    "Swipe to dismiss is an extra; the × button and Esc always work.",
  ],
};
