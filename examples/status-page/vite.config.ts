import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

/**
 * The page ships as plain HTML + CSS. The 90-day uptime bars are generated here at build time
 * from a fixed fake history, so the browser never runs JavaScript to draw them.
 */
function uptimeBars(): Plugin {
  const DAY = 86_400_000;
  const today = Date.UTC(2026, 9, 25);
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  // Days (0 = 89 days ago, 89 = today) that weren't clean.
  const history: Record<string, Record<number, "minor" | "major">> = {
    api: { 12: "minor", 61: "minor" },
    dashboard: { 33: "minor" },
    search: { 4: "minor", 5: "major", 88: "minor", 89: "minor" },
    webhooks: {},
    realtime: { 47: "major", 48: "minor" },
    storage: { 70: "minor" },
  };

  const bar = (service: string, i: number) => {
    const state = history[service]?.[i] ?? "ok";
    const date = fmt.format(new Date(today - (89 - i) * DAY));
    const label = state === "ok" ? "No incidents" : state === "minor" ? "Degraded performance" : "Partial outage";
    return `<span class="uptime-bar tooltip" data-state="${state}" data-tip="${date}: ${label}"></span>`;
  };

  return {
    name: "junco-uptime-bars",
    transformIndexHtml(html) {
      return html.replace(/<!--\s*uptime:([\w-]+)\s*-->/g, (_, service: string) =>
        Array.from({ length: 90 }, (_, i) => bar(service, i)).join(""),
      );
    },
  };
}

export default defineConfig({
  // Hosted under https://junco.madebytobi.com/demos/status-page/
  base: "./",
  plugins: [tailwindcss(), uptimeBars()],
});
