import type { Brand, NavLink } from "@junco/blocks/marketing";

/**
 * Your product. Change these and the whole template follows. The signed-in sidebar lives in
 * routes/app.tsx so the app's code only loads once someone signs in.
 */
export const app = {
  name: "Acme",
  description: "The calm way to run your team's work.",
  pitch: "Acme keeps projects, people and plans in one place, so your team spends less time on status and more time shipping.",
};

export const brand: Brand = { name: app.name, href: "/" };

/** Links in the marketing header. */
export const marketingNav: NavLink[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Changelog", href: "/changelog" },
  { label: "Blog", href: "/blog" },
];

/** Settings tabs, shared by every settings page. */
export const settingsTabs = [
  { label: "Profile", href: "/app/settings/profile" },
  { label: "Billing", href: "/app/settings/billing" },
  { label: "Team", href: "/app/settings/team" },
  { label: "API keys", href: "/app/settings/api-keys" },
  { label: "Notifications", href: "/app/settings/notifications" },
];
