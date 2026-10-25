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
  { title: "Installation", href: "/docs/installation/", keywords: "install setup next vite html getting started" },
  { title: "The four levels", href: "/docs/levels/", keywords: "semantic classes utilities copy-in installed" },
  { title: "Theming", href: "/docs/theming/", keywords: "tokens colors accent primary contrast css variables" },
  { title: "Dark mode and motion", href: "/docs/dark-mode/", keywords: "theme provider reduced motion data-motion" },
  { title: "CLI", href: "/docs/cli/", keywords: "junco add init diff update eject" },
  { title: "MCP and AI", href: "/docs/mcp/", keywords: "llms.txt model context protocol claude agents" },
  { title: "Accessibility", href: "/docs/accessibility/", keywords: "a11y keyboard screen reader axe wcag" },
  { title: "Changelog", href: "/docs/changelog/", keywords: "releases versions" },
];

export const nav: NavSection[] = [
  { title: "Getting started", items: guides },
  ...categories
    .map((category) => ({
      title: category,
      items: components
        .filter((c) => c.category === category)
        .map((c) => ({ title: c.title, href: `/components/${c.slug}/`, keywords: c.description })),
    }))
    .filter((section) => section.items.length > 0),
];

/** Flat list in reading order, for prev/next links and search. */
export const allPages: NavItem[] = [
  ...guides,
  { title: "Components", href: "/components/", keywords: "all components index" },
  ...nav.slice(1).flatMap((s) => s.items),
];
