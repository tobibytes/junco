# Junco plan

Junco is a free, open source design system: tokens, React components, blocks, full pages, app templates, motion, 3D and a prototype kit you install with one command, so every new project looks like one family from day one. It starts from a blank slate, with no older theme rules carried over.

## The look

Clean and minimal, in light and dark. Think Linear or Vercel: lots of space, quiet neutrals, and color only where it means something.

**Principles**

- Neutrals do almost all the work. One accent color (`--primary`) marks primary actions and the current item.
- Light and dark ship together. Every color is a semantic token: a component never says "gray-200", it says "border".
- Depth comes from borders and a slight surface change. Shadows only on floating things like menus, popovers and toasts.
- Type does the hierarchy, not boxes. Fewer containers, more space.
- Each project changes one variable and still feels like Junco.

**Starting tokens**

| Token | Used for | Light | Dark |
| --- | --- | --- | --- |
| background | page | near white | near black |
| surface / card | cards, sidebar, inputs | white | one step lighter than background |
| border | every divider and outline | light gray | dark gray |
| foreground | headings, main text | near black | near white |
| muted-foreground | labels, captions, placeholders | mid gray | mid gray |
| primary | primary button, focus ring, active item | set per project | same hue, tuned for dark |
| success / warning / destructive | status only | green / amber / red | same, tuned for dark |

**Type:** Geist for UI and headings, Geist Mono for code and numbers.
**Shape:** 8px radius on cards and inputs, 6px on small controls, full pill only on tags. 4px spacing scale.

## Four ways to use it

| Level | Feels like | What you get | How you use it |
| --- | --- | --- | --- |
| Semantic classes | daisyUI | `btn btn-primary`, `card`, `badge` in pure CSS, no JS, any framework or plain HTML | `@plugin "@junco/tailwind"`, then `class="btn"` |
| Utilities | Tailwind | tokens as Tailwind classes (`bg-surface`, `text-muted-foreground`, `rounded-card`), plus extras like `animate-rise` | same import, write plain markup |
| Copy-in components | shadcn/ui | source dropped into your repo, yours to edit, still updatable | `npx @junco/cli add dialog` |
| Installed components | NextUI / HeroUI | prebuilt components with `variant`, `size`, `color`, `isLoading` and more | `npm i @junco/react`, `import { Button } from "@junco/react"` |

Also borrowed: a variants system (Tailwind Variants), `className` and slot overrides on every part, built-in themes you switch with one attribute.

```tsx
// globals.css
@import "tailwindcss";
@import "@junco/tailwind";

// utilities
<div className="bg-surface border border-border rounded-card p-4 text-muted-foreground">...</div>

// installed components
import { Button, Sheet } from "@junco/react";
<Button variant="solid" size="sm" isLoading>Save</Button>

// copy one in (terminal)
// npx @junco/cli add sheet
```

## Layers

| Layer | Size | What's in it |
| --- | --- | --- |
| Tokens | a value | color (light + dark), type scale, spacing, radius, shadows, motion timing |
| Primitives | one control | Button, Input, Textarea, Select, Checkbox, Switch, Radio, Tabs, Tooltip, Badge, Avatar, Kbd, Spinner, Skeleton |
| Overlays | one floating thing | Dialog, Sheet, Popover, Dropdown menu, Command palette, Toast |
| Blocks | a section of a page | Card, Stat row, Data table, Empty state, Form, Pricing table, Hero, Feature grid, Sidebar, Page header |
| Pages | a full screen | `npx @junco/cli add page dashboard` adds the page and everything it uses |
| Templates | a whole app | pages wired together with routing, auth and fake data: `npx @junco/cli create my-app --template saas` |

Every page comes in light and dark, works on phones, takes the accent color, and ships with realistic fake data.

## Page catalog (target: about 280 pages, most with 2 to 4 layout variants)

