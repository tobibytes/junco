import * as React from "react";
import { Avatar, Button, cn } from "junco";
import { Reveal } from "@junco/motion";
import { renderSlot, type Slots } from "../lib/slots";
import { defaultPostBody, defaultPosts, defaultPostToc, type BlogPost } from "./content";
import { CoverArt } from "./cover-art";
import { BlogCard, formatDate } from "./editorial";
import { ArrowLeftIcon } from "./icons";
import { Container, type Brand, type NavLink } from "./layout";
import { MarketingLink } from "./link";
import { PageShell } from "./page-shell";
import { SiteFooter, type SiteFooterProps } from "./site-footer";
import { SiteHeader, type SiteHeaderProps } from "./site-header";
import { SubscribeForm } from "./changelog-page";

export type BlogSlots = {
  header: SiteHeaderProps;
  footer: SiteFooterProps;
};

export interface BlogIndexPageProps {
  /** "grid" shows covers in columns; "list" is a quiet text list. */
  variant?: "grid" | "list";
  brand?: Brand;
  nav?: NavLink[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  posts?: BlogPost[];
  /** Show the newest post large at the top. Default true for grid. */
  hasFeatured?: boolean;
  /** Show tag filters. Default true. */
  hasFilters?: boolean;
  getHref?: (post: BlogPost) => string;
  slots?: Slots<BlogSlots>;
  className?: string;
}

/** The blog home: featured post, tag filters, and every post. */
export function BlogIndexPage({
  variant = "grid",
  brand,
  nav,
  title = "Blog",
  description = "Notes on building calm software, from the team behind Orbit.",
  posts = defaultPosts,
  hasFeatured = variant === "grid",
  hasFilters = true,
  getHref,
  slots,
  className,
}: BlogIndexPageProps) {
  const tags = React.useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts]);
  const [tag, setTag] = React.useState<string | null>(null);
  const filtered = tag ? posts.filter((p) => p.tags.includes(tag)) : posts;
  const [featured, ...rest] = filtered;
  const showFeatured = hasFeatured && !tag && featured;
  const list = showFeatured ? rest : filtered;

  return (
    <PageShell
      className={className}
      header={renderSlot(slots, "header", SiteHeader, { brand, links: nav, currentHref: "/blog" })}
      footer={renderSlot(slots, "footer", SiteFooter, { brand })}
    >
      <Container className="pt-16 pb-24 sm:pt-24">
        <Reveal className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl">{title}</h1>
          <p className="max-w-xl text-lg text-muted-foreground">{description}</p>
        </Reveal>

        {showFeatured && (
          <Reveal delay={80} className="mt-12">
            <BlogCard post={featured} variant="featured" href={getHref?.(featured)} />
          </Reveal>
        )}

        {hasFilters && tags.length > 1 && (
          <div role="group" aria-label="Filter by topic" className="mt-14 flex flex-wrap gap-2 border-b border-border pb-6">
            {[null, ...tags].map((t) => (
              <Button
                key={t ?? "all"}
                size="sm"
                variant={tag === t ? "solid" : "outline"}
                aria-pressed={tag === t}
                onClick={() => setTag(t)}
                className="rounded-pill"
              >
                {t ?? "All posts"}
              </Button>
            ))}
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {tag ? `${filtered.length} posts about ${tag}` : ""}
        </p>

        {variant === "grid" ? (
          <Reveal stagger key={tag ?? "all"} as="div" className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((post) => (
              <BlogCard key={post.slug} post={post} href={getHref?.(post)} headingLevel={2} />
            ))}
          </Reveal>
        ) : (
          <div className="mt-10 max-w-3xl">
            {list.map((post) => (
              <BlogCard key={post.slug} post={post} variant="compact" href={getHref?.(post)} headingLevel={2} />
            ))}
          </div>
        )}
      </Container>
    </PageShell>
  );
}

export interface BlogPostPageProps {
  /** "centered" is a single readable column; "with-toc" adds a sticky table of contents. */
  variant?: "centered" | "with-toc";
  brand?: Brand;
  nav?: NavLink[];
  post?: BlogPost;
  /** The article. Rendered inside `.prose`. Give h2s ids to link them from the table of contents. */
  children?: React.ReactNode;
  toc?: { id: string; label: string }[];
  related?: BlogPost[];
  backHref?: string;
  getHref?: (post: BlogPost) => string;
  slots?: Slots<BlogSlots>;
  className?: string;
}

/** One article: title, author, cover, body in prose, table of contents, related posts. */
export function BlogPostPage({
  variant = "with-toc",
  brand,
  nav,
  post = defaultPosts[0]!,
  children = defaultPostBody,
  toc = defaultPostToc,
  related,
  backHref = "/blog",
  getHref,
  slots,
  className,
}: BlogPostPageProps) {
  const more = related ?? defaultPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const hasToc = variant === "with-toc" && toc.length > 0;

  return (
    <PageShell
      className={className}
      header={renderSlot(slots, "header", SiteHeader, { brand, links: nav, currentHref: "/blog" })}
      footer={renderSlot(slots, "footer", SiteFooter, { brand })}
    >
      <article>
        <Container size="md" className="pt-12 sm:pt-16">
          <MarketingLink
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-control text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeftIcon className="size-4" /> All posts
          </MarketingLink>
          <Reveal as="header" className="mt-8 flex flex-col gap-5">
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {post.tags.map((t) => (
                <span key={t} className="font-medium text-primary">
                  {t}
                </span>
              ))}
              <span aria-hidden>·</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{post.readingTime}</span>
            </p>
            <h1 className="text-4xl leading-[1.1] font-semibold tracking-tighter text-balance sm:text-5xl">{post.title}</h1>
            <p className="text-lg text-pretty text-muted-foreground sm:text-xl">{post.excerpt}</p>
            <div className="flex items-center gap-3">
              <Avatar name={post.author.name} src={post.author.avatar} />
              <div className="grid text-sm">
                <span className="font-medium">{post.author.name}</span>
                {post.author.title && <span className="text-muted-foreground">{post.author.title}</span>}
              </div>
            </div>
          </Reveal>
          <Reveal delay={120} distance={24} className="mt-10 aspect-[2/1] overflow-hidden rounded-card border border-border">
            {post.cover ?? <CoverArt seed={post.slug} />}
          </Reveal>
        </Container>

        <Container size="md" className={cn("py-12 sm:py-16", hasToc && "lg:grid lg:grid-cols-[1fr_12rem] lg:gap-12")}>
          <div className="prose min-w-0">{children}</div>
          {hasToc && (
            <nav aria-label="On this page" className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-medium text-muted-foreground">On this page</p>
                <ul className="mt-3 grid gap-2 border-l border-border text-sm">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="-ml-px block border-l border-transparent pl-3 text-muted-foreground hover:border-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          )}
        </Container>
      </article>

      <Container size="md" className="pb-12">
        <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Get new posts by email</h2>
            <p className="mt-1 text-sm text-muted-foreground">One email when we publish. No spam, ever.</p>
          </div>
          <SubscribeForm buttonLabel="Subscribe" />
        </div>
      </Container>

      {more.length > 0 && (
        <section aria-labelledby="more-posts" className="border-t border-border">
          <Container className="py-16 sm:py-20">
            <h2 id="more-posts" className="text-2xl font-semibold tracking-tighter">
              Keep reading
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <BlogCard key={p.slug} post={p} href={getHref?.(p)} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </PageShell>
  );
}
