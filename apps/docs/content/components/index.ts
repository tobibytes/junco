import type { ComponentDoc } from "./types";

/**
 * Every documented component. Adding a component = one file in this folder + one line here.
 * The page at /components/<slug> loads the file lazily; title and description are used for
 * metadata, search and the index grid, so they live here.
 */
export interface ComponentEntry {
  slug: string;
  title: string;
  description: string;
  category: Category;
  load: () => Promise<{ doc: ComponentDoc }>;
}

export const categories = ["Actions", "Forms", "Overlays", "Data", "Layout", "Display", "Feedback", "Navigation", "Theming"] as const;
export type Category = (typeof categories)[number];

export const components: ComponentEntry[] = [
  { slug: "button", title: "Button", description: "Triggers an action. Five variants, four sizes, loading state and asChild for links.", category: "Actions", load: () => import("./button") },
  { slug: "input", title: "Input", description: "A single-line text field with sizes and an invalid state.", category: "Forms", load: () => import("./input") },
  { slug: "textarea", title: "Textarea", description: "A multi-line text field that can grow with its content.", category: "Forms", load: () => import("./textarea") },
  { slug: "select", title: "Select", description: "Pick one option from a list, with full keyboard support.", category: "Forms", load: () => import("./select") },
  { slug: "checkbox", title: "Checkbox", description: "A yes/no choice, including an indeterminate state.", category: "Forms", load: () => import("./checkbox") },
  { slug: "switch", title: "Switch", description: "An on/off toggle for settings that apply right away.", category: "Forms", load: () => import("./switch") },
  { slug: "radio-group", title: "Radio group", description: "Pick exactly one option from a small set.", category: "Forms", load: () => import("./radio-group") },
  { slug: "field", title: "Field", description: "Label, control, help text and error, wired together for you.", category: "Forms", load: () => import("./field") },
  { slug: "label", title: "Label", description: "A caption for a form control, with a required marker.", category: "Forms", load: () => import("./label") },
  { slug: "tabs", title: "Tabs", description: "Switch between related views. Line and segmented styles.", category: "Navigation", load: () => import("./tabs") },
  { slug: "tooltip", title: "Tooltip", description: "A short hint on hover and keyboard focus, with an optional shortcut.", category: "Feedback", load: () => import("./tooltip") },
  { slug: "badge", title: "Badge", description: "A short label for status or counts. Never color alone.", category: "Display", load: () => import("./badge") },
  { slug: "avatar", title: "Avatar", description: "A person's picture with initials as the fallback.", category: "Display", load: () => import("./avatar") },
  { slug: "kbd", title: "Kbd", description: "Shows a keyboard key or shortcut.", category: "Display", load: () => import("./kbd") },
  { slug: "separator", title: "Separator", description: "A thin line between content, horizontal or vertical.", category: "Display", load: () => import("./separator") },
  { slug: "spinner", title: "Spinner", description: "An accessible loading indicator.", category: "Feedback", load: () => import("./spinner") },
  { slug: "skeleton", title: "Skeleton", description: "A placeholder shape while content loads.", category: "Feedback", load: () => import("./skeleton") },
  { slug: "form", title: "Form", description: "React Hook Form + Zod, with labels, help text and errors wired for you.", category: "Forms", load: () => import("./form") },
  { slug: "dialog", title: "Dialog", description: "A modal window for focused tasks, with focus trapping and Esc to close.", category: "Overlays", load: () => import("./dialog") },
  { slug: "sheet", title: "Sheet", description: "A panel that slides in from an edge. A swipeable bottom sheet on phones.", category: "Overlays", load: () => import("./sheet") },
  { slug: "popover", title: "Popover", description: "Rich content anchored to a trigger, for small bits of extra UI.", category: "Overlays", load: () => import("./popover") },
  { slug: "dropdown-menu", title: "Dropdown menu", description: "A list of actions with checkbox, radio and nested items.", category: "Overlays", load: () => import("./dropdown-menu") },
  { slug: "command", title: "Command", description: "A searchable command palette, opened with ⌘K.", category: "Overlays", load: () => import("./command") },
  { slug: "toast", title: "Toast", description: "Brief notifications from anywhere with toast(), including promises and actions.", category: "Feedback", load: () => import("./toast") },
  { slug: "data-table", title: "Data table", description: "Sorting, selection, search, column visibility and paging on TanStack Table.", category: "Data", load: () => import("./data-table") },
  { slug: "stat", title: "Stat", description: "A key number with its change and a sparkline. Direction never by color alone.", category: "Data", load: () => import("./stat") },
  { slug: "empty-state", title: "Empty state", description: "Say why there's nothing here, and offer the next step.", category: "Data", load: () => import("./empty-state") },
  { slug: "card", title: "Card", description: "A bordered container with header, action, content and footer parts.", category: "Layout", load: () => import("./card") },
  { slug: "accordion", title: "Accordion", description: "Stacked sections that expand and collapse. Good for FAQs.", category: "Layout", load: () => import("./accordion") },
  { slug: "pagination", title: "Pagination", description: "Move between pages of results, with a fixed width and real links.", category: "Navigation", load: () => import("./pagination") },
  { slug: "breadcrumb", title: "Breadcrumb", description: "Where a page sits in the hierarchy, with links back up.", category: "Navigation", load: () => import("./breadcrumb") },
  { slug: "theme-provider", title: "ThemeProvider", description: "Light, dark and system themes plus the global motion switch.", category: "Theming", load: () => import("./theme-provider") },
];

export function getComponent(slug: string) {
  return components.find((c) => c.slug === slug);
}
