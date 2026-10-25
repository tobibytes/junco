import Link from "next/link";
import { allPages } from "@/content/nav";
import { ArrowLeftIcon, ArrowRightIcon } from "../icons";

/** Previous / next links in reading order. */
export function Pager({ href }: { href: string }) {
  const i = allPages.findIndex((p) => p.href === href);
  if (i === -1) return null;
  const prev = allPages[i - 1];
  const next = allPages[i + 1];
  const card =
    "group flex flex-col gap-1 rounded-card border border-border p-4 transition-colors duration-fast ease-standard hover:border-input hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  return (
    <nav aria-label="Pagination" className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className={card}>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeftIcon width={12} height={12} /> Previous
          </span>
          <span className="text-sm font-medium">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.href} className={`${card} sm:items-end sm:text-right`}>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Next <ArrowRightIcon width={12} height={12} />
          </span>
          <span className="text-sm font-medium">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
