import { Badge, Button, cn, EmptyState, Input } from "@junco/react";
import * as React from "react";
import { When } from "./comments";
import { sampleVersions } from "./fake";
import { HistoryIcon, RotateCcwIcon } from "./icons";
import { useCollabAdapter, useCollabState } from "./provider";
import type { CollabVersion } from "./types";

const KIND: Record<CollabVersion["kind"], string> = { auto: "Autosave", manual: "Saved", restore: "Restored" };

export interface HistoryPanelProps {
  /** Newest first. Default: the room's versions (from `CollabProvider`), or sample versions. */
  versions?: CollabVersion[];
  onSave?: (name?: string) => unknown;
  onRestore?: (versionId: string) => unknown;
  /** Shown after a restore, to put things back. */
  onUndo?: () => void;
  /** Whether undo is possible right now. Default: after a restore from this panel. */
  canUndo?: boolean;
  className?: string;
  classNames?: { root?: string; list?: string; item?: string };
}

/** Version history: name and save a version, restore any version for everyone, then undo that. */
export function HistoryPanel(props: HistoryPanelProps) {
  const state = useCollabState();
  const adapter = useCollabAdapter();
  const versions = props.versions ?? state?.versions ?? sampleVersions;
  const onSave = props.onSave ?? adapter?.saveVersion;
  const onRestore = props.onRestore ?? adapter?.restoreVersion;
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [restored, setRestored] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const canUndo = props.canUndo ?? restored;

  const run = async (key: string, work: () => unknown) => {
    setBusy(key);
    setError(null);
    try {
      await work();
      return true;
    } catch (e) {
      setError((e as Error).message || "That didn't work");
      return false;
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={cn("grid content-start gap-4", props.className, props.classNames?.root)}>
      {onSave && (
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await run("save", () => onSave(name.trim() || undefined))) setName("");
          }}
        >
          <Input aria-label="Version name" placeholder="Name this version (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" isLoading={busy === "save"}>
            Save
          </Button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive-text">
          {error}
        </p>
      )}
      {props.onUndo && canUndo && (
        <Button
          variant="soft"
          onClick={() => {
            props.onUndo?.();
            setRestored(false);
          }}
        >
          <RotateCcwIcon className="size-4" /> Undo restore
        </Button>
      )}
      {versions.length === 0 ? (
        <EmptyState icon={<HistoryIcon className="size-5" />} title="No versions yet" description="Save one, change things, then restore it." />
      ) : (
        <ol className={cn("grid gap-2", props.classNames?.list)}>
          {versions.map((v) => (
            <li key={v.id} className={cn("flex items-center gap-3 rounded-card border border-border p-3", props.classNames?.item)}>
              <div className="grid min-w-0 flex-1 gap-0.5">
                <span className="truncate text-sm font-medium">{v.name ?? KIND[v.kind]}</span>
                <span className="text-xs text-muted-foreground">
                  <When at={v.createdAt} />
                  {v.author && ` · ${v.author.name}`}
                </span>
              </div>
              <Badge variant="outline">{KIND[v.kind]}</Badge>
              {onRestore && (
                <Button
                  size="sm"
                  variant="ghost"
                  isLoading={busy === v.id}
                  aria-label={`Restore ${v.name ?? KIND[v.kind].toLowerCase()} from ${new Date(v.createdAt).toLocaleString()}`}
                  onClick={async () => {
                    if (await run(v.id, () => onRestore(v.id))) setRestored(true);
                  }}
                >
                  Restore
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
