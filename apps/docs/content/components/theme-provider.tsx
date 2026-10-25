"use client";

import { Badge, Button, useTheme } from "junco";
import { MotionSegmented, ThemeSegmented } from "@/components/theme-controls";
import { useMounted } from "@/lib/use-mounted";
import type { ComponentDoc } from "./types";

function LiveState() {
  const { theme, resolvedTheme, motion } = useTheme();
  const mounted = useMounted();
  const show = (value: string) => (mounted ? value : "…");
  return (
    <div className="grid w-full max-w-sm gap-4 rounded-card border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium">Theme</span>
        <ThemeSegmented />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium">Motion</span>
        <MotionSegmented />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border pt-4 font-mono text-xs">
        <Badge variant="outline">theme: {show(theme)}</Badge>
        <Badge variant="outline">resolved: {show(resolvedTheme)}</Badge>
        <Badge variant="outline">motion: {show(motion)}</Badge>
      </div>
      <div key={motion} className="animate-rise">
        <Button size="sm" variant="soft">
          I rise in with motion on
        </Button>
      </div>
    </div>
  );
}

export const doc: ComponentDoc = {
  imports: ["ThemeProvider", "useTheme", "themeScript"],
  usage: {
    installed: `// app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
  </head>
  <body>
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>

// anywhere
const { theme, setTheme, resolvedTheme, motion, setMotion } = useTheme();`,
    semantic: `<!-- No provider needed: set the attributes yourself -->
<html class="dark" data-theme="dark" data-motion="subtle">`,
  },
  examples: [
    {
      title: "Live",
      description: "These controls drive this whole site. The state below comes from useTheme().",
      Preview: LiveState,
      code: `const { theme, setTheme, resolvedTheme, motion, setMotion } = useTheme();

<button onClick={() => setTheme("dark")}>Dark</button>
<button onClick={() => setMotion("off")}>Motion off</button>`,
    },
  ],
  props: [
    {
      component: "ThemeProvider",
      props: [
        { name: "defaultTheme", type: '"light" | "dark" | "system"', default: '"system"', description: "Used until the user picks one." },
        { name: "defaultMotion", type: '"full" | "subtle" | "off"', default: '"full"', description: "prefers-reduced-motion always turns motion off regardless." },
        { name: "theme / motion", type: "Theme / Motion", description: "Controlled mode. The provider then never writes storage." },
        { name: "onThemeChange / onMotionChange", type: "(value) => void", description: "Called when setTheme / setMotion runs." },
        { name: "storageKey", type: "string", default: '"junco"', description: "localStorage prefix: stores <key>-theme and <key>-motion." },
      ],
    },
    {
      component: "useTheme()",
      props: [
        { name: "theme", type: '"light" | "dark" | "system"', description: "What the user picked." },
        { name: "resolvedTheme", type: '"light" | "dark"', description: "What's showing now." },
        { name: "setTheme / setMotion", type: "(value) => void", description: "Change and persist." },
        { name: "motion", type: '"full" | "subtle" | "off"', description: "The global motion level." },
      ],
    },
    {
      component: "themeScript()",
      description: "An inline script for <head> that applies the saved theme before first paint.",
      props: [{ name: "options", type: "{ defaultTheme?, defaultMotion?, storageKey? }", description: "Match what you pass to ThemeProvider." }],
    },
  ],
  a11y: [
    "Sets color-scheme on <html>, so native controls and scrollbars match the theme.",
    "prefers-reduced-motion always wins, even over data-motion=\"full\".",
    "Spinners keep turning (slower) with motion off since they carry meaning; entrance animations stop.",
  ],
};
