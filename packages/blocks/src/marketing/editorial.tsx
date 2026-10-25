import * as React from "react";
import { Avatar, Badge, cn } from "junco";
import { Reveal } from "@junco/motion";
import type { BlogPost, ChangelogItem } from "./content";
import { CoverArt } from "./cover-art";
import { MarketingLink } from "./link";

export function formatDate(iso: string, style: "long" | "short" = "long") {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export interface ChangelogEntryProps extends React.HTMLAttributes<HTMLElement> {
  entry: ChangelogItem;
  /** Link the title to a permalink. */
  href?: string;
  classNames?: { root?: string; meta?: string; body?: string };
}

/** One release: date and version on the left (sticky on wide screens), story on the right. */
export function ChangelogEntry({ entry, href, className, classNames, ...props }: ChangelogEntryProps) {
  const anchor = `v${entry.version.replace(/\./g, "-")}`;
  return (
    <article
      id={anchor}
      aria-labelledby={`${anchor}-title`}
      className={cn("grid gap-4 border-b border-border py-12 last:border-b-0 md:grid-cols-[12rem_1fr] md:gap-10", classNames?.root, className)}
      {...props}
    >
      <div className={cn("flex items-center gap-3 md:sticky md:top-24 md:flex-col md:items-start md:self-start md:gap-2", classNames?.meta)}>
        <time dateTime={entry.date} className="text-sm text-muted-foreground">
          {formatDate(entry.date)}
        </time>
        <Badge variant="outline" className="font-mono">
          v{entry.version}
        </Badge>
      </div>
      <Reveal className="min-w-0">
        {entry.tags && entry.tags.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2" aria-label="Tags">
            {entry.tags.map((t) => (
              <li key={t}>
                <Badge color={t === "New" ? "primary" : "neutral"}>{t}</Badge>
              </li>
            ))}
          </ul>
        )}
        <h2 id={`${anchor}-title`} className="text-2xl font-semibold tracking-tighter text-balance">
          {href ? (
            <MarketingLink href={href} className="hover:underline hover:underline-offset-4">
              {entry.title}
            </MarketingLink>
          ) : (
            entry.title
          )}
        </h2>
        {entry.summary && <p className="mt-2 text-base text-muted-foreground">{entry.summary}</p>}
        {entry.image && <div className="mt-6 overflow-hidden rounded-card border border-border">{entry.image}</div>}
        {entry.body && <div className={cn("prose mt-6", classNames?.body)}>{entry.body}</div>}
      </Reveal>
    </article>
  );
}

export interface BlogCardProps extends React.HTMLAttributes<HTMLElement> {
  post: BlogPost;
  /** Where the card links. Default `/blog/{slug}`. */
  href?: string;
  /**
   * - default: cover on top, text below
   * - featured: wide, cover beside the text on large screens
   * - compact: text only, for lists
   */
  variant?: "default" | "featured" | "compact";
  /** Heading level of the title. Default 3 (2 for featured). */
  headingLevel?: 2 | 3;
  classNames?: { root?: string; cover?: string; title?: string };
}

/** A post preview. The whole card is one link, named by the title. */
export function BlogCard({ post, href, variant = "default", headingLevel, className, classNames, ...props }: BlogCardProps) {
  const H = `h${headingLevel ?? (variant === "featured" ? 2 : 3)}` as "h3";
  const url = href ?? `/blog/${post.slug}`;
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <article
      className={cn(
        "group relative flex flex-col",
        isFeatured && "gap-6 lg:grid lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-10",
        isCompact && "border-b border-border py-6 first:pt-0 last:border-b-0",
        classNames?.root,
        className,
      )}
      {...props}
    >
      {!isCompact && (
        <div
          className={cn(
            "aspect-[16/9] overflow-hidden rounded-card border border-border",
            "[&>*]:transition-transform [&>*]:duration-slow [&>*]:ease-standard group-hover:[&>*]:scale-[1.02]",
            classNames?.cover,
          )}
        >
          {post.cover ?? <CoverArt seed={post.slug} />}
        </div>
      )}
      <div className={cn("flex flex-col gap-2", !isCompact && !isFeatured && "mt-5")}>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          {post.tags[0] && <span className="font-medium text-primary">{post.tags[0]}</span>}
          {post.tags[0] && <span aria-hidden>·</span>}
          <time dateTime={post.date}>{formatDate(post.date, "short")}</time>
          <span aria-hidden>·</span>
          <span>{post.readingTime}</span>
        </p>
        <H
          className={cn(
            "font-semibold tracking-tight text-balance",
            isFeatured ? "text-3xl tracking-tighter sm:text-4xl" : "text-lg",
            classNames?.title,
          )}
        >
          <MarketingLink
            href={url}
            className="rounded-control outline-none after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ring group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4"
          >
            {post.title}
          </MarketingLink>
        </H>
        <p className={cn("text-sm leading-6 text-pretty text-muted-foreground", isFeatured && "text-base sm:text-lg")}>
          {post.excerpt}
        </p>
        <div className="mt-2 flex items-center gap-2.5">
          <Avatar name={post.author.name} src={post.author.avatar} size="xs" />
          <span className="text-sm">{post.author.name}</span>
        </div>
      </div>
    </article>
  );
}