| Category | Pages |
| --- | --- |
| Auth | Sign up, Log in, Magic link sent, Forgot password, Reset password, Verify email, Two-factor setup, Two-factor code, Passkey setup, SSO picker, Invite accept, Account locked, Session expired |
| Onboarding | Welcome, Create workspace, Pick a plan, Import data, Connect integrations, Invite your team, Product tour, Getting started checklist |
| Dashboards | Analytics overview, Sales, Revenue and MRR, Marketing campaigns, Product usage, Web traffic, Finance, Investments and crypto, Project overview, Personal home, Operations, Support metrics, Sports stats, IoT and devices |
| Admin | Users list, User detail, Roles and permissions, Audit log, Moderation queue, Reports and abuse, Feature flags, System health, Jobs and queues, Logs viewer, Database browser, Tenants and orgs, Impersonate user, Broadcast announcement |
| Settings | Profile, Account, Security and sessions, Billing, Plans, Usage and limits, Invoices, Team members, API keys, Webhooks, Integrations, Notifications, Appearance, Language and region, Custom domain, Data export, Delete account |
| Commerce | Storefront home, Category, Product grid, Product detail, Quick view, Cart, Checkout, Order confirmation, Order history, Order tracking, Wishlist, Reviews, Returns, Gift cards, Store locator |
| Seller and inventory | Seller dashboard, Products manager, Add product, Inventory, Orders to fulfill, Discounts and coupons, Payouts, Customers |
| Productivity | Kanban board, Task list, Calendar month, Calendar week, Gantt timeline, Email inbox, Email thread, Docs editor, Notes, File manager, Whiteboard, Spreadsheet grid, Search results, Bookmarks, Time tracker, Habit tracker, Pomodoro |
| Communication | Direct messages, Team channels, Video call, Meeting lobby, Comment thread, Notification center, Activity feed, Forum, Q&A |
| AI | Chat, Chat with sources, Agent run log, Agent builder, Workflow canvas, Prompt playground, Model compare, Image generator, Voice assistant, Knowledge base upload, Evals, Token usage |
| Developer | API reference, API console, Deploys list, Deploy detail and logs, CI runs, Repo browser, Environment variables, Incident detail, Status page, SDK quickstart, Webhook tester, CLI auth success |
| Data and analytics | Report builder, SQL query editor, Funnel, Cohorts, Retention, Map view, CSV import mapper, Table explorer, Saved views |
| CRM and sales | Contacts, Contact detail, Companies, Deal pipeline, Deal detail, Leads, Email campaigns, Sequences, Call log, Quotes |
| Support | Ticket inbox, Ticket detail, Help center home, Help article, Live chat widget, Satisfaction survey, Macros |
| HR and people | Directory, Employee profile, Org chart, Time off, Hiring pipeline, Job board, Candidate detail, Interview scorecard, Payroll, Performance review |
| Finance | Accounts overview, Transactions, Budgets, Savings goals, Invoices list, Create invoice, Expenses, Subscriptions tracker, Wallet, Send money, Tax summary |
| Education | Course catalog, Course overview, Lesson player, Quiz, Flashcards, Grades, Assignment submit, Student dashboard, Study planner, Instructor dashboard |
| Health and fitness | Workout log, Program planner, Exercise library, Nutrition log, Sleep, Progress charts, Body measurements |
| Social and community | Profile, Feed, Post detail, Explore, Followers, Groups, Group detail, Leaderboard, Badges |
| Events and hackathons | Event landing, Schedule, Speakers, Sponsors, Registration, Ticket, Check-in scanner, Team builder, Project submission, Judging, Submissions gallery, Winners |
| Media | Video player, Video library, Music player, Playlist, Podcast episode, Photo gallery, Upload studio, Creator analytics |
| Booking and travel | Search results, Listing detail, Availability calendar, Booking flow, Reservations, Itinerary, Host dashboard |
| Marketplace and listings | Listings grid, Map search, Listing detail, Post a listing, Seller profile, Offers, Saved searches |
| Marketing | Landing (6 variants), Pricing, Features, Product comparison, Integrations, Customers, Case study, Changelog, Public roadmap, Blog index, Blog post, Docs home, FAQ, About, Careers, Job post, Contact, Waitlist, Newsletter, Launch countdown, Press kit, Terms, Privacy, Link in bio, Portfolio, Resume |
| Utility | 404, 500, 403, Maintenance, Offline, Empty workspace, Coming soon, Upgrade required, Unsubscribe, Cookie consent, Loading skeletons |

