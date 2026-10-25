/**
 * Theme helpers with no React and no "use client", so they work in server components
 * (import them from "junco/server" there).
 */

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type Motion = "full" | "subtle" | "off";

export const DARK_QUERY = "(prefers-color-scheme: dark)";

export interface ThemeScriptOptions {
  /** Same as ThemeProvider's defaultTheme. Default "system". */
  defaultTheme?: Theme;
  /** Same as ThemeProvider's defaultMotion. Default "full". */
  defaultMotion?: Motion;
  /** Same as ThemeProvider's storageKey. Default "junco". */
  storageKey?: string;
}

/** Sets `.dark`, `data-theme`, `data-motion` and `color-scheme` on an element (the <html> element by default). */
export function applyTheme(resolved: ResolvedTheme, motion: Motion, el: HTMLElement = document.documentElement) {
  el.classList.toggle("dark", resolved === "dark");
  el.dataset.theme = resolved;
  el.dataset.motion = motion;
  el.style.colorScheme = resolved;
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
}: ThemeScriptOptions = {}): string {
  const args = [storageKey, defaultTheme, defaultMotion]
    .map((v) => JSON.stringify(v).replace(/</g, "\\u003c"))
    .join(",");
  return `(function(k,t,m){try{var s=localStorage;t=s.getItem(k+"-theme")||t;m=s.getItem(k+"-motion")||m}catch(e){}var d=t==="dark"||(t==="system"&&matchMedia("${DARK_QUERY}").matches),r=d?"dark":"light",e=document.documentElement;e.classList.toggle("dark",d);e.dataset.theme=r;e.dataset.motion=m;e.style.colorScheme=r})(${args})`;
}
