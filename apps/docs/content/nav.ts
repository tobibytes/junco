import { blocks } from "./blocks/catalog";
import { categories, components } from "./components";

export interface NavItem {
  title: string;
  href: string;
  /** Extra words for search. */
  keywords?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const guides: NavItem[] = [
  { title: "Introduction", href: "/docs/", keywords: "overview about" },
  { title: "Installation", href: "/docs/installation/", keywords: "install setup next vite html getting started junco/server" },
  { title: "The four levels", href: "/docs/levels/", keywords: "semantic classes utilities copy-in installed" },
  { title: "Theming", href: "/docs/theming/", keywords: "tokens colors accent primary contrast css variables" },
  { title: "Dark mode and motion", href: "/docs/dark-mode/", keywords: "theme provider reduced motion data-motion themeScript" },
  { title: "CLI", href: "/docs/cli/", keywords: "junco init add diff update list eject registry shadcn" },
  { title: "SwiftUI", href: "/docs/swiftui/", keywords: "swift ios macos iphone ipad visionos apple native xcode swiftpm" },
  { title: "MCP and AI", href: "/docs/mcp/", keywords: "llms.txt model context protocol claude cursor agents" },
  { title: "Accessibility", href: "/docs/accessibility/", keywords: "a11y keyboard screen reader axe wcag" },
  { title: "Changelog", href: "/docs/changelog/", keywords: "releases versions" },
];

/** The galleries beyond the component docs. */
export const explore: NavItem[] = [
  { title: "Blocks and pages", href: "/blocks/", keywords: "templates landing dashboard pricing auth settings sections @junco/blocks" },
  { title: "Motion", href: "/motion/", keywords: "animation reveal marquee ticker typewriter spotlight confetti view transitions @junco/motion" },
  { title: "3D", href: "/3d/", keywords: "three webgl globe particles shader gradient model viewer tilt @junco/three" },
  { title: "Examples", href: "/examples/", keywords: "showcase demo projects pulse ledger hackharbor hackathon status page saas finance" },
];

export const nav: NavSection[] = [
  { title: "Getting started", items: guides },
  { title: "Explore", items: explore },
  ...categories
    .map((category) => ({
      title: category,
      items: components
        .filter((c) => c.category === category)
        .map((c) => ({ title: c.title, href: `/components/${c.slug}/`, keywords: c.description })),
    }))
    .filter((section) => section.items.length > 0),
];

export const componentPages: NavItem[] = [
  { title: "Components", href: "/components/", keywords: "all components index" },
  ...nav.slice(2).flatMap((s) => s.items),
];

export const blockPages: NavItem[] = blocks.map((b) => ({
  title: b.title,
  href: `/blocks/${b.slug}/`,
  keywords: `${b.category} ${b.component} ${b.description}`,
}));

/** Flat list in reading order, for prev/next links. Guides and components only. */
export const allPages: NavItem[] = [...guides, ...componentPages];

/** Everything search and the sitemap know about. */
export const searchablePages: NavItem[] = [...guides, ...explore, ...componentPages, ...blockPages];
