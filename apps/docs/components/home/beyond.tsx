"use client";

import { Marquee, NumberTicker } from "@junco/motion";
import { StaticGradient, TiltCard } from "@junco/three";
import Link from "next/link";
import { BlockThumb } from "../blocks/block-thumb";
import { ArrowRightIcon, CubeIcon, LayoutIcon, SparklesIcon } from "../icons";

function Card({
  href,
  icon,
  eyebrow,
  title,
  body,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-card transition-colors duration-fast ease-standard hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative border-b border-border">{children}</div>
      <div className="grid gap-1.5 p-5">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {icon}
          {eyebrow}
        </span>
        <span className="flex items-center justify-between gap-2 text-base font-semibold tracking-tight">
          {title}
          <ArrowRightIcon className="shrink-0 text-muted-foreground transition-transform duration-fast ease-standard group-hover:translate-x-0.5 group-hover:text-foreground" />
        </span>
        <span className="text-sm text-muted-foreground">{body}</span>
      </div>
    </Link>
  );
}

/** Home page teaser for the blocks gallery, motion effects and 3D. */
export function Beyond() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card
        href="/blocks/"
        icon={<LayoutIcon width={14} height={14} />}
        eyebrow="@junco/blocks"
        title="Blocks and pages"
        body="Landing, pricing, dashboards, settings and auth. Typed props, fake data, variants and slots."
      >
        <BlockThumb slug="dashboard-page" variant="default" title="Dashboard page" />
      </Card>
      <Card
        href="/motion/"
        icon={<SparklesIcon width={14} height={14} />}
        eyebrow="@junco/motion"
        title="Motion"
        body="Reveal, tickers, marquees, spotlights and beams, all on one motion switch."
      >
        <div aria-hidden className="preview-canvas grid aspect-[16/10] content-center gap-5 overflow-hidden">
          <div className="grid grid-cols-3 gap-2 px-6 text-center">
            {[
              [48210, "Revenue"],
              [2914, "Users"],
              [312, "Teams"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-control border border-border bg-surface px-2 py-3">
                <NumberTicker value={value as number} className="text-lg font-semibold" />
                <div className="text-[11px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          <Marquee duration={20} gap="2rem">
            {["Northwind", "Globex", "Initech", "Umbrella", "Hooli", "Wonka"].map((n) => (
              <span key={n} className="text-sm font-semibold tracking-tight text-muted-foreground">
                {n}
              </span>
            ))}
          </Marquee>
        </div>
      </Card>
      <Card
        href="/3d/"
        icon={<CubeIcon width={14} height={14} />}
        eyebrow="@junco/three"
        title="3D"
        body="Shader gradients, particles, a globe and a model viewer. Lazy, theme aware, with fallbacks."
      >
        <div aria-hidden className="relative isolate grid aspect-[16/10] place-items-center overflow-hidden">
          <StaticGradient className="-z-10" />
          <TiltCard className="w-3/5 rounded-card border border-border bg-card/80 p-4 backdrop-blur">
            <p className="text-sm font-medium">Theme aware</p>
            <p className="mt-1 text-xs text-muted-foreground">Scenes relight when you switch modes.</p>
          </TiltCard>
        </div>
      </Card>
    </div>
  );
}
