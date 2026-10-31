"use client";

import { Alert, AlertDescription, AlertTitle, Button } from "@junco/react";
import type { ComponentDoc } from "./types";

const Info = () => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);
const Warn = () => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const doc: ComponentDoc = {
  imports: ["Alert", "AlertTitle", "AlertDescription"],
  playground: {
    controls: [
      { name: "color", type: "select", options: ["neutral", "primary", "success", "warning", "danger"], default: "neutral" },
      { name: "icon", type: "boolean", default: true },
      { name: "action", type: "boolean", default: false },
    ],
    render: (v) => (
      <Alert
        className="max-w-lg"
        color={v.color as "neutral"}
        icon={v.icon ? v.color === "danger" || v.color === "warning" ? <Warn /> : <Info /> : undefined}
        action={v.action ? <Button size="sm" variant="outline">Retry</Button> : undefined}
      >
        <AlertTitle>This looks like a scan</AlertTitle>
        <AlertDescription>Some text may be missing. Upload the original file for better results.</AlertDescription>
      </Alert>
    ),
    code: (v) => {
      const attrs = [
        v.color !== "neutral" && `color="${v.color}"`,
        v.icon && "icon={<InfoIcon />}",
        v.action && `action={<Button size="sm" variant="outline">Retry</Button>}`,
      ].filter(Boolean);
      return `<Alert${attrs.length ? ` ${attrs.join(" ")}` : ""}>
  <AlertTitle>This looks like a scan</AlertTitle>
  <AlertDescription>Some text may be missing. Upload the original file for better results.</AlertDescription>
</Alert>`;
    },
  },
  usage: {
    installed: `<Alert color="danger" icon={<AlertIcon />}>
  <AlertTitle>Couldn't read this file</AlertTitle>
  <AlertDescription>Try uploading it again.</AlertDescription>
</Alert>`,
    semantic: `<div class="alert alert-danger" role="alert">
  <svg>…</svg>
  <p class="alert-title">Couldn't read this file</p>
  <p class="alert-description">Try uploading it again.</p>
</div>`,
  },
  examples: [
    {
      title: "Error with a retry",
      description: "Danger alerts are read out as soon as they appear. Put the fix right there.",
      Preview: () => (
        <Alert color="danger" icon={<Warn />} action={<Button size="sm" variant="outline">Retry</Button>} className="max-w-lg">
          <AlertTitle>That request didn't finish</AlertTitle>
          <AlertDescription>The connection dropped. Your answers are saved.</AlertDescription>
        </Alert>
      ),
      code: `<Alert color="danger" icon={<AlertIcon />} action={<Button size="sm" variant="outline">Retry</Button>}>
  <AlertTitle>That request didn't finish</AlertTitle>
  <AlertDescription>The connection dropped. Your answers are saved.</AlertDescription>
</Alert>`,
    },
  ],
  props: [
    {
      component: "Alert",
      props: [
        { name: "color", type: '"neutral" | "primary" | "success" | "warning" | "danger"', default: '"neutral"', description: "Tints the border, icon and title." },
        { name: "icon", type: "ReactNode", description: "Shown before the text, hidden from screen readers." },
        { name: "action", type: "ReactNode", description: "Buttons or links on the right." },
        { name: "role", type: "string", default: '"alert" for danger, else "status"', description: "Override when the alert is static content that shouldn't be announced." },
        { name: "classNames", type: "{ root?; icon?; body?; action? }", description: "Slot overrides." },
      ],
    },
    { component: "AlertTitle", props: [{ name: "className", type: "string", description: "A short, bold summary." }] },
    { component: "AlertDescription", props: [{ name: "className", type: "string", description: "Details. Links inside are underlined." }] },
  ],
  a11y: [
    'Danger alerts use role="alert" so they are read out at once; the others use role="status".',
    "The title says what kind of message it is, so the color is never the only signal.",
    "For brief feedback after an action, use a toast instead.",
  ],
};
