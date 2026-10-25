"use client";

import { Button, Tooltip, useTheme, type Motion, type Theme } from "junco";
import { useMounted } from "@/lib/use-mounted";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";
import { Segmented } from "./segmented";

/** One-click light/dark flip for the header. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const next = mounted && resolvedTheme === "dark" ? "light" : "dark";
  const label = mounted ? `Switch to ${next} theme` : "Toggle theme";
  return (
    <Tooltip content={label}>
      <Button variant="ghost" size="icon" aria-label={label} onClick={() => setTheme(next)}>
        <SunIcon className="hidden dark:block" />
        <MoonIcon className="dark:hidden" />
      </Button>
    </Tooltip>
  );
}

export function ThemeSegmented({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  return (
    <Segmented<Theme>
      label="Theme"
      iconOnly
      className={className}
      value={mounted ? theme : ("" as Theme)}
      onChange={setTheme}
      options={[
        { value: "light", label: "Light", icon: <SunIcon width={14} height={14} /> },
        { value: "dark", label: "Dark", icon: <MoonIcon width={14} height={14} /> },
        { value: "system", label: "System", icon: <MonitorIcon width={14} height={14} /> },
      ]}
    />
  );
}

export function MotionSegmented({ className }: { className?: string }) {
  const { motion, setMotion } = useTheme();
  const mounted = useMounted();
  return (
    <Segmented<Motion>
      label="Motion"
      className={className}
      value={mounted ? motion : ("" as Motion)}
      onChange={setMotion}
      options={[
        { value: "full", label: "Full" },
        { value: "subtle", label: "Subtle" },
        { value: "off", label: "Off" },
      ]}
    />
  );
}
