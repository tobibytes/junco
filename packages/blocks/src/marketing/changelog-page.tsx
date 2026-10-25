import * as React from "react";
import { Badge, Button, cn, Field, Input, toast } from "junco";
import { Reveal } from "@junco/motion";
import { renderSlot, type Slots } from "../lib/slots";
import { defaultChangelog, type ChangelogItem } from "./content";
import { ChangelogEntry, formatDate } from "./editorial";
import { RssIcon } from "./icons";
import { Container, type Brand, type NavLink } from "./layout";
import { MarketingLink } from "./link";
import { PageShell } from "./page-shell";
import { SiteFooter, type SiteFooterProps } from "./site-footer";
import { SiteHeader, type SiteHeaderProps } from "./site-header";

export interface SubscribeFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  label?: string;
  buttonLabel?: string;
  /** Called with a valid email. Throw or reject to show an error. Defaults to a toast. */
  onSubscribe?: (email: string) => void | Promise<void>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** One email field and a button, with validation and a pending state. */
export function SubscribeForm({
  label = "Email",
  buttonLabel = "Subscribe",
  onSubscribe = () => {
    toast.success("You're subscribed", { description: "We'll email you when we ship something new." });
  },
  className,
  ...props
}: SubscribeFormProps) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [pending, setPending] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("Enter an email like you@company.com.");
      return;
    }
    setError(undefined);
    setPending(true);
    try {
      await onSubscribe(email.trim());
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className={cn("flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-start", className)} {...props}>
      <Field label={label} error={error} classNames={{ root: "flex-1", label: "sr-only" }}>
        <Input type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Button type="submit" isLoading={pending}>
        {buttonLabel}
      </Button>
    </form>
  );
}

export type ChangelogSlots = {
  header: SiteHeaderProps;
  footer: SiteFooterProps;
};

export interface ChangelogPageProps {
  /** "timeline" shows full entries; "compact" lists titles and summaries with links. */
  variant?: "timeline" | "compact";
  brand?: Brand;
  nav?: NavLink[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  entries?: ChangelogItem[];
  rssHref?: string | null;
  onSubscribe?: SubscribeFormProps["onSubscribe"];
  /** Permalink for an entry. Default `#v{version}`. */
  getHref?: (entry: ChangelogItem) => string;
  slots?: Slots<ChangelogSlots>;
  className?: string;
}

/** What's new, newest first, with email and RSS subscribe. */
export function ChangelogPage({
  variant = "timeline",
  brand,
  nav,
  title = "Changelog",
  description = "New features, improvements and fixes, shipped every week.",
  entries = defaultChangelog,
  rssHref = "/changelog/rss.xml",
  onSubscribe,
  getHref,
  slots,
  className,
}: ChangelogPageProps) {
  return (
    <PageShell
      className={className}
      header={renderSlot(slots, "header", SiteHeader, { brand, links: nav, currentHref: "/changelog" })}
      footer={renderSlot(slots, "footer", SiteFooter, { brand })}
    >
      <Container size="md" className="pt-16 pb-10 sm:pt-24">
        <Reveal className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl">{title}</h1>
          <p className="max-w-xl text-lg text-muted-foreground">{description}</p>
          <div className="mt-2 flex flex-wrap items-start gap-3">
            <SubscribeForm onSubscribe={onSubscribe} />
            {rssHref && (
              <Button asChild variant="ghost">
                <MarketingLink href={rssHref}>
                  <RssIcon className="size-4" /> RSS
                </MarketingLink>
              </Button>
            )}
          </div>
        </Reveal>
      </Container>
      <Container size="md" className="pb-24">
        {variant === "timeline" ? (
          <div className="border-t border-border">
            {entries.map((entry) => (
              <ChangelogEntry key={entry.version} entry={entry} href={getHref?.(entry)} />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {entries.map((entry) => (
              <li key={entry.version}>
                <MarketingLink
                  href={getHref?.(entry) ?? `#v${entry.version.replace(/\./g, "-")}`}
                  className="group grid gap-1 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:grid-cols-[10rem_1fr] sm:gap-6"
                >
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <time dateTime={entry.date}>{formatDate(entry.date, "short")}</time>
                    <Badge variant="outline" className="font-mono">
                      v{entry.version}
                    </Badge>
                  </span>
                  <span>
                    <span className="font-medium group-hover:underline group-hover:underline-offset-4">{entry.title}</span>
                    {entry.summary && <span className="mt-1 block text-sm text-muted-foreground">{entry.summary}</span>}
                  </span>
                </MarketingLink>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </PageShell>
  );
}
