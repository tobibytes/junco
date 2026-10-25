"use client";

import { Badge } from "@junco/react";
import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/cn";
import { blockCategories, blocks, type BlockCategory } from "@/content/blocks/catalog";
import { ArrowRightIcon } from "../icons";
import { BlockThumb } from "./block-thumb";

type Filter = "all" | BlockCategory;

export function BlockGallery() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const shown = filter === "all" ? blocks : blocks.filter((b) => b.category === filter);
  const sections = blockCategories
    .map((category) => ({ category, items: shown.filter((b) => b.category === category) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="grid gap-10">
      <div role="group" aria-label="Filter blocks" className="flex flex-wrap gap-2">
        {(["all", ...blockCategories] as Filter[]).map((c) => {
          const count = c === "all" ? blocks.length : blocks.filter((b) => b.category === c).length;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-pill border border-border bg-surface px-3 text-sm font-medium text-muted-foreground",
                "transition-colors duration-fast ease-standard hover:text-foreground",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background",
              )}
            >
              {c === "all" ? "All" : c}
              <span className="font-normal tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      {sections.map(({ category, items }) => (
        <section key={category} aria-labelledby={`cat-${category}`} className="grid gap-4">
          <h2 id={`cat-${category}`} className="text-sm font-medium text-muted-foreground">
            {category}
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/blocks/${b.slug}/`}
                  className="group block overflow-hidden rounded-card border border-border bg-card transition-colors duration-fast ease-standard hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <div className="border-b border-border">
                    <BlockThumb slug={b.slug} variant={b.variants[0]!.value} title={b.title} />
                  </div>
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="grid min-w-0 gap-1">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {b.title}
                        {b.variants.length > 1 && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[11px] text-muted-foreground">
                            {b.variants.length} variants
                          </Badge>
                        )}
                      </span>
                      <span className="line-clamp-2 text-sm text-muted-foreground">{b.description}</span>
                    </div>
                    <ArrowRightIcon className="mt-0.5 shrink-0 text-muted-foreground transition-transform duration-fast ease-standard group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