**Templates:** SaaS, Admin panel, CRM, Store, Marketplace, AI app, Agent platform, Dev tool, Analytics, Fintech, Course platform, Social app, Booking, Help center, Event / hackathon, Docs site, Blog, Portfolio, Link in bio.

Build order: about 20 core pages first (see ROADMAP.md), then add pages when a real project needs them.

## Customizing pages

1. **Config:** `junco.config.ts` sets app name, logo, accent, nav items and routes once.
2. **Props:** typed data and options, like `<DashboardPage stats={...} range="30d" showActivity={false} />`. No data means realistic fake data.
3. **Variants:** `npx @junco/cli add page sign-up --variant split`, or switch later with one prop.
4. **Slots:** `<DashboardPage slots={{ header: MyHeader, sidebar: null }} />`.
5. **Copy it:** `npx @junco/cli add page dashboard --source` drops the full source in, made of normal Junco blocks.
6. **Stay updatable:** copied pages still work with `junco diff` and `junco update`.

## Works with other libraries

| Area | Works with |
| --- | --- |
| Frameworks | Next.js, Vite + React Router, TanStack Start, Remix; semantic classes also in Astro, Vue, Svelte, plain HTML |
| Other UI libraries | shadcn/ui components and themes, Radix or Base UI, daisyUI themes, any Tailwind plugin |
| Forms | React Hook Form, TanStack Form, Zod, Valibot |
| Data fetching | TanStack Query, SWR, tRPC, Server Actions |
| Tables | TanStack Table, TanStack Virtual |
| Charts | Recharts by default, swappable for visx or ECharts |
| Auth | Clerk, Better Auth, Auth.js, Supabase Auth (an adapter for each on the auth pages) |
| Payments | Stripe, Lemon Squeezy, Polar |
| Backends | Supabase, Convex, Firebase, Cloudflare D1, Prisma, Drizzle |
| AI | Vercel AI SDK, Claude API |
| Motion | Motion (formerly Framer Motion), or CSS-only |
| Icons | Lucide by default; Hugeicons, Phosphor or Tabler with one setting |
| Editors, maps, dates | TipTap, MapLibre or Mapbox, date-fns |
| Design tools | Figma variables export, W3C design token format |

## Motion

- Tokens: durations (fast, base, slow), easings (standard, enter, exit, spring), stagger steps, as CSS variables and Tailwind classes
- Global switch `data-motion="off|subtle|full"`, always following `prefers-reduced-motion`
- Built into components: overlays in and out, tabs slide, lists reorder, toasts stack, sheets follow your finger
- Page transitions via the View Transitions API
- Effects: scroll reveal, number counters, text reveal, typewriter, shimmer, marquee, animated beams, spotlight cards, magnetic buttons, confetti, gradient borders, drag and drop
- Two engines: CSS for simple effects, Motion for springs, gestures and layout animations, loaded only where used

## 3D (`@junco/three`)

React Three Fiber + drei, a separate lazy-loaded package.

| Kind | Scenes |
| --- | --- |
| Hero backgrounds | particle field, floating shapes, shader gradient, aurora, wave grid, grain and noise |
| Data | interactive globe with arcs and points, 3D bar chart, network graph |
| Product | model viewer with orbit and hotspots, turntable, color configurator |
| Cards and depth | tilt cards, 3D flip cards, layered parallax |
| Type | 3D text, extruded logo from a supplied SVG |

Scene colors come from the theme tokens. Scenes pause off screen, fall back to a still image without WebGL or in low-power mode, freeze for reduced motion, and accept GLB/GLTF models or Spline embeds.

## Collaboration

Junco ships the collaboration UI. The real-time sync engine is NOT part of Junco: it plugs in through adapters (like auth and payments). A sister project for the engine will be planned separately.

