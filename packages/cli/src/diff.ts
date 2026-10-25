/** Lines with their "\n" kept, so a missing final newline is a real difference. */
function lines(text: string): string[] {
  return text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
}

/** A small unified diff (LCS based), applyable with `patch` / `git apply`. Fine for component-sized files. */
export function unifiedDiff(a: string, b: string, aName: string, bName: string, context = 3): string {
  if (a === b) return "";
  const x = lines(a);
  const y = lines(b);
  const n = x.length;
  const m = y.length;
  const lcs: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] = x[i] === y[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }

  type Op = { kind: " " | "-" | "+"; line: string; ai: number; bi: number };
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) ops.push({ kind: " ", line: x[i]!, ai: i++, bi: j++ });
    // removals before additions, like git
    else if (i < n && (j >= m || lcs[i + 1]![j]! >= lcs[i]![j + 1]!)) ops.push({ kind: "-", line: x[i]!, ai: i++, bi: j });
    else ops.push({ kind: "+", line: y[j]!, ai: i, bi: j++ });
  }

  // Group changes into hunks with `context` unchanged lines around them.
  const hunks: Array<[number, number]> = [];
  ops.forEach((op, idx) => {
    if (op.kind === " ") return;
    const start = Math.max(0, idx - context);
    const end = Math.min(ops.length, idx + context + 1);
    const last = hunks[hunks.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else hunks.push([start, end]);
  });

  const out = [`--- ${aName}`, `+++ ${bName}`];
  for (const [start, end] of hunks) {
    const hunk = ops.slice(start, end);
    const aLen = hunk.filter((o) => o.kind !== "+").length;
    const bLen = hunk.filter((o) => o.kind !== "-").length;
    // an empty range is written as the line *before* it, per the unified format
    const aStart = aLen ? hunk.find((o) => o.kind !== "+")!.ai + 1 : hunk[0]!.ai;
    const bStart = bLen ? hunk.find((o) => o.kind !== "-")!.bi + 1 : hunk[0]!.bi;
    out.push(`@@ -${aStart},${aLen} +${bStart},${bLen} @@`);
    for (const o of hunk) {
      const terminated = o.line.endsWith("\n");
      out.push(`${o.kind}${terminated ? o.line.slice(0, -1) : o.line}`);
      if (!terminated) out.push("\\ No newline at end of file");
    }
  }
  return out.join("\n") + "\n";
}
