import * as React from "react";

import { applyTheme, DARK_QUERY, type Motion, type ResolvedTheme, type Theme } from "./theme-script";

export { applyTheme, themeScript, type Motion, type ResolvedTheme, type Theme, type ThemeScriptOptions } from "./theme-script";

export interface ThemeContextValue {
  /** What the user picked. */
  theme: Theme;
  /** What is showing right now ("system" resolved against the OS setting). */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  motion: Motion;
  setMotion: (motion: Motion) => void;
  /**
   * False during server rendering and the first client render, where `theme` and `motion` are
   * still the defaults. Use it to avoid showing a wrong "selected" state in theme toggles.
   */
  isMounted: boolean;
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

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

/** Light, dark and system themes plus the data-motion switch, saved to localStorage, with a no-flash themeScript for SSR. */
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

  // Start from the defaults on both server and client so hydration matches, then read the saved
  // choice and the OS setting in a layout effect (before paint, so there's no flash).
  const [storedTheme, setStoredTheme] = React.useState<Theme>(defaultTheme);
  const [storedMotion, setStoredMotion] = React.useState<Motion>(defaultMotion);
  const [system, setSystem] = React.useState<ResolvedTheme>("light");
  const [isMounted, setIsMounted] = React.useState(false);

  const theme = controlledTheme ?? storedTheme;
  const motion = controlledMotion ?? storedMotion;
  const resolvedTheme = theme === "system" ? system : theme;

  useIsomorphicLayoutEffect(() => {
    setStoredTheme(read(themeKey, THEMES) ?? defaultTheme);
    setStoredMotion(read(motionKey, MOTIONS) ?? defaultMotion);
    setSystem(systemTheme());
    setIsMounted(true);
    // Only on mount and when the storage key changes; later default changes don't override a saved choice.
  }, [themeKey, motionKey]);

  React.useEffect(() => {
    const mq = window.matchMedia?.(DARK_QUERY);
    if (!mq) return;
    const onChange = () => setSystem(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useIsomorphicLayoutEffect(() => {
    // Before mount the <html> attributes come from themeScript (or nothing); don't overwrite them
    // with the defaults for one frame.
    if (isMounted) applyTheme(resolvedTheme, motion);
  }, [isMounted, resolvedTheme, motion]);

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
    () => ({ theme, resolvedTheme, setTheme, motion, setMotion, isMounted }),
    [theme, resolvedTheme, setTheme, motion, setMotion, isMounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>.");
  return ctx;
}
