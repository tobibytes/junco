import * as React from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type Motion = "full" | "subtle" | "off";

export interface ThemeContextValue {
  /** What the user picked. */
  theme: Theme;
  /** What is showing right now ("system" resolved against the OS setting). */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  motion: Motion;
  setMotion: (motion: Motion) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";
const THEMES: readonly Theme[] = ["light", "dark", "system"];
const MOTIONS: readonly Motion[] = ["full", "subtle", "off"];

function read<T extends string>(key: string, allowed: readonly T[]): T | null {
  try {
    const value = localStorage.getItem(key);
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage blocked (private mode, sandboxed iframe): the choice just won't persist
  }
}

function systemTheme(): ResolvedTheme {
  return typeof window !== "undefined" && window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";
}

/** Sets `.dark`, `data-theme`, `data-motion` and `color-scheme` on an element (the <html> element by default). */
export function applyTheme(resolved: ResolvedTheme, motion: Motion, el: HTMLElement = document.documentElement) {
  el.classList.toggle("dark", resolved === "dark");
  el.dataset.theme = resolved;
  el.dataset.motion = motion;
  el.style.colorScheme = resolved;
}

export interface ThemeProviderProps {
  children?: React.ReactNode;
  /** Used until the user picks one. Default "system". */
  defaultTheme?: Theme;
  /** Default "full". `prefers-reduced-motion` always turns motion off regardless. */
  defaultMotion?: Motion;
  /** Controlled theme. When set, the provider never writes storage for the theme. */
  theme?: Theme;
  /** Controlled motion. */
  motion?: Motion;
  onThemeChange?: (theme: Theme) => void;
  onMotionChange?: (motion: Motion) => void;
  /** localStorage key prefix. Default "junco". Stores `<key>-theme` and `<key>-motion`. */
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultMotion = "full",
  theme: controlledTheme,
  motion: controlledMotion,
  onThemeChange,
  onMotionChange,
  storageKey = "junco",
}: ThemeProviderProps) {
  const themeKey = `${storageKey}-theme`;
  const motionKey = `${storageKey}-motion`;

  const [storedTheme, setStoredTheme] = React.useState<Theme>(() =>
    typeof window === "undefined" ? defaultTheme : (read(themeKey, THEMES) ?? defaultTheme),
  );
  const [storedMotion, setStoredMotion] = React.useState<Motion>(() =>
    typeof window === "undefined" ? defaultMotion : (read(motionKey, MOTIONS) ?? defaultMotion),
  );
  const [system, setSystem] = React.useState<ResolvedTheme>(systemTheme);

  const theme = controlledTheme ?? storedTheme;
  const motion = controlledMotion ?? storedMotion;
  const resolvedTheme = theme === "system" ? system : theme;

  React.useEffect(() => {
    const mq = window.matchMedia?.(DARK_QUERY);
    if (!mq) return;
    const onChange = () => setSystem(mq.matches ? "dark" : "light");
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  React.useLayoutEffect(() => {
    applyTheme(resolvedTheme, motion);
  }, [resolvedTheme, motion]);

  const setTheme = React.useCallback(
    (next: Theme) => {
      if (controlledTheme === undefined) {
        setStoredTheme(next);
        write(themeKey, next);
      }
      onThemeChange?.(next);
    },
    [controlledTheme, onThemeChange, themeKey],
  );

  const setMotion = React.useCallback(
    (next: Motion) => {
      if (controlledMotion === undefined) {
        setStoredMotion(next);
        write(motionKey, next);
      }
      onMotionChange?.(next);
    },
    [controlledMotion, onMotionChange, motionKey],
  );

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme, motion, setMotion }),
    [theme, resolvedTheme, setTheme, motion, setMotion],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>.");
  return ctx;
}

/**
 * An inline script for <head> that applies the saved theme before first paint, so server-rendered
 * pages don't flash light then dark. Use it with the same options you pass to ThemeProvider:
 *
 *   <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
 */
export function themeScript({
  defaultTheme = "system",
  defaultMotion = "full",
  storageKey = "junco",
}: Pick<ThemeProviderProps, "defaultTheme" | "defaultMotion" | "storageKey"> = {}): string {
  const args = [storageKey, defaultTheme, defaultMotion]
    .map((v) => JSON.stringify(v).replace(/</g, "\\u003c"))
    .join(",");
  return `(function(k,t,m){try{var s=localStorage;t=s.getItem(k+"-theme")||t;m=s.getItem(k+"-motion")||m}catch(e){}var d=t==="dark"||(t==="system"&&matchMedia("${DARK_QUERY}").matches),r=d?"dark":"light",e=document.documentElement;e.classList.toggle("dark",d);e.dataset.theme=r;e.dataset.motion=m;e.style.colorScheme=r})(${args})`;
}
