import * as React from "react";
import { Avatar, Button, cn, Field, Input, Kbd } from "@junco/react";
import { confetti, NumberTicker, Reveal, TextReveal } from "@junco/motion";
import { fakePeople } from "../lib/fake";
import { renderSlot, type Slots } from "../lib/slots";
import { ArrowLeftIcon, CheckIcon, CopyIcon, HomeIcon, RefreshIcon, SearchIcon } from "./icons";
import { BrandMark, Container, type Action, type Brand, type NavLink } from "./layout";
import { MarketingLink } from "./link";
import { PageShell } from "./page-shell";
import { ProductMock } from "./product-mock";
import { SiteFooter, type SiteFooterProps } from "./site-footer";
import { SiteHeader, type SiteHeaderProps } from "./site-header";

export type StatusSlots = {
  header: SiteHeaderProps;
  footer: SiteFooterProps;
};

interface ErrorLayoutProps {
  code: string;
  title: React.ReactNode;
  description: React.ReactNode;
  variant: "simple" | "illustrated";
  children?: React.ReactNode;
  actions: React.ReactNode;
}

function ErrorLayout({ code, title, description, variant, children, actions }: ErrorLayoutProps) {
  return (
    <Container size="sm" className="relative isolate flex flex-1 flex-col items-center justify-center py-24 text-center sm:py-32">
      {variant === "illustrated" && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden select-none">
          <span className="text-[clamp(10rem,38vw,22rem)] leading-none font-semibold tracking-tighter text-transparent [-webkit-text-stroke:1px_var(--border)]">
            {code}
          </span>
        </div>
      )}
      <Reveal className="flex flex-col items-center gap-5">
        <p className="font-mono text-sm font-medium text-primary">Error {code}</p>
        <h1 className="text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">{title}</h1>
        <p className="max-w-md text-lg text-pretty text-muted-foreground">{description}</p>
        {children}
        <div className="mt-3 flex flex-wrap justify-center gap-3">{actions}</div>
      </Reveal>
    </Container>
  );
}

