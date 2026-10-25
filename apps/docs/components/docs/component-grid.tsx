"use client";

import { Skeleton } from "@junco/react";
import Link from "next/link";
import * as React from "react";
import { categories, components, type ComponentEntry } from "@/content/components";
import type { ComponentDoc, ControlValues } from "@/content/components/types";

function Thumb({ doc }: { doc: ComponentDoc }) {
  if (doc.playground) {
    const values: ControlValues = Object.fromEntries(doc.playground.controls.map((c) => [c.name, c.default]));
    return <>{doc.playground.render(values)}</>;
  }
  const First = doc.examples[0]?.Preview;
  return First ? <First /> : null;
}

const thumbs = new Map(
  components.map((entry) => [
    entry.slug,
    React.lazy(async () => {
      const { doc } = await entry.load();
      return { default: () => <Thumb doc={doc} /> };
    }),
  ]),
);

function Card({ entry }: { entry: ComponentEntry }) {
  const View = thumbs.get(entry.slug)!;
  return (
    <Link
      href={`/components/${entry.slug}/`}
      className="group overflow-hidden rounded-card border border-border bg-card transition-colors duration-fast ease-standard hover:border-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {/* Live, but inert: not focusable or clickable, and hidden from assistive tech. */}
      <div
        inert
        aria-hidden
        className="preview-canvas pointer-events-none relative flex h-36 items-center justify-center overflow-hidden border-b border-border"
      >
        <div className="flex origin-center scale-[0.85] flex-wrap items-center justify-center gap-2 px-4 [&>*]:max-w-[16rem]">
          <React.Suspense fallback={<Skeleton className="h-8 w-28" />}>
            <View />
          </React.Suspense>
        </div>
      </div>
      <div className="grid gap-1 p-4">
        <span className="text-sm font-medium">{entry.title}</span>
        <span className="line-clamp-2 text-[13px] text-muted-foreground">{entry.description}</span>
      </div>
    </Link>
  );
}

export function ComponentGrid() {
  return (
    <div className="grid gap-12">
      {categories.map((category) => {
        const items = components.filter((c) => c.category === category);
        if (items.length === 0) return null;
        const id = `cat-${category.toLowerCase()}`;
        return (
          <section key={category} aria-labelledby={id} className="grid gap-4">
            <h2 id={id} className="text-sm font-medium text-muted-foreground">
              {category}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((entry) => (
                <Card key={entry.slug} entry={entry} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
