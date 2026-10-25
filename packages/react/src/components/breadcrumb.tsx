import * as React from "react";
import { cn } from "../lib/cn";
import { ChevronRightIcon, MoreHorizontalIcon } from "../lib/icons";
import { Slot } from "../lib/primitives";

export interface BreadcrumbItemData {
  label: React.ReactNode;
  /** Omit on the last item (the current page). */
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Shorthand: render these items. Or compose BreadcrumbList / BreadcrumbItem yourself. */
  items?: BreadcrumbItemData[];
  /** With more items than this, the middle collapses to "…". Default: never collapse. */
  maxItems?: number;
  /** Custom separator. Default a chevron. */
  separator?: React.ReactNode;
  /** Render links through your router, e.g. `(item, props) => <Link to={item.href} {...props} />`. */
  renderLink?: (item: BreadcrumbItemData, props: { className: string; children: React.ReactNode }) => React.ReactNode;
  classNames?: Partial<Record<"root" | "list" | "item" | "link" | "page" | "separator", string>>;
}

const linkClass =
  "rounded-xs text-muted-foreground transition-colors duration-fast ease-standard hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 *   <Breadcrumb items={[{ label: "Projects", href: "/projects" }, { label: "Junco" }]} />
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, classNames, items, maxItems, separator, renderLink, children, ...props }, ref) => {
    let content = children;
    if (items) {
      const collapse = maxItems !== undefined && items.length > maxItems && maxItems >= 2;
      const shown: (BreadcrumbItemData | "ellipsis")[] = collapse
        ? [items[0]!, "ellipsis", ...items.slice(items.length - (maxItems - 1))]
        : items;
      content = (
        <BreadcrumbList className={classNames?.list}>
          {shown.map((item, i) => {
            const isLast = i === shown.length - 1;
            return (
              <React.Fragment key={i}>
                <BreadcrumbItem className={classNames?.item}>
                  {item === "ellipsis" ? (
                    <BreadcrumbEllipsis />
                  ) : isLast || !item.href ? (
                    <BreadcrumbPage className={classNames?.page} aria-current={isLast ? "page" : undefined}>
                      {item.label}
                    </BreadcrumbPage>
                  ) : renderLink ? (
                    renderLink(item, { className: cn(linkClass, classNames?.link), children: item.label })
                  ) : (
                    <BreadcrumbLink href={item.href} className={classNames?.link}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className={classNames?.separator}>{separator}</BreadcrumbSeparator>}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      );
    }
    return (
      <nav ref={ref} aria-label="Breadcrumb" data-slot="breadcrumb" className={cn(classNames?.root, className)} {...props}>
        {content}
      </nav>
    );
  },
);
Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbList = React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn("flex flex-wrap items-center gap-1.5 text-sm break-words", className)} {...props} />
  ),
);
BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />,
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render your router's Link as the child. */
  asChild?: boolean;
}

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return <Comp ref={ref} className={cn(linkClass, className)} {...props} />;
  },
);
BreadcrumbLink.displayName = "BreadcrumbLink";

export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} aria-current="page" className={cn("font-medium text-foreground", className)} {...props} />
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

export function BreadcrumbSeparator({ className, children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li role="presentation" aria-hidden className={cn("text-muted-foreground [&>svg]:size-3.5", className)} {...props}>
      {children ?? <ChevronRightIcon />}
    </li>
  );
}

export function BreadcrumbEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("grid size-5 place-items-center text-muted-foreground", className)} {...props}>
      <MoreHorizontalIcon aria-hidden className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
