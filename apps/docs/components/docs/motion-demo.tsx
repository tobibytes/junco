"use client";

import { Button, Spinner, useTheme } from "@junco/react";
import * as React from "react";
import { MotionSegmented } from "../theme-controls";

export function MotionDemo() {
  const { motion } = useTheme();
  const [run, setRun] = React.useState(0);
  return (
    <div className="grid gap-4 rounded-card border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MotionSegmented />
        <Button size="sm" variant="outline" onClick={() => setRun((r) => r + 1)}>
          Replay
        </Button>
      </div>
      <div key={`${run}-${motion}`} className="grid gap-2 sm:grid-cols-3">
        {["Rises in", "With a stagger", "Then settles"].map((label, i) => (
          <div
            key={label}
            className="animate-rise rounded-control border border-border bg-surface p-3 text-sm"
            style={{ animationDelay: `calc(${i} * var(--stagger) * 3 * var(--motion-scale))` }}
          >
            {label}
          </div>
        ))}
      </div>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner size="sm" label={null} /> This spinner never stops, only slows down.
      </p>
    </div>
  );
}
