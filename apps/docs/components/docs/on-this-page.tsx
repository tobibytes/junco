"use client";

import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import * as React from "react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Reads the h2/h3 headings in #content and highlights the one in view. */
export function OnThisPage() {
  const pathname = usePathname();
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  const [active, setActive] = React.useState<string>("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: read the headings again on every page change
  React.useEffect(() => {
    const root = document.getElementById("content");
    if (!root) return;
    const read = () =>
      setHeadings(
        Array.from(root.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]"))
          .filter((h) => !h.classList.contains("sr-only") && h.offsetParent !== null)
          .map((h) => ({ id: h.id, text: h.textContent?.replace(/#$/, "").trim() ?? "", level: h.tagName === "H2" ? 2 : 3 })),
      );
    read();
    // Component pages load their body lazily and tabs change what is visible.
    const mo = new MutationObserver(read);
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "data-state"] });
    return () => mo.disconnect();
  }, [pathname]);

  React.useEffect(() => {
    if (headings.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-64px 0px -70% 0px" },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-2 text-xs font-medium text-muted-foreground">On this page</p>
      <ul className="grid gap-1 border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l border-transparent py-0.5 text-muted-foreground transition-colors duration-fast hover:text-foreground",
                h.level === 2 ? "pl-3" : "pl-6",
                "aria-[current=location]:border-foreground aria-[current=location]:text-foreground",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
