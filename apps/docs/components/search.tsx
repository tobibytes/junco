"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  Kbd,
} from "junco";
import { useRouter } from "next/navigation";
import * as React from "react";
import { blockPages, componentPages, explore, guides, type NavItem } from "@/content/nav";
import { cn } from "@/lib/cn";
import { ArrowRightIcon, BoxIcon, FileIcon, LayoutIcon, SearchIcon, SparklesIcon } from "./icons";
import { useSearch } from "./providers";

export function SearchButton({ className }: { className?: string }) {
  const { setOpen } = useSearch();
  const [mac, setMac] = React.useState(true);
  React.useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
      className={cn(
        "inline-flex h-8 w-9 items-center justify-center gap-2 rounded-control border border-border bg-surface text-sm text-muted-foreground",
        "sm:w-56 sm:justify-start sm:pr-1.5 sm:pl-2.5",
        "transition-colors duration-fast ease-standard hover:border-input hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      <SearchIcon width={14} height={14} className="shrink-0" />
      {/* Visible "Search" from sm up; the full name is always "Search docs" for screen readers. */}
      <span className="sr-only flex-1 text-left sm:not-sr-only">Search</span>
      <span className="sr-only"> docs</span>
      <span className="hidden gap-0.5 sm:flex" aria-hidden>
        <Kbd>{mac ? "⌘" : "Ctrl"}</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  );
}

const groups: { heading: string; icon: React.ReactNode; items: NavItem[] }[] = [
  { heading: "Guides", icon: <FileIcon />, items: guides },
  { heading: "Explore", icon: <SparklesIcon />, items: explore },
  { heading: "Components", icon: <BoxIcon />, items: componentPages },
  { heading: "Blocks and pages", icon: <LayoutIcon />, items: blockPages },
];

/** In order, with gaps allowed: "dashbord" fits "dashboard". */
function isSubsequence(needle: string, hay: string) {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i++;
  return i === needle.length;
}

/**
 * Titles outrank keywords, so "dashboard" finds the Dashboard page before pages that only mention
 * dashboards. Typos still match through the subsequence step. Item values are "Title /href/".
 */
function rank(value: string, search: string, keywords?: string[]): number {
  const q = search.trim().toLowerCase();
  if (!q) return 1;
  const title = value.slice(0, value.lastIndexOf(" /")).toLowerCase();
  const words = q.split(/\s+/);
  const extra = (keywords ?? []).join(" ").toLowerCase();
  if (title.startsWith(q)) return 1;
  if (title.includes(q)) return 0.9;
  if (words.every((w) => title.includes(w))) return 0.8;
  if (isSubsequence(q.replace(/\s+/g, ""), title)) return 0.6;
  if (words.every((w) => `${title} ${extra}`.includes(w))) return 0.4;
  return 0;
}

/** Site search, built on junco's CommandDialog. ⌘K / Ctrl+K toggles it anywhere; "/" opens it when not typing. */
export function SearchDialog() {
  const { open, setOpen } = useSearch();
  const router = useRouter();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;
      e.preventDefault();
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search docs"
      description="Search guides, components, blocks and pages."
      classNames={{ content: "max-w-xl" }}
      filter={rank}
    >
      <CommandInput placeholder="Search guides, components and blocks" />
      <CommandList className="max-h-[min(60vh,420px)]">
        <CommandEmpty>No results.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.items.map((item) => (
              <CommandItem
                key={item.href}
                // cmdk matches on value + keywords; the href keeps values unique.
                value={`${item.title} ${item.href}`}
                keywords={item.keywords ? [item.keywords] : undefined}
                onSelect={() => go(item.href)}
                className="group"
              >
                {group.icon}
                <span className="flex-1 truncate">{item.title}</span>
                <CommandShortcut className="opacity-0 group-data-[selected=true]:opacity-100">
                  <ArrowRightIcon width={14} height={14} />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="flex items-center gap-3 border-t border-border px-3 py-2 text-xs text-muted-foreground" aria-hidden>
        <span className="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> to move
        </span>
        <span className="flex items-center gap-1">
          <Kbd>↵</Kbd> to open
        </span>
        <span className="ml-auto flex items-center gap-1">
          <Kbd>Esc</Kbd> to close
        </span>
      </div>
    </CommandDialog>
  );
}
