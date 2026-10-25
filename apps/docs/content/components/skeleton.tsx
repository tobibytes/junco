"use client";

import { Avatar, Button, Skeleton } from "junco";
import * as React from "react";
import type { ComponentDoc } from "./types";

function Reload() {
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => setLoaded(true), 1600);
    return () => clearTimeout(t);
  }, [loaded]);
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="flex items-center gap-3 rounded-card border border-border bg-card p-4" aria-busy={!loaded}>
        <Skeleton isLoaded={loaded} className="size-10 rounded-pill">
          <Avatar name="Grace Hopper" />
        </Skeleton>
        <div className="grid flex-1 gap-2">
          <Skeleton isLoaded={loaded} className="h-4 w-1/3">
            <p className="text-sm font-medium">Grace Hopper</p>
          </Skeleton>
          <Skeleton isLoaded={loaded} className="h-3 w-2/3">
            <p className="text-xs text-muted-foreground">Rear admiral, compiler pioneer</p>
          </Skeleton>
        </div>
      </div>
      <Button variant="outline" size="sm" className="justify-self-start" onClick={() => setLoaded(false)} disabled={!loaded}>
        Reload
      </Button>
    </div>
  );
}

export const doc: ComponentDoc = {
  imports: ["Skeleton"],
  usage: {
    installed: `<Skeleton isLoaded={!!user} className="h-4 w-32">
  <p>{user?.name}</p>
</Skeleton>`,
    semantic: `<div aria-busy="true">
  <span class="skeleton" style="height: 16px; width: 40%"></span>
</div>`,
    utilities: `<div aria-hidden className="h-4 w-32 animate-skeleton rounded-control bg-muted" />`,
  },
  examples: [
    {
      title: "Loading a card",
      description: "Match the skeleton to the shape of the real content so nothing jumps when it loads.",
      Preview: Reload,
      code: `<div aria-busy={!loaded}>
  <Skeleton isLoaded={loaded} className="size-10 rounded-pill">
    <Avatar name="Grace Hopper" />
  </Skeleton>
  <Skeleton isLoaded={loaded} className="h-4 w-1/3">
    <p>Grace Hopper</p>
  </Skeleton>
</div>`,
    },
  ],
  props: [
    {
      component: "Skeleton",
      props: [
        { name: "isLoaded", type: "boolean", default: "false", description: "Renders children instead of the placeholder." },
        { name: "className", type: "string", description: "Size and shape it, e.g. h-4 w-32 or size-10 rounded-pill." },
      ],
    },
  ],
  a11y: [
    "Placeholders are aria-hidden. Set aria-busy on the region that's loading so assistive tech knows.",
    "The pulse flattens to a still block with motion off.",
  ],
};
