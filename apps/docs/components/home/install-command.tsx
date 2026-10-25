"use client";

import { CopyButton } from "../code-block";

export function InstallCommand({ command }: { command: string }) {
  return (
    <div className="inline-flex h-10 items-center gap-3 rounded-card border border-border bg-surface pr-1.5 pl-4 font-mono text-[13px]">
      <span aria-hidden className="text-muted-foreground select-none">
        $
      </span>
      <span>{command}</span>
      <CopyButton text={command} label="Copy install command" />
    </div>
  );
}
