import { cn } from "@/lib/cn";
import type * as React from "react";

/** Building blocks for doc pages. Server-safe (no hooks). */

export function DocHeader({ title, description, eyebrow, children }: { title: string; description: string; eyebrow?: string; children?: React.ReactNode }) {
  return (
    <header className="grid gap-3 border-b border-border pb-8">
      {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg sm:leading-7">{description}</p>
      {children}
    </header>
  );
}

function Anchor({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      aria-label="Link to this section"
      className="ml-2 text-muted-foreground opacity-0 transition-opacity duration-fast group-hover:opacity-100 focus-visible:opacity-100"
    >
      #
    </a>
  );
}

export function H2({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn("group scroll-mt-20 text-xl font-semibold tracking-tight", className)}>
      {children}
      <Anchor id={id} />
    </h2>
  );
}

export function H3({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <h3 id={id} className={cn("group scroll-mt-20 text-base font-semibold", className)}>
      {children}
      <Anchor id={id} />
    </h3>
  );
}

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[15px] leading-7 text-pretty text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground", className)}>{children}</p>;
}

export function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded-xs border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>;
}

export function Note({ children, tone = "info", title }: { children: React.ReactNode; tone?: "info" | "warning"; title?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "rounded-card border border-border bg-surface px-4 py-3 text-sm text-muted-foreground",
        "border-l-2",
        tone === "info" ? "border-l-primary" : "border-l-warning",
      )}
    >
      {title && <p className="mb-1 font-medium text-foreground">{title}</p>}
      {children}
    </div>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-4">
      <H2 id={id}>{title}</H2>
      {children}
    </section>
  );
}

export function DataTable({ head, rows, caption }: { head: string[]; rows: React.ReactNode[][]; caption?: string }) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={caption ?? head.filter(Boolean).join(", ")}
      className="relative overflow-x-auto rounded-card border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <table className="w-full text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="border-b border-border bg-surface text-xs text-muted-foreground">
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-2.5 font-medium whitespace-nowrap">
                {h || <span className="sr-only">Description</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border align-top">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={cn("px-4 py-2.5", j === 0 ? "text-foreground" : "text-muted-foreground")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="grid gap-8 [counter-reset:step]">{children}</ol>;
}

export function Step({ title, level = 3, children }: { title: string; level?: 2 | 3; children: React.ReactNode }) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <li className="relative grid gap-3 pl-10 [counter-increment:step] before:absolute before:top-0 before:left-0 before:grid before:size-7 before:place-items-center before:rounded-pill before:border before:border-border before:bg-surface before:font-mono before:text-xs before:text-muted-foreground before:content-[counter(step)]">
      <Heading className="pt-0.5 text-base font-semibold">{title}</Heading>
      {children}
    </li>
  );
}
