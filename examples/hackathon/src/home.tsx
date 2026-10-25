import { Container, CtaSection, Faq, FeatureGrid, Hero, Section, SectionHeading, StatsBand } from "@junco/blocks/marketing";
import { BorderBeam, GradientBorder, Marquee, NumberTicker, Reveal, SpotlightCard } from "@junco/motion";
import { Globe, ShaderGradient } from "@junco/three";
import {
  Avatar,
  Badge,
  Button,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
  type BadgeProps,
} from "junco";
import * as React from "react";
import {
  EVENT_START,
  faq,
  judges,
  origins,
  prizes,
  schedule,
  sponsors,
  stats,
  tracks,
  type ScheduleKind,
  type TrackId,
} from "./data";
import {
  BedIcon,
  CalendarIcon,
  CheckIcon,
  CpuIcon,
  GraduationIcon,
  HeartPulseIcon,
  LandmarkIcon,
  LeafIcon,
  MapPinIcon,
  MicIcon,
  RocketIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
  UtensilsIcon,
  WalletIcon,
} from "./icons";

/* Countdown ------------------------------------------------------------------------------- */

function useNow(intervalMs = 1000) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Countdown() {
  const now = useNow();
  const ms = Math.max(0, EVENT_START.getTime() - now);
  const parts = [
    { label: "Days", value: Math.floor(ms / 86_400_000) },
    { label: "Hours", value: Math.floor(ms / 3_600_000) % 24 },
    { label: "Minutes", value: Math.floor(ms / 60_000) % 60 },
    { label: "Seconds", value: Math.floor(ms / 1000) % 60 },
  ];
  const summary = `${parts[0]!.value} days, ${parts[1]!.value} hours until opening ceremony`;
  return (
    <div className="grid grid-cols-4 gap-2" role="timer" aria-label={summary}>
      {parts.map((p) => (
        <div key={p.label} className="grid gap-1 rounded-card border border-border bg-background/70 px-2 py-3 text-center backdrop-blur" aria-hidden>
          <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
            {String(p.value).padStart(2, "0")}
          </span>
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

/** The "ticket" in the hero: dates, place, countdown and the essentials. */
function EventTicket() {
  return (
    <div className="grid gap-6 rounded-[calc(var(--radius)*1.5)] bg-card p-5 text-left sm:grid-cols-[1.1fr_1fr] sm:p-7">
      <div className="grid content-start gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="primary">Spring 2027</Badge>
          <Badge variant="outline" color="success" hasDot>
            Registration open
          </Badge>
        </div>
        <div className="grid gap-3 text-sm">
          <p className="flex items-center gap-2.5">
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span>
              <strong className="font-medium">April 9 to 11, 2027</strong>
              <span className="text-muted-foreground"> · Friday 4 PM to Sunday 3 PM</span>
            </span>
          </p>
          <p className="flex items-center gap-2.5">
            <MapPinIcon className="size-4 text-muted-foreground" />
            <span>
              <strong className="font-medium">Harborview University</strong>
              <span className="text-muted-foreground"> · Seattle, WA</span>
            </span>
          </p>
          <p className="flex items-center gap-2.5">
            <UsersIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Teams of 1 to 4 · Free for every student</span>
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          {[
            [UtensilsIcon, "All meals"],
            [BedIcon, "Nap rooms"],
            [CpuIcon, "Hardware lab"],
            [MicIcon, "12 workshops"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof UtensilsIcon;
            return (
              <li key={label as string} className="flex items-center gap-2 rounded-control bg-muted px-2.5 py-2">
                <I className="size-4 text-primary" />
                {label as string}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="grid content-start gap-3">
        <p className="text-sm font-medium">Hacking starts in</p>
        <Countdown />
        <Button asChild size="lg" className="mt-2 w-full">
          <a href="#/register">Save your spot</a>
        </Button>
        <p className="text-center text-xs text-muted-foreground">Takes 2 minutes. Travel stipends available.</p>
      </div>
    </div>
  );
}

/* Sections -------------------------------------------------------------------------------- */

function HeroSection() {
  return (
    <div className="relative isolate overflow-hidden">
      <ShaderGradient
        className="absolute inset-0 -z-10 opacity-70 dark:opacity-45"
        clearCenter={0.6}
        speed={0.5}
        alt=""
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-linear-to-t from-background to-transparent" />
      <Hero
        variant="bold"
        hasBackdrop={false}
        announcement={{ label: "Registration for Spring 2027 is open", href: "#/register", tag: "Apr 9–11" }}
        title="36 hours to build something real"
        rotatingWords={["first-timers", "designers", "engineers", "dreamers"]}
        description="HackHarbor brings 500+ students to Seattle for a weekend of building, learning and free food. Bring an idea, or find one here."
        primaryAction={{ label: "Register now", href: "#/register" }}
        secondaryAction={{ label: "See the schedule", href: "#schedule" }}
        note={null}
        media={null}
      />
      <Container className="pb-16 sm:pb-24">
        <Reveal delay={360} distance={32} className="relative mx-auto max-w-5xl">
          <div className="relative rounded-[calc(var(--radius)*2)] border border-border bg-surface/60 p-1.5 shadow-overlay backdrop-blur sm:p-2">
            <EventTicket />
            <BorderBeam />
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

function SponsorWordmark({ name, index }: { name: string; index: number }) {
  const shapes = ["rounded-full", "rounded-xs", "rotate-45 rounded-[2px]", "rounded-full ring-2 ring-current bg-transparent"];
  return (
    <span className="flex items-center gap-2 text-lg font-semibold tracking-tight whitespace-nowrap text-muted-foreground">
      <span aria-hidden className={cn("size-4 bg-current", shapes[index % shapes.length])} />
      {name}
    </span>
  );
}

function Sponsors() {
  return (
    <section id="sponsors" aria-labelledby="sponsors-title" className="border-y border-border bg-muted/40 py-10">
      <Container>
        <h2 id="sponsors-title" className="mb-6 text-center text-sm font-medium text-muted-foreground">
          Made possible by teams who hire from our community
        </h2>
        <Marquee duration={40} gap="3.5rem" fade aria-label="Sponsors">
          {sponsors.map((s, i) => (
            <SponsorWordmark key={s} name={s} index={i} />
          ))}
        </Marquee>
      </Container>
    </section>
  );
}

const trackIcons: Record<TrackId, typeof SparklesIcon> = {
  ai: SparklesIcon,
  fintech: WalletIcon,
  health: HeartPulseIcon,
  civic: LandmarkIcon,
  climate: LeafIcon,
  beginner: RocketIcon,
};

function Tracks() {
  return (
    <Section id="tracks">
      <Container>
        <SectionHeading
          eyebrow="Tracks"
          title="Pick a problem worth losing sleep over"
          description="Every project is eligible for the grand prize. Tracks add their own prizes, mentors and judges."
        />
        <Reveal stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t) => {
            const Icon = trackIcons[t.id];
            return (
              <SpotlightCard key={t.id} className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-10 place-items-center rounded-card bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <Badge variant="outline">{t.prize}</Badge>
                </div>
                <div className="grid gap-1.5">
                  <h3 className="text-base font-semibold tracking-tight">{t.name}</h3>
                  <p className="text-sm text-pretty text-muted-foreground">{t.description}</p>
                </div>
                <p className="mt-auto text-xs text-muted-foreground">
                  Presented by <span className="font-medium text-foreground">{t.sponsor}</span>
                </p>
              </SpotlightCard>
            );
          })}
        </Reveal>
      </Container>
    </Section>
  );
}

function About() {
  return (
    <FeatureGrid
      id="about"
      eyebrow="Why come"
      title="Everything you need to ship, nothing you need to bring"
      description="HackHarbor is run by students, for students. First hackathon? You're in good company: 40% of last year's hackers were too."
      variant="lines"
      columns={3}
      features={[
        { icon: GraduationIcon, title: "Every major welcome", description: "Teams need designers, writers and pitch people as much as coders. Come as you are." },
        { icon: MicIcon, title: "Workshops all weekend", description: "Git, APIs, design, LLM apps and hardware. Each one ends with something you can use." },
        { icon: UsersIcon, title: "Mentors on call", description: "Engineers from our sponsors sit with you when you're stuck, from 9 AM to 2 AM." },
        { icon: UtensilsIcon, title: "Real food, all day", description: "Five meals, snacks at midnight and coffee that never runs out. Every diet covered." },
        { icon: CpuIcon, title: "Hardware lab", description: "Arduinos, sensors, a 3D printer and soldering stations, with someone to show you how." },
        { icon: TrophyIcon, title: "$25,000 in prizes", description: "Cash, interviews with sponsor teams and a demo slot at the closing ceremony." },
      ]}
    />
  );
}

function Reach() {
  const arcs = origins.slice(1).map((o) => ({ from: { lat: o.lat, lng: o.lng }, to: { lat: origins[0]!.lat, lng: origins[0]!.lng }, label: `${o.label} to Seattle` }));
  return (
    <Section className="overflow-hidden">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="grid gap-6">
          <SectionHeading
            align="start"
            eyebrow="Community"
            title="Hackers fly in from 40+ schools"
            description="Last year's teams came from across the East Coast, the South, Canada, the UK and West Africa. Travel stipends make the trip possible."
          />
          <dl className="grid grid-cols-3 gap-6">
            {[
              { value: 42, label: "Schools" },
              { value: 9, label: "Countries" },
              { value: 61, suffix: "%", label: "First-gen students" },
            ].map((s) => (
              <div key={s.label} className="grid gap-1">
                <dt className="text-sm text-muted-foreground">{s.label}</dt>
                <dd className="text-3xl font-semibold tracking-tight tabular-nums">
                  <NumberTicker value={s.value} />
                  {s.suffix}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[32rem]">
          <Globe
            className="absolute inset-0"
            points={origins}
            arcs={arcs}
            label="Globe showing where last year's hackers traveled from to Seattle"
            fallback={<GlobeFallback />}
          />
        </div>
      </Container>
    </Section>
  );
}

function GlobeFallback() {
  return (
    <div className="grid h-full place-items-center rounded-pill border border-border bg-[radial-gradient(circle_at_35%_30%,color-mix(in_oklch,var(--primary)_22%,var(--card)),var(--card))]">
      <ul className="grid max-w-60 gap-1 text-center text-sm text-muted-foreground">
        {origins.slice(0, 6).map((o) => (
          <li key={o.label}>{o.label}</li>
        ))}
        <li>and more</li>
      </ul>
    </div>
  );
}

const kindColor: Record<ScheduleKind, BadgeProps["color"]> = {
  Ceremony: "primary",
  Workshop: "neutral",
  Food: "warning",
  Hacking: "success",
  Fun: "neutral",
};

function Schedule() {
  return (
    <Section id="schedule" className="bg-muted/40">
      <Container size="md">
        <SectionHeading eyebrow="Schedule" title="The weekend, hour by hour" description="All times Eastern. We'll post room changes on Discord and on the screens in the lobby." />
        <Tabs defaultValue={schedule[0]!.day} variant="segmented" className="mt-10">
          <div className="flex justify-center">
            <TabsList aria-label="Day">
              {schedule.map((d) => (
                <TabsTrigger key={d.day} value={d.day} className="px-3 sm:px-4">
                  <span className="sm:hidden">{d.day.slice(0, 3)}</span>
                  <span className="hidden sm:inline">
                    {d.day}, {d.date}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {schedule.map((d) => (
            <TabsContent key={d.day} value={d.day} className="mt-6">
              <ol className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
                {d.items.map((item) => (
                  <li key={item.time + item.title} className="grid grid-cols-[5.5rem_1fr] items-center gap-x-4 gap-y-1 px-4 py-3.5 sm:grid-cols-[7rem_1fr_auto] sm:px-5">
                    <time className="font-mono text-sm text-muted-foreground tabular-nums">{item.time}</time>
                    <div className="min-w-0">
                      <p className="font-medium">{item.title}</p>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPinIcon className="size-3.5 shrink-0" />
                        {item.place}
                      </p>
                    </div>
                    <Badge
                      variant={item.kind === "Hacking" || item.kind === "Ceremony" ? "solid" : "outline"}
                      color={kindColor[item.kind]}
                      className="col-start-2 justify-self-start sm:col-start-3 sm:justify-self-end"
                    >
                      {item.kind}
                    </Badge>
                  </li>
                ))}
              </ol>
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </Section>
  );
}

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

function Prizes() {
  const [grand, ...rest] = prizes;
  return (
    <Section id="prizes">
      <Container>
        <SectionHeading eyebrow="Prizes" title="$25,000 for the best ideas of the weekend" description="Plus every track prize above. Judged on impact, execution, design and the demo." />
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <GradientBorder className="rounded-[calc(var(--radius)*1.5)]">
            <div className="flex h-full flex-col gap-6 p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-card bg-primary text-primary-foreground">
                  <TrophyIcon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">{grand!.place}</h3>
              </div>
              <p className="text-6xl font-semibold tracking-tighter tabular-nums sm:text-7xl">
                <NumberTicker value={grand!.amount} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
              </p>
              <ul className="grid gap-2.5 text-sm">
                {grand!.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2.5">
                    <CheckIcon className="size-4 text-success-text" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </GradientBorder>
          <div className="grid gap-4">
            {rest.map((p) => (
              <div key={p.place} className="flex items-start justify-between gap-4 rounded-card border border-border bg-card p-5">
                <div className="grid gap-1">
                  <h3 className="font-semibold">{p.place}</h3>
                  <p className="text-sm text-muted-foreground">{p.perks.join(" · ")}</p>
                </div>
                <p className="font-mono text-xl font-semibold tabular-nums">{money(p.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Judges() {
  return (
    <Section id="judges" className="bg-muted/40">
      <Container>
        <SectionHeading eyebrow="Judges and mentors" title="Learn from people who ship for a living" />
        <Reveal stagger as="ul" className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {judges.map((j) => (
            <li key={j.name} className="flex flex-col items-center gap-3 text-center">
              <Avatar name={j.name} size="lg" className="size-16 text-lg" />
              <div>
                <p className="font-medium">{j.name}</p>
                <p className="text-sm text-muted-foreground">
                  {j.role}, {j.org}
                </p>
              </div>
            </li>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}

export function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBand stats={stats} />
      <Sponsors />
      <About />
      <Tracks />
      <Reach />
      <Schedule />
      <Prizes />
      <Judges />
      <Faq
        id="faq"
        eyebrow="FAQ"
        title="Questions, answered"
        items={faq}
        contact={{ label: "Email the organizers", href: "mailto:team@hackharbor.example" }}
      />
      <Separator className="mx-auto max-w-6xl" />
      <CtaSection
        title="Your seat is waiting"
        description="Registration closes March 26 or when we hit 500 hackers, whichever comes first."
        primaryAction={{ label: "Register for HackHarbor", href: "#/register" }}
        secondaryAction={{ label: "Read the FAQ", href: "#faq" }}
      />
    </>
  );
}
