# HackHarbor: a hackathon site built with Junco

A complete event website for a 36-hour student hackathon in Seattle: hero with a live countdown, sponsors, tracks, a 3D globe of where hackers come from, the schedule by day, prizes, judges, FAQ and a registration form.

Sponsors, judges and numbers are invented for the example.

Live demo: https://junco.madebytobi.com/demos/hackathon/

## Run it

From the repo root:

```bash
pnpm install
pnpm --filter @junco/example-hackathon... build   # builds the Junco packages it uses, then the site
pnpm --filter @junco/example-hackathon dev
```

## What it uses

| Junco piece | Where |
| --- | --- |
| `@junco/blocks/marketing` | `SiteHeader`, `Hero` (bold), `StatsBand`, `FeatureGrid`, `Faq`, `CtaSection`, `SiteFooter`, `Container`, `Section`, `SectionHeading` |
| `@junco/motion` | `Reveal`, `NumberTicker`, `Marquee` (sponsors), `SpotlightCard` (tracks), `GradientBorder` (grand prize), `BorderBeam`, `confetti()` |
| `@junco/three` | `ShaderGradient` behind the hero, `Globe` with points and arcs (lazy loaded, with a fallback) |
| `junco` | `Tabs` (schedule), `Badge`, `Avatar`, `Card`, `Popover` + `Tooltip` (display settings), `Toaster` / `toast()` |
| `junco/form` | `Form`, `FormField`, `FormSubmit`, `FormRootError` with a Zod schema: inputs, two selects, a radio group, a switch and a required checkbox |

The accent is Harbor violet, set once in `src/index.css` by overriding `--primary`. Theme and motion (full, subtle, off) live in the sliders popover in the header.

Routing is hash-based (`#/register`, plus `#tracks`-style section anchors), so the built site works from any subfolder: `vite.config.ts` sets `base: "./"`.

## Files

- `src/data.ts`: all the content
- `src/shell.tsx`: header, footer, display settings and the hash router
- `src/home.tsx`: the landing page sections
- `src/register.tsx`: the registration form and success state