| Kind | What's in it |
| --- | --- |
| Presence | live cursors with names, avatar stack, "who's editing" bar, typing and selection highlights, follow-a-user mode |
| Comments | threads anchored to text or any element, replies, mentions, reactions, resolve/reopen, comment sidebar |
| History | version history sidebar, compare two versions, restore, activity timeline |
| Sharing | share dialog with roles (owner, editor, commenter, viewer), copy link, access requests, invite by email |
| Status | saving/saved indicator, offline and reconnecting banner, conflict notice |
| Editor | rich text editor block on TipTap: toolbar, slash commands, markdown shortcuts, collaboration hooks |
| Pages | Docs editor (Google Docs style), Shared whiteboard, Shared spreadsheet, Team notes, Doc list with "shared with me" |
| Template | Collaborative docs app: doc list, editor, comments, history, sharing |

- Every piece takes plain data (users, cursors, threads, versions) plus callbacks, and shows fake data by default
- Adapters for Yjs, Liveblocks and Cloudflare Durable Objects map a real backend onto the same UI
- Motion out of the box: cursors glide, avatars fade in on join, new comments rise in, saving shows a quiet pulse, all following the global motion switch
- Keep heavy deps (TipTap, Yjs) out of the core `@junco/react` package: ship them as `@junco/collab` (UI + adapter interfaces) and `@junco/editor`, loaded only where used

## The website (`apps/docs`)

Built with Junco itself, deployed on Cloudflare. Previews run in isolated frames, and every view has a shareable URL.

- **Learn:** Docs (getting started per framework, the four levels, theming, customizing, integrations, CLI, MCP and AI setup, accessibility, migrating from shadcn or daisyUI, changelog), Components (live preview, variants, props, keyboard map, a11y notes, code tabs for all four levels)
- **Browse:** Blocks, Pages, Templates (live demos, device toggle, light/dark, accent picker, copy command, deploy buttons), Motion (live sliders, reduced-motion toggle), 3D (orbit and tweak), Showcase
- **Build:** Theme builder (accent, radius, font, density, exports config / CSS / Figma variables), Playground (drag blocks and pages into device frames, share or export code), Prototype mode (click-through flows, present full screen)
- **Everywhere:** Cmd+K search, Markdown docs + llms.txt, "Open in StackBlitz"

## How Junco beats the field

| Library | Best at | What it's missing |
| --- | --- | --- |
| Arc UI | 186 animated components and 111 blocks for shadcn, reduced motion, MCP | React only, copy-in only, no preset themes, most blocks in a $249 Pro tier |
| shadcn/ui | own the source, registry and CLI, Radix or Base UI, presets, MCP, AI chat components | copied code drifts, core app pieces only, no marketing motion |
| daisyUI | 68 pure-CSS components, 35 themes, any framework | no JS behavior for accessible dialogs, menus, comboboxes |
| HeroUI | polished defaults, React Aria, Tailwind v4, React Native | opinionated, installed only, hard to fork one component |
| Mantine | 120+ components, 70+ hooks, dates, forms, rich text, Spotlight | not Tailwind, bigger footprint |
| Magic UI / Aceternity | marketing motion | marketing layer only, heavy effects |
| Kibo UI / Origin UI | Kanban, Gantt, editors, many variants | shadcn add-ons, not a full system |

What Junco does better:

1. Four ways to use it from one set of tokens
2. Copied code that still updates (`junco diff`, `junco update`, `junco eject`)
3. Mantine-level app breadth inside Tailwind
4. Motion as a token-driven layer with a global switch
5. Themes generated from one color with enforced contrast
6. Built for AI agents: MCP server that assembles screens from blocks, llms.txt, a Claude skill
7. A prototype kit nobody else has
8. Everything free, MIT

Sources: uiarc.dev, ui.shadcn.com/docs/changelog, daisyui.com, heroui.com, mantine.dev, designrevision.com (shadcn and Magic UI alternatives), checked Oct 25, 2026.
