"use client";

import { Button, Icon, Input, toast } from "junco";
import { icons } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

const all = Object.entries(icons).map(([name, component]) => ({
  name,
  component,
  // "ArrowUpRight" -> "arrow up right", so searches match words.
  words: name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase(),
}));

const PAGE = 240;
const sizes = ["sm", "md", "lg", "xl"] as const;

/** Searchable Lucide gallery. Clicking an icon copies its import. */
export function IconGallery() {
  const [query, setQuery] = React.useState("");
  const [size, setSize] = React.useState<(typeof sizes)[number]>("lg");
  const [stroke, setStroke] = React.useState<number | undefined>(undefined);
  const [limit, setLimit] = React.useState(PAGE);
  const deferred = React.useDeferredValue(query);

  const results = React.useMemo(() => {
    const terms = deferred.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return terms.length ? all.filter((i) => terms.every((t) => i.words.includes(t) || i.name.toLowerCase().includes(t))) : all;
  }, [deferred]);

  const copy = async (name: string) => {
    const text = `import { ${name} } from "lucide-react";`;
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied ${name}`, { description: text });
    } catch {
      toast(`Couldn't copy ${name}`, { description: text });
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE);
          }}
          placeholder={`Search ${all.length.toLocaleString("en-US")} icons`}
          aria-label="Search icons"
          className="w-full sm:w-80"
        />
        <div role="radiogroup" aria-label="Size" className="inline-flex rounded-control border border-border p-0.5">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={size === s}
              onClick={() => setSize(s)}
              className="rounded-xs px-2.5 py-1 text-xs text-muted-foreground aria-checked:bg-secondary aria-checked:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              {s}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Stroke
          <input
            type="range"
            min={1}
            max={2.5}
            step={0.25}
            value={stroke ?? 1.75}
            onChange={(e) => setStroke(Number(e.target.value))}
            className="w-24 accent-(--primary)"
          />
          <span className="w-8 font-mono tabular-nums">{(stroke ?? 1.75).toFixed(2)}</span>
        </label>
        <span className="text-xs text-muted-foreground sm:ml-auto" aria-live="polite">
          {results.length.toLocaleString("en-US")} {results.length === 1 ? "icon" : "icons"}
        </span>
      </div>

      {results.length === 0 ? (
        <p className="rounded-card border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No icons match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
          {results.slice(0, limit).map(({ name, component }) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => copy(name)}
                aria-label={`Copy ${name} import`}
                title={name}
                className={cn(
                  "grid h-24 w-full place-items-center content-center gap-2 rounded-card border border-border bg-card px-2 text-foreground",
                  "transition-colors duration-fast ease-standard hover:border-border-strong hover:text-primary",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <Icon as={component} size={size} strokeWidth={stroke} />
                <span className="w-full truncate text-center text-[11px] text-muted-foreground">{name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {results.length > limit && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setLimit((l) => l + PAGE * 2)}>
            Show more ({(results.length - limit).toLocaleString("en-US")} left)
          </Button>
        </div>
      )}
    </div>
  );
}
