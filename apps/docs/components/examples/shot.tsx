import { cn } from "@/lib/cn";

/** A screenshot in a quiet browser frame. Shows the light or dark capture to match the site theme. */
export function BrowserShot({
  light,
  dark,
  alt,
  url,
  priority = false,
  className,
}: {
  light?: string;
  dark?: string;
  alt: string;
  url?: string;
  priority?: boolean;
  className?: string;
}) {
  const loading = priority ? "eager" : "lazy";
  return (
    <figure className={cn("overflow-hidden rounded-card border border-border bg-surface", className)}>
      <div className="flex h-8 items-center gap-1.5 border-b border-border bg-muted px-3" aria-hidden>
        <span className="size-2.5 rounded-pill bg-border-strong/60" />
        <span className="size-2.5 rounded-pill bg-border-strong/60" />
        <span className="size-2.5 rounded-pill bg-border-strong/60" />
        {url && (
          <span className="mx-auto truncate rounded-xs bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {url}
          </span>
        )}
      </div>
      <div className="relative aspect-[16/10] bg-muted">
        {light && (
          <img src={light} alt={alt} loading={loading} decoding="async" className={cn("absolute inset-0 size-full object-cover object-top", dark && "dark:hidden")} />
        )}
        {dark && (
          <img src={dark} alt={alt} loading={loading} decoding="async" className={cn("absolute inset-0 size-full object-cover object-top", light && "hidden dark:block")} />
        )}
      </div>
    </figure>
  );
}

/** A phone screenshot in a rounded device frame. */
export function PhoneShot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-[28px] border-[6px] border-foreground/90 bg-foreground shadow-overlay", className)}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block aspect-[390/844] w-full rounded-[22px] object-cover object-top" />
    </figure>
  );
}
