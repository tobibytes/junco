import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Example projects live in the repo's examples/<slug>/ folders. Each one with an example.json is
 * shown on /examples; its screenshots are in public/showcase/ and its built site is copied to
 * public/demos/<slug>/ by scripts/prebuild.mjs. Projects that live in other repos are listed in
 * EXTERNAL below, with screenshots in public/showcase/ the same way. Read at build time (static export).
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
  /** Path of the live demo when its build was copied in, or its full URL for external projects. */
  demo?: string;
  /** Set for projects in other repos: how to run them, and what else they're built on. */
  external?: { run: string; poweredBy?: { name: string; href: string } };
}

type ExternalExample = Omit<Example, "shots">;

const EXTERNAL: ExternalExample[] = [
  {
    slug: "towhee-board",
    title: "Towhee Board",
    tagline: "A realtime team board: live cursors, comments, mentions and version history",
    description:
      "A shared kanban board where everyone sees each other's cursors and edits as they happen. Comment on a card, @mention someone and it lands in their inbox, save a version and restore it for everyone. The UI is Junco; the realtime layer is Towhee, a collaboration server you host yourself on Cloudflare or Docker.",
    tags: ["Realtime", "Collaboration", "Kanban", "Towhee"],
    packages: ["@junco/react", "@junco/blocks", "@junco/tailwind", "@towhee/client"],
    features: [
      "Live cursors and an avatar stack, with a ring on the card each person is editing",
      "Cards on a shared Yjs document that sync instantly and keep working offline",
      "Comment threads per card with replies, reactions, resolve and @mentions",
      "An inbox popover that lights up when someone mentions you",
      "Version history: save, restore for everyone, then undo the restore",
      "Junco Sheet, Popover, DropdownMenu, Avatar, Badge and toasts throughout, light and dark",
    ],
    source: "https://github.com/tobibytes/towhee/tree/main/apps/site/src/demo",
    demo: "https://towhee.madebytobi.com/demo",
    external: {
      run: "git clone https://github.com/tobibytes/towhee.git && cd towhee\npnpm install && pnpm build\ncd deploy/cloudflare && cp .dev.vars.example .dev.vars\npnpm exec wrangler dev   # then open http://localhost:8787/demo",
      poweredBy: { name: "Towhee", href: "https://towhee.madebytobi.com" },
    },
  },
];


const EXAMPLES_DIR = join(process.cwd(), "..", "..", "examples");
const PUBLIC_DIR = join(process.cwd(), "public");

/** Featured order first; anything else follows alphabetically. */
const ORDER = ["pulse", "towhee-board", "hackathon", "ledger", "status-page"];

function shot(name: string) {
  return existsSync(join(PUBLIC_DIR, "showcase", name)) ? `/showcase/${name}` : undefined;
}

function shotsFor(slug: string): Example["shots"] {
  const details = readdirSync(join(PUBLIC_DIR, "showcase"))
    .filter((f) => f.startsWith(`${slug}-detail-`))
    .sort()
    .map((f) => `/showcase/${f}`);
  return { light: shot(`${slug}-light.png`), dark: shot(`${slug}-dark.png`), phone: shot(`${slug}-phone.png`), details };
}

export function getExamples(): Example[] {
  const list: Example[] = EXTERNAL.map((meta) => ({ ...meta, shots: shotsFor(meta.slug) }));
  for (const dir of existsSync(EXAMPLES_DIR) ? readdirSync(EXAMPLES_DIR) : []) {
    const file = join(EXAMPLES_DIR, dir, "example.json");
    if (!existsSync(file)) continue;
    const meta = JSON.parse(readFileSync(file, "utf8")) as Omit<Example, "shots" | "demo">;
    list.push({
      ...meta,
      shots: shotsFor(meta.slug),
      demo: existsSync(join(PUBLIC_DIR, "demos", meta.slug, "index.html")) ? `/demos/${meta.slug}/` : undefined,
    });
  }
  const rank = (slug: string) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);
  return list.sort((a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug));
}

/** The address bar text for a demo: its host and path. */
export function demoHost(demo: string, siteUrl: string): string {
  const url = new URL(demo, siteUrl);
  return `${url.host}${url.pathname}`;
}

export function getExample(slug: string): Example | undefined {
  return getExamples().find((e) => e.slug === slug);
}
