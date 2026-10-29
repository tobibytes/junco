import { Badge, cn } from "@junco/react";
import * as React from "react";

export type DiffPart = { kind: "same" | "added" | "removed"; text: string };

/** Above this many token pairs the diff compares whole lines instead of words, to stay fast. */
const WORD_LIMIT = 4_000_000;

function lcsDiff(a: string[], b: string[]): DiffPart[] {
  const n = a.length;
  const m = b.length;
  // Lengths of the longest common subsequence of a[i..] and b[j..], one row at a time from the end.
  const table = new Uint32Array((n + 1) * (m + 1));
  const at = (i: number, j: number) => i * (m + 1) + j;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[at(i, j)] = a[i] === b[j] ? table[at(i + 1, j + 1)]! + 1 : Math.max(table[at(i + 1, j)]!, table[at(i, j + 1)]!);
    }
  }
  const parts: DiffPart[] = [];
  const push = (kind: DiffPart["kind"], text: string) => {
    const last = parts[parts.length - 1];
    if (last?.kind === kind) last.text += text;
    else parts.push({ kind, text });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push("same", a[i]!);
      i++;
      j++;
    } else if (table[at(i + 1, j)]! >= table[at(i, j + 1)]!) push("removed", a[i++]!);
    else push("added", b[j++]!);
  }
  while (i < n) push("removed", a[i++]!);
  while (j < m) push("added", b[j++]!);
  return parts;
}

/**
 * Joins each run of changes into one removal then one addition. Spaces the two sides happen to
 * share inside a change are folded in, so "pay $10" → "stay at $8" reads as one edit, not five.
 */
function tidy(parts: DiffPart[]): DiffPart[] {
  const out: DiffPart[] = [];
  let removed = "";
  let added = "";
  const flush = () => {
    // A trailing space both sides share belongs to the unchanged text after the edit.
    const tail = removed && added ? (/\s+$/.exec(removed)?.[0] ?? "") : "";
    const shared = tail && added.endsWith(tail) ? tail : "";
    if (removed) out.push({ kind: "removed", text: removed.slice(0, removed.length - shared.length) });
    if (added) out.push({ kind: "added", text: added.slice(0, added.length - shared.length) });
    if (shared) out.push({ kind: "same", text: shared });
    removed = "";
    added = "";
  };
  parts.forEach((p, i) => {
    const inChange = (removed || added) && p.kind === "same" && !p.text.trim() && parts[i + 1] && parts[i + 1]!.kind !== "same";
    if (p.kind === "removed") removed += p.text;
    else if (p.kind === "added") added += p.text;
    else if (inChange) {
      removed += p.text;
      added += p.text;
    } else {
      flush();
      const last = out[out.length - 1];
      if (last?.kind === "same") last.text += p.text;
      else out.push({ ...p });
    }
  });
  flush();
  return out;
}

/** What changed from `before` to `after`, word by word (or line by line for very long texts). */
export function diffText(before: string, after: string): DiffPart[] {
  const words = (s: string) => s.split(/(\s+)/).filter(Boolean);
  const a = words(before);
  const b = words(after);
  if (a.length * b.length <= WORD_LIMIT) return tidy(lcsDiff(a, b));
  const lines = (s: string) => s.split(/(?<=\n)/);
  return tidy(lcsDiff(lines(before), lines(after)));
}

export interface VersionCompareProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

const countWords = (parts: DiffPart[], kind: DiffPart["kind"]) =>
  parts.filter((p) => p.kind === kind).reduce((n, p) => n + p.text.split(/\s+/).filter(Boolean).length, 0);

/**
 * Two versions of a text, merged into one with additions and removals marked. Added text is
 * underlined, removed text struck through, and both are announced in words, so the change never
 * depends on color.
 */
export function VersionCompare({ before, after, beforeLabel = "Before", afterLabel = "Now", className }: VersionCompareProps) {
  const parts = React.useMemo(() => diffText(before, after), [before, after]);
  const added = countWords(parts, "added");
  const removed = countWords(parts, "removed");
  return (
    <section className={cn("grid gap-3", className)} aria-label={`Changes from ${beforeLabel} to ${afterLabel}`}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          {beforeLabel} → {afterLabel}
        </span>
        <Badge variant="outline" color="success">
          +{added} {added === 1 ? "word" : "words"}
        </Badge>
        <Badge variant="outline" color="danger">
          −{removed} {removed === 1 ? "word" : "words"}
        </Badge>
      </div>
      {added === 0 && removed === 0 ? (
        <p className="text-sm text-muted-foreground">No changes.</p>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto rounded-card border border-border bg-surface p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {parts.map((p, i) =>
            p.kind === "same" ? (
              <span key={i}>{p.text}</span>
            ) : p.kind === "added" ? (
              <ins key={i} className="rounded-xs bg-success/15 text-foreground underline decoration-success decoration-2 underline-offset-2">
                <span className="sr-only">Added: </span>
                {p.text}
              </ins>
            ) : (
              <del key={i} className="rounded-xs bg-destructive/10 text-muted-foreground decoration-destructive decoration-2">
                <span className="sr-only">Removed: </span>
                {p.text}
              </del>
            ),
          )}
        </div>
      )}
    </section>
  );
}
