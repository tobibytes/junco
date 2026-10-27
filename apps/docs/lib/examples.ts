import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Example projects live in the repo's examples/<slug>/ folders. Each one with an example.json is
 * shown on /examples; its screenshots are in public/showcase/ and its built site is copied to
 * public/demos/<slug>/ by scripts/prebuild.mjs. Read at build time (static export).
 */
export interface Example {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  packages: string[];
  features: string[];
  source: string;
  /** Screenshot paths under /showcase that exist for this example. */
  shots: { light?: string; dark?: string; phone?: string; details: string[] };
  /** Path of the live demo when its build was copied in, else undefined. */
  demo?: string;
}

const EXAMPLES_DIR = join(process.cwd(), "..", "..", "examples");
const PUBLIC_DIR = join(process.cwd(), "public");

/** Featured order first; anything else follows alphabetically. */
const ORDER = ["collaboration", "pulse", "hackathon", "ledger", "status-page"];

function shot(name: string) {
  return existsSync(join(PUBLIC_DIR, "showcase", name)) ? `/showcase/${name}` : undefined;
}

export function getExamples(): Example[] {
  if (!existsSync(EXAMPLES_DIR)) return [];
  const list: Example[] = [];
  for (const dir of readdirSync(EXAMPLES_DIR)) {
    const file = join(EXAMPLES_DIR, dir, "example.json");
    if (!existsSync(file)) continue;
    const meta = JSON.parse(readFileSync(file, "utf8")) as Omit<Example, "shots" | "demo">;
    const details = readdirSync(join(PUBLIC_DIR, "showcase"))
      .filter((f) => f.startsWith(`${meta.slug}-detail-`))
      .sort()
      .map((f) => `/showcase/${f}`);
    list.push({
      ...meta,
      shots: { light: shot(`${meta.slug}-light.png`), dark: shot(`${meta.slug}-dark.png`), phone: shot(`${meta.slug}-phone.png`), details },
      demo: existsSync(join(PUBLIC_DIR, "demos", meta.slug, "index.html")) ? `/demos/${meta.slug}/` : undefined,
    });
  }
  const rank = (slug: string) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);
  return list.sort((a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug));
}

export function getExample(slug: string): Example | undefined {
  return getExamples().find((e) => e.slug === slug);
}
