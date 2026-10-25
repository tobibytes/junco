"use client";

// TODO: swap this for junco's CommandDialog once the Command palette ships (Phase 2 overlays).

import { Kbd } from "junco";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import * as React from "react";
import { allPages, guides, type NavItem } from "@/content/nav";
import { ArrowRightIcon, BoxIcon, FileIcon, SearchIcon } from "./icons";
import { useSearch } from "./providers";

const guideHrefs = new Set(guides.map((g) => g.href));

function score(item: NavItem, q: string): number {
  if (!q) return 1;
  const title = item.title.toLowerCase();
  if (title.startsWith(q)) return 3;
  if (title.includes(q)) return 2;
  const words = q.split(/\s+/).filter(Boolean);
  const hay = `${title} ${item.keywords ?? ""}`.toLowerCase();
  return words.every((w) => hay.includes(w)) ? 1 : 0;
}

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

export function SearchDialog() {
  const { open, setOpen } = useSearch();
  const router = useRouter();
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);

  const q = query.trim().toLowerCase();
  const results = React.useMemo(
    () =>
      allPages
        .map((item, i) => ({ item, s: score(item, q), i }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s || a.i - b.i)
        .map((r) => r.item),
    [q],
  );
  const groups = [
    { label: "Guides", items: results.filter((r) => guideHrefs.has(r.href)) },
    { label: "Components", items: results.filter((r) => !guideHrefs.has(r.href)) },
  ].filter((g) => g.items.length > 0);
  const flat = groups.flatMap((g) => g.items);

  // The <dialog> element is the source of truth for open/closed. Opening and closing happen
  // imperatively and React state follows, so fast key sequences (Esc then Cmd+K) can't leave
  // the two out of step.
  const returnFocus = React.useRef<HTMLElement | null>(null);

  const show = React.useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    dialog.showModal();
    inputRef.current?.focus();
    setOpen(true);
  }, [setOpen]);

  const hide = React.useCallback(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, []);

  // Global shortcuts: Cmd/Ctrl+K anywhere toggles, "/" opens when not typing.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable=true]");
      const isOpen = dialogRef.current?.open;
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) hide();
        else show();
      } else if (e.key === "/" && !typing && !isOpen) {
        e.preventDefault();
        show();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, hide]);

  // Runs for every close (Esc, backdrop, picking a result): sync state, return focus.
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      const el = returnFocus.current;
      returnFocus.current = null;
      if (el?.isConnected) el.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [setOpen]);

  // Opening from elsewhere (the header button) goes through context state.
  React.useEffect(() => {
    if (open) show();
    else hide();
  }, [open, show, hide]);

  React.useEffect(() => setActive(0), [q]);

  React.useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(item: NavItem | undefined) {
    if (!item) return;
    returnFocus.current = null; // a new page is loading; don't jump back to the old trigger
    hide();
    router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(flat.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]);
    }
  }

  let index = -1;
  const listId = "search-results";

  return (
    <dialog
      ref={dialogRef}
      data-state={open ? "open" : "closed"}
      aria-label="Search docs"
      onClick={(e) => {
        if (e.target === dialogRef.current) hide();
      }}
      className={cn(
        "m-0 mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-card border border-border bg-popover p-0 text-popover-foreground shadow-overlay",
        "open:animate-pop-in",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <SearchIcon className="shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search guides and components"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={flat[active] ? `search-option-${active}` : undefined}
          aria-label="Search"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <Kbd className="shrink-0">Esc</Kbd>
      </div>
      <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="max-h-[min(60vh,420px)] overflow-y-auto p-1.5">
        {groups.map((group) => (
          <div key={group.label} role="group" aria-label={group.label}>
            <div aria-hidden className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">
              {group.label}
            </div>
            {group.items.map((item) => {
              index += 1;
              const i = index;
              const isGuide = guideHrefs.has(item.href);
              return (
                <div
                  key={item.href}
                  id={`search-option-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item)}
                  className="group flex h-9 cursor-pointer items-center gap-2.5 rounded-control px-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  {isGuide ? (
                    <FileIcon className="shrink-0 text-muted-foreground" />
                  ) : (
                    <BoxIcon className="shrink-0 text-muted-foreground" />
                  )}
                  <span className="flex-1 truncate">{item.title}</span>
                  <ArrowRightIcon className="shrink-0 text-muted-foreground opacity-0 group-aria-selected:opacity-100" />
                </div>
              );
            })}
          </div>
        ))}
        {flat.length === 0 && (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground" role="status">
            No results for “{query}”.
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 border-t border-border px-3 py-2 text-xs text-muted-foreground" aria-hidden>
        <span className="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> to move
        </span>
        <span className="flex items-center gap-1">
          <Kbd>↵</Kbd> to open
        </span>
      </div>
    </dialog>
  );
}
