import { ThemeProvider, Toaster, TooltipProvider, useTheme } from "@junco/react";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { appRoutes } from "./app-routes";
import { marketingRoutes } from "./marketing-routes";
import type { PreviewRoute } from "./routes";
import "./index.css";

const routes: PreviewRoute[] = [...appRoutes, ...marketingRoutes];

function useHashPath() {
  const read = () => window.location.hash.replace(/^#/, "").split("?")[0] || "/";
  const [path, setPath] = useState(read);
  useEffect(() => {
    const on = () => {
      setPath(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return path;
}

/** ?theme=dark in the hash (or the toggle) picks the theme, for screenshots. */
function ThemeFromHash() {
  const { setTheme } = useTheme();
  useEffect(() => {
    const t = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("theme");
    if (t === "dark" || t === "light") setTheme(t);
  }, [setTheme]);
  return null;
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="fixed right-3 bottom-3 z-toast rounded-pill border border-border bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground shadow-float hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
    >
      {resolvedTheme === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}

function Index() {
  const groups = [...new Set(routes.map((r) => r.group ?? "Other"))];
  return (
    <main className="mx-auto grid max-w-3xl gap-8 px-4 py-12">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Junco blocks</h1>
        <p className="text-sm text-muted-foreground">
          Every page from @junco/blocks with fake data. Toggle dark mode bottom right.
        </p>
      </div>
      {groups.map((g) => (
        <section key={g} className="grid gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">{g}</h2>
          <ul className="grid gap-1 sm:grid-cols-2">
            {routes
              .filter((r) => (r.group ?? "Other") === g)
              .map((r) => (
                <li key={r.path}>
                  <a
                    href={`#${r.path}`}
                    className="block rounded-control px-2 py-1.5 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {r.title}
                  </a>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

function App() {
  const path = useHashPath();
  const route = routes.find((r) => r.path === path);
  return (
    <>
      <ThemeFromHash />
      {route ? <div key={route.path}>{route.element}</div> : <Index />}
      <ThemeToggle />
      <Toaster />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
