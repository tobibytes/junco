"use client";

import { Avatar } from "@junco/react";
import type { ComponentDoc } from "./types";

// Inline SVG so the docs work offline and in static export.
const photo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6c28b"/><stop offset="1" stop-color="#e76f51"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/><circle cx="40" cy="32" r="14" fill="#fff" fill-opacity=".85"/><rect x="16" y="52" width="48" height="30" rx="15" fill="#fff" fill-opacity=".85"/></svg>`,
  );

const team = ["Ada Lovelace", "Grace Hopper", "Alan Turing", "Katherine Johnson"];

export const doc: ComponentDoc = {
  imports: ["Avatar"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["xs", "sm", "md", "lg"], default: "md" },
      { name: "shape", type: "select", options: ["circle", "square"], default: "circle" },
      { name: "withImage", label: "src", type: "boolean", default: false },
      { name: "name", type: "text", default: "Ada Lovelace" },
    ],
    render: (v) => (
      <Avatar
        key={String(v.withImage)}
        size={v.size as "md"}
        shape={v.shape as "circle"}
        name={String(v.name)}
        src={v.withImage ? photo : undefined}
      />
    ),
    code: (v) => {
      const attrs = [v.withImage && `src="/ada.jpg"`, `name="${v.name}"`, v.size !== "md" && `size="${v.size}"`, v.shape !== "circle" && `shape="${v.shape}"`].filter(Boolean);
      return `<Avatar ${attrs.join(" ")} />`;
    },
  },
  usage: {
    installed: `<Avatar src={user.image} name={user.name} />`,
    semantic: `<span class="avatar"><img src="/ada.jpg" alt="Ada Lovelace" /></span>
<span class="avatar avatar-sm" role="img" aria-label="Grace Hopper">GH</span>`,
  },
  examples: [
    {
      title: "Stack",
      description: "Overlap avatars with negative margin and a ring in the page background color.",
      Preview: () => (
        <div className="flex -space-x-2">
          {team.map((name) => (
            <Avatar key={name} name={name} size="sm" className="ring-2 ring-background" />
          ))}
          <span className="grid size-8 place-items-center rounded-pill border border-border bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">
            +3
          </span>
        </div>
      ),
      code: `<div className="flex -space-x-2">
  {team.map((m) => (
    <Avatar key={m.id} name={m.name} src={m.image} size="sm" className="ring-2 ring-background" />
  ))}
</div>`,
    },
    {
      title: "Sizes",
      Preview: () => (
        <>
          <Avatar size="xs" name="Ada Lovelace" />
          <Avatar size="sm" name="Ada Lovelace" />
          <Avatar size="md" name="Ada Lovelace" />
          <Avatar size="lg" name="Ada Lovelace" src={photo} />
        </>
      ),
      code: `<Avatar size="xs" name="Ada Lovelace" />
<Avatar size="sm" name="Ada Lovelace" />
<Avatar size="md" name="Ada Lovelace" />
<Avatar size="lg" name="Ada Lovelace" src="/ada.jpg" />`,
    },
  ],
  props: [
    {
      component: "Avatar",
      props: [
        { name: "src", type: "string", description: "Image URL. Falls back to initials while loading or on error." },
        { name: "name", type: "string", description: "The person's name: alt text and initials." },
        { name: "fallback", type: "ReactNode", description: "Custom fallback content instead of initials." },
        { name: "size", type: '"xs" | "sm" | "md" | "lg"', default: '"md"', description: "24, 32, 40 or 48px." },
        { name: "shape", type: '"circle" | "square"', default: '"circle"', description: "Square suits teams and orgs." },
        { name: "classNames", type: "{ root?, image?, fallback? }", description: "Slot overrides." },
      ],
    },
  ],
  a11y: [
    "The image gets the name as alt text; the initials fallback is role=img with the name as its label.",
    "Initials are hidden from screen readers so the name isn't read twice.",
    "If an avatar sits next to the visible name, pass name anyway; it keeps the image meaningful when shown alone.",
  ],
};