export interface NotFoundPageProps {
  /** "illustrated" sets a huge outlined 404 behind the text; "simple" is text only. */
  variant?: "simple" | "illustrated";
  brand?: Brand;
  nav?: NavLink[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  homeAction?: Action;
  /** Popular destinations to suggest. */
  suggestions?: NavLink[];
  /** Show a search box that submits to this URL with `?q=`. */
  searchAction?: string | null;
  slots?: Slots<StatusSlots>;
  className?: string;
}

/** 404: say what happened, offer a way home, suggest where to go next. */
export function NotFoundPage({
  variant = "illustrated",
  brand,
  nav,
  title = "We couldn't find that page",
  description = "It may have moved, or the link might be wrong. Here are a few places to try instead.",
  homeAction = { label: "Back to home", href: "/" },
  suggestions = [
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Contact support", href: "/contact" },
  ],
  searchAction = "/search",
  slots,
  className,
}: NotFoundPageProps) {
  return (
    <PageShell
      className={className}
      classNames={{ main: "flex flex-col" }}
      header={renderSlot(slots, "header", SiteHeader, { brand, links: nav })}
      footer={renderSlot(slots, "footer", SiteFooter, { brand })}
    >
      <ErrorLayout
        code="404"
        title={title}
        description={description}
        variant={variant}
        actions={
          <Button asChild size="lg">
            <MarketingLink href={homeAction.href}>
              <ArrowLeftIcon className="size-4" />
              {homeAction.label}
            </MarketingLink>
          </Button>
        }
      >
        {searchAction && (
          <form action={searchAction} role="search" className="mt-2 flex w-full max-w-sm gap-2">
            <Field label="Search the site" classNames={{ root: "flex-1", label: "sr-only" }}>
              <Input name="q" type="search" placeholder="Search docs and pages" />
            </Field>
            <Button type="submit" variant="outline" size="icon" aria-label="Search">
              <SearchIcon className="size-4" />
            </Button>
          </form>
        )}
        {suggestions.length > 0 && (
          <nav aria-label="Suggested pages" className="mt-2">
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
              {suggestions.map((s) => (
                <li key={s.href}>
                  <MarketingLink href={s.href} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    {s.label}
                  </MarketingLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </ErrorLayout>
    </PageShell>
  );
}

export interface ServerErrorPageProps {
  variant?: "simple" | "illustrated";
  brand?: Brand;
  nav?: NavLink[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** A reference people can quote to support. */
  errorId?: string;
  /** Called by "Try again". Defaults to reloading the page. */
  onRetry?: () => void;
  statusHref?: string | null;
  homeHref?: string;
  slots?: Slots<StatusSlots>;
  className?: string;
}

/** 500: own the problem, offer a retry, give support a reference. */
export function ServerErrorPage({
  variant = "illustrated",
  brand,
  nav,
  title = "Something went wrong on our side",
  description = "It's not you. We've been alerted and are looking into it. Trying again usually works.",
  errorId = "err_7f3a2c91",
  onRetry,
  statusHref = "/status",
  homeHref = "/",
  slots,
  className,
}: ServerErrorPageProps) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(errorId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the id is still visible to copy by hand
    }
  };

  return (
    <PageShell
      className={className}
      classNames={{ main: "flex flex-col" }}
      header={renderSlot(slots, "header", SiteHeader, { brand, links: nav })}
      footer={renderSlot(slots, "footer", SiteFooter, { brand })}
    >
      <ErrorLayout
        code="500"
        title={title}
        description={description}
        variant={variant}
        actions={
          <>
            <Button size="lg" onClick={onRetry ?? (() => window.location.reload())}>
              <RefreshIcon className="size-4" />
              Try again
            </Button>
            <Button asChild size="lg" variant="outline">
              <MarketingLink href={homeHref}>
                <HomeIcon className="size-4" />
                Go home
              </MarketingLink>
            </Button>
          </>
        }
      >
        {errorId && (
          <div className="flex items-center gap-2 rounded-control border border-border bg-muted py-1 pr-1 pl-3 text-sm">
            <span className="text-muted-foreground">Reference</span>
            <code className="font-mono">{errorId}</code>
            <Button size="sm" variant="ghost" onClick={copy} aria-label={copied ? "Copied" : "Copy reference"} className="h-7 px-2">
              {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
            </Button>
            <span aria-live="polite" className="sr-only">
              {copied ? "Reference copied" : ""}
            </span>
          </div>
        )}
        {statusHref && (
          <p className="text-sm text-muted-foreground">
            Check{" "}
            <MarketingLink href={statusHref} className="font-medium text-foreground underline underline-offset-4">
              system status
            </MarketingLink>{" "}
            for live updates.
          </p>
        )}
      </ErrorLayout>
    </PageShell>
  );
}

export interface WaitlistPageProps {
  /** "centered" is a single column; "split" adds a product preview on wide screens. */
  variant?: "centered" | "split";
  brand?: Brand;
  title?: string;
  description?: React.ReactNode;
  /** How many people already joined, for social proof. `null` hides it. */
  count?: number | null;
  /** Called with a valid email. Throw or reject to show an error. */
  onJoin?: (email: string) => void | Promise<void>;
  /** Shown after joining. */
  successMessage?: React.ReactNode;
  slots?: Slots<{ footer: SiteFooterProps }>;
  className?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A launch waitlist: pitch, email, social proof, and a small celebration when you join. */
export function WaitlistPage({
  variant = "centered",
  brand = { name: "Orbit", href: "/" },
  title = "Orbit 3 is almost here",
  description = "Plans that update themselves, a timeline that warns you before dates slip, and an AI teammate that does the busywork. Join the waitlist for early access.",
  count = 8432,
  onJoin,
  successMessage = "We'll email you when your invite is ready. Want to skip the line? Share Orbit with a friend.",
  slots,
  className,
}: WaitlistPageProps) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [pending, setPending] = React.useState(false);
  const [joined, setJoined] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const people = React.useMemo(() => fakePeople(5, 21), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("Enter an email like you@company.com.");
      return;
    }
    setError(undefined);
    setPending(true);
    try {
      await onJoin?.(email.trim());
      setJoined(true);
      void confetti({ from: buttonRef.current });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  const isSplit = variant === "split";
  return (
    <PageShell
      className={className}
      classNames={{ main: "flex flex-col" }}
      header={
        <Container className="flex h-16 items-center">
          <MarketingLink
            href={brand.href ?? "/"}
            className="flex items-center gap-2 rounded-control font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {brand.logo ?? <BrandMark />}
            {brand.name}
          </MarketingLink>
        </Container>
      }
      footer={renderSlot(slots, "footer", SiteFooter, {
        brand,
        variant: "minimal",
        columns: [{ title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] }],
      })}
    >
      <div className="relative isolate flex flex-1 items-center overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000,transparent)]"
        />
        <Container className={cn("py-20 sm:py-28", isSplit && "grid items-center gap-14 lg:grid-cols-2")}>
          <div className={cn("flex flex-col gap-6", isSplit ? "items-start" : "mx-auto max-w-2xl items-center text-center")}>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                <span aria-hidden className="size-1.5 rounded-pill bg-primary" />
                Early access
              </span>
            </Reveal>
            <TextReveal as="h1" className="text-4xl leading-[1.08] font-semibold tracking-tighter text-balance sm:text-6xl">
              {title}
            </TextReveal>
            <Reveal as="p" delay={120} className="max-w-xl text-lg text-pretty text-muted-foreground">
              {description}
            </Reveal>

            <Reveal delay={200} className="w-full max-w-md">
              {joined ? (
                <div role="status" className={cn("flex flex-col gap-2 rounded-card border border-border bg-card p-5", !isSplit && "items-center")}>
                  <p className="flex items-center gap-2 font-medium">
                    <span className="grid size-6 place-items-center rounded-pill bg-success text-success-foreground">
                      <CheckIcon className="size-3.5" strokeWidth={2.5} />
                    </span>
                    You're on the list
                  </p>
                  <p className="text-sm text-muted-foreground">{successMessage}</p>
                </div>
              ) : (
                <form noValidate onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <Field label="Work email" error={error} classNames={{ root: "flex-1 text-left", label: "sr-only" }}>
                    <Input
                      type="email"
                      size="lg"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Button ref={buttonRef} type="submit" size="lg" isLoading={pending}>
                    Join the waitlist
                  </Button>
                </form>
              )}
              {!joined && (
                <p className={cn("mt-3 text-xs text-muted-foreground", !isSplit && "text-center")}>
                  No spam. Unsubscribe anytime. Press <Kbd>Enter</Kbd> to join.
                </p>
              )}
            </Reveal>

            {count !== null && (
              <Reveal delay={280} className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {people.map((p) => (
                    <Avatar key={p.id} name={p.name} size="sm" className="ring-2 ring-background" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    <NumberTicker value={count} />
                  </span>{" "}
                  people already joined
                </p>
              </Reveal>
            )}
          </div>
          {isSplit && (
            <Reveal delay={240} distance={28} className="hidden lg:block">
              <ProductMock />
            </Reveal>
          )}
        </Container>
      </div>
    </PageShell>
  );
}
