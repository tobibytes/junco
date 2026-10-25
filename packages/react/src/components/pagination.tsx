import * as React from "react";
import { cn } from "../lib/cn";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "../lib/icons";
import { buttonVariants } from "./button";

export type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

export interface UsePaginationOptions {
  /** 1-based current page. */
  page: number;
  /** Total number of pages (at least 1). */
  pageCount: number;
  /** Pages shown on each side of the current one. Default 1. */
  siblings?: number;
  /** Pages always shown at each end. Default 1. */
  boundaries?: number;
}

/**
 * The list of page numbers and ellipses to render. Always returns the same number of items
 * once there are enough pages, so the control doesn't change width as you page.
 *
 *   usePagination({ page: 6, pageCount: 20 }) // [1, "ellipsis-start", 5, 6, 7, "ellipsis-end", 20]
 */
export function getPaginationItems({ page, pageCount, siblings = 1, boundaries = 1 }: UsePaginationOptions): PaginationItem[] {
  const total = Math.max(1, Math.floor(pageCount));
  const current = Math.min(Math.max(1, Math.floor(page)), total);
  const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

  // boundaries on both ends + siblings on both sides + current + two ellipses
  const slots = boundaries * 2 + siblings * 2 + 3;
  if (total <= slots) return range(1, total);

  const start = range(1, boundaries);
  const end = range(total - boundaries + 1, total);
  const siblingsStart = Math.max(Math.min(current - siblings, total - boundaries - siblings * 2 - 1), boundaries + 2);
  const siblingsEnd = Math.min(Math.max(current + siblings, boundaries + siblings * 2 + 2), total - boundaries - 1);

  return [
    ...start,
    ...(siblingsStart > boundaries + 2 ? (["ellipsis-start"] as const) : siblingsStart === boundaries + 2 ? [boundaries + 1] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < total - boundaries - 1 ? (["ellipsis-end"] as const) : siblingsEnd === total - boundaries - 1 ? [total - boundaries] : []),
    ...end,
  ];
}

export function usePagination(options: UsePaginationOptions) {
  const { page, pageCount, siblings, boundaries } = options;
  const items = React.useMemo(
    () => getPaginationItems({ page, pageCount, siblings, boundaries }),
    [page, pageCount, siblings, boundaries],
  );
  const total = Math.max(1, pageCount);
  return { items, hasPrevious: page > 1, hasNext: page < total, pageCount: total };
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  siblings?: number;
  boundaries?: number;
  /** Builds a URL per page so each page is a real link (better for SEO and middle-click). */
  getHref?: (page: number) => string;
  size?: "sm" | "md";
  /** Hide the numbered pages (prev/next + "Page x of y"), e.g. on narrow screens. */
  isCompact?: boolean;
  /** Accessible name for the nav. Default "Pagination". */
  label?: string;
  classNames?: Partial<Record<"root" | "list" | "item" | "ellipsis" | "summary", string>>;
}

/** Numbered page links with previous/next. The current page has aria-current="page". */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      className,
      classNames,
      page,
      pageCount,
      onPageChange,
      siblings,
      boundaries,
      getHref,
      size = "md",
      isCompact = false,
      label = "Pagination",
      ...props
    },
    ref,
  ) => {
    const { items, hasPrevious, hasNext, pageCount: total } = usePagination({ page, pageCount, siblings, boundaries });
    const btnSize = size === "sm" ? "sm" : "md";
    // On phones the md size steps down so prev + 7 pages + next fit in one row at 360px.
    const square = size === "sm" ? "min-w-8 px-1.5" : "min-w-9 px-2 max-sm:h-8 max-sm:min-w-8 max-sm:px-1.5";

    const go = (target: number) => (event: React.MouseEvent) => {
      // let modified clicks open links in a new tab
      if (getHref && (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1)) return;
      event.preventDefault();
      if (target !== page) onPageChange(target);
    };

    // A render function, not a component: a component defined here would remount on every
    // render and drop keyboard focus after "Next".
    const pageLink = ({
      target,
      disabled,
      children,
      className: extra,
      ...rest
    }: { target: number; disabled?: boolean; children: React.ReactNode } & React.AriaAttributes & { className?: string }) => {
      const cls = cn(buttonVariants({ variant: "ghost", size: btnSize }), "tabular-nums", extra);
      if (disabled) {
        return (
          <span aria-disabled="true" className={cn(cls, "pointer-events-none opacity-50")} {...rest}>
            {children}
          </span>
        );
      }
      return getHref ? (
        <a href={getHref(target)} onClick={go(target)} className={cls} {...rest}>
          {children}
        </a>
      ) : (
        <button type="button" onClick={go(target)} className={cls} {...rest}>
          {children}
        </button>
      );
    };

    return (
      <nav
        ref={ref}
        aria-label={label}
        data-slot="pagination"
        className={cn("flex items-center", classNames?.root, className)}
        {...props}
      >
        <ul className={cn("flex items-center gap-1 max-sm:gap-0.5", classNames?.list)}>
          <li>
            {pageLink({
              target: page - 1,
              disabled: !hasPrevious,
              "aria-label": "Previous page",
              className: cn("gap-1 pr-3 pl-2", !isCompact && "max-sm:size-8 max-sm:px-0"),
              children: (
                <>
                  <ChevronLeftIcon className="size-4" />
                  <span className={isCompact ? "sr-only" : "max-sm:sr-only"}>Previous</span>
                </>
              ),
            })}
          </li>
          {isCompact ? (
            <li className={cn("px-2 text-sm text-muted-foreground tabular-nums", classNames?.summary)} aria-live="polite">
              Page {Math.min(page, total)} of {total}
            </li>
          ) : (
            items.map((item) =>
              typeof item === "number" ? (
                <li key={item} className={classNames?.item}>
                  {pageLink({
                    target: item,
                    "aria-label": `Page ${item}`,
                    "aria-current": item === page ? "page" : undefined,
                    className: cn(square, item === page && "border-border bg-surface text-foreground hover:bg-surface"),
                    children: item,
                  })}
                </li>
              ) : (
                <li
                  key={item}
                  aria-hidden
                  className={cn("grid place-items-center text-muted-foreground", square, classNames?.ellipsis)}
                >
                  <MoreHorizontalIcon className="size-4" />
                </li>
              ),
            )
          )}
          <li>
            {pageLink({
              target: page + 1,
              disabled: !hasNext,
              "aria-label": "Next page",
              className: cn("gap-1 pr-2 pl-3", !isCompact && "max-sm:size-8 max-sm:px-0"),
              children: (
                <>
                  <span className={isCompact ? "sr-only" : "max-sm:sr-only"}>Next</span>
                  <ChevronRightIcon className="size-4" />
                </>
              ),
            })}
          </li>
        </ul>
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";
