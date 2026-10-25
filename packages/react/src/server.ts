/**
 * `@junco/react/server`: helpers that are safe in React Server Components. The main `@junco/react` entry is a
 * client module, so on the server its exports are client references and can't be called. Import
 * these from here instead:
 *
 *   import { cn, buttonVariants, themeScript } from "@junco/react/server";
 *   <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
 *   <Link className={buttonVariants({ variant: "outline" })} href="/docs">Docs</Link>
 */
export { cn } from "./lib/cn";
export { applyTheme, themeScript, type Motion, type ResolvedTheme, type Theme, type ThemeScriptOptions } from "./theme/theme-script";
// Only variants whose component files are server-safe (no React context or Radix at module level).
// `pnpm check:dist` imports this entry under the "react-server" condition to keep it that way.
export { badgeVariants } from "./components/badge";
export { buttonVariants } from "./components/button";
export { cardVariants } from "./components/card";
export { emptyStateVariants } from "./components/empty-state";
export { iconVariants } from "./components/icon";
export { spinnerVariants } from "./components/spinner";
