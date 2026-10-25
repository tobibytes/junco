"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/content/nav";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const current = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return (
    <nav aria-label="Docs" className="grid gap-6">
      {nav.map((section) => (
        <div key={section.title}>
          <h2 className="mb-1.5 px-2 text-xs font-medium text-muted-foreground">{section.title}</h2>
          <ul className="grid gap-px">
            {section.items.map((item) => {
              const active = current === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center rounded-control px-2 text-sm text-muted-foreground",
                      "transition-colors duration-fast ease-standard hover:bg-accent hover:text-foreground",
                      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                      "aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-foreground",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
