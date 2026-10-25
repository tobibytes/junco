import { SiteFooter, SiteHeader } from "@junco/blocks/marketing";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  useTheme,
  type Motion,
  type Theme,
} from "junco";
import * as React from "react";
import { footerColumns, nav } from "./data";
import { LogoMark, SlidersIcon } from "./icons";

/** Hash routes: "#/register" is the registration page, anything else is the home page. */
export type Route = "home" | "register";

function routeOf(hash: string): Route {
  return hash.startsWith("#/register") ? "register" : "home";
}

export function useHashRoute(): Route {
  const [route, setRoute] = React.useState<Route>(() => routeOf(window.location.hash));
  React.useEffect(() => {
    const onChange = () => {
      const next = routeOf(window.location.hash);
      setRoute(next);
      const hash = window.location.hash;
      // Section anchors (#tracks) scroll after the home page has rendered; routes start at the top.
      requestAnimationFrame(() => {
        if (hash.startsWith("#/") || !hash) window.scrollTo({ top: 0 });
        else document.getElementById(hash.slice(1))?.scrollIntoView();
      });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <span id={`seg-${label}`} className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`seg-${label}`}
        className="grid grid-flow-col gap-0.5 rounded-control border border-border bg-muted p-0.5"
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className="h-7 rounded-xs px-2.5 text-xs font-medium text-muted-foreground transition-colors duration-fast ease-standard hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-checked:bg-surface aria-checked:text-foreground aria-checked:shadow-[0_0_0_1px_var(--border)]"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Theme and motion in one small popover, so the header stays clean. */
export function DisplaySettings() {
  const { theme, setTheme, motion, setMotion, isMounted } = useTheme();
  return (
    <Popover>
      <Tooltip content="Display settings">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Display settings">
            <SlidersIcon className="size-4" />
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent align="end" className="grid w-64 gap-4">
        <Segmented<Theme>
          label="Theme"
          value={isMounted ? theme : "system"}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "Auto" },
          ]}
        />
        <Segmented<Motion>
          label="Motion"
          value={isMounted ? motion : "full"}
          onChange={setMotion}
          options={[
            { value: "full", label: "Full" },
            { value: "subtle", label: "Subtle" },
            { value: "off", label: "Off" },
          ]}
        />
        <p className="text-xs text-muted-foreground">Your system's reduced-motion setting always wins.</p>
      </PopoverContent>
    </Popover>
  );
}

const brand = {
  name: "MorganHacks",
  href: "#/",
  logo: <LogoMark className="size-7" />,
};

export function Header({ route }: { route: Route }) {
  return (
    <SiteHeader
      brand={brand}
      links={nav}
      cta={route === "register" ? null : { label: "Register", href: "#/register" }}
      secondaryCta={null}
      actions={<DisplaySettings />}
    />
  );
}

export function Footer() {
  return (
    <SiteFooter
      brand={brand}
      tagline="A 36-hour student hackathon in Baltimore. Free, beginner friendly, open to every major."
      columns={footerColumns}
      status={null}
      legal={
        <>
          © 2027 MorganHacks. An example site built with{" "}
          <a href="https://junco.madebytobi.com" className="underline underline-offset-4 hover:text-foreground">
            Junco
          </a>
          . Sponsors and people are fictional.
        </>
      }
    />
  );
}
