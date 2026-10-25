# Launch and distribution

Where Junco should be listed, what each one needs, and the order to do it in. Most listings point at the live site or the npm packages, so they come **after** the first deploy and the first npm release.

## Order

1. **Site live** at junco.madebytobi.com (see [deploying](deploying.md)).
2. **First npm release** (see [releasing](releasing.md)). Every install command in every listing depends on it.
3. **Registries** below. Some are automatic, the rest are a form or a PR.
4. **Launch day**: Product Hunt, Show HN, social posts, all on the same day.

## Package and component registries

| Where | Why | How | Ready? |
| --- | --- | --- | --- |
| **npm** (`junco`, `@junco/*`) | The installed level and the CLI | Release workflow (needs `NPM_TOKEN` and the `@junco` npm org) | ✅ workflow ready |
| **shadcn registry** (own URL) | `npx shadcn add https://junco.madebytobi.com/r/<name>.json` works for every shadcn user | Automatic once the site is live | ✅ |
| **shadcn registry directory** (namespaced `@junco/<name>` installs) | Shows up inside shadcn's own docs and CLI search | PR to shadcn-ui/ui adding Junco to the registry directory, after the site is live | ⏳ after deploy |
| **jsDelivr / unpkg** | CDN links for the plain-HTML level (`junco.css`) | Automatic for every npm package | ✅ after npm |

## AI and MCP directories

| Where | How | Ready? |
| --- | --- | --- |
| **Official MCP Registry** (registry.modelcontextprotocol.io) | `mcp-publisher login github && mcp-publisher publish` from `packages/mcp` after `@junco/mcp` is on npm. `server.json` and `mcpName` are in place, and versions stay in sync on release | ✅ files ready |
| **PulseMCP, and other directories that mirror the official registry** | Automatic after the official listing | ✅ |
| **Smithery** (smithery.ai) | Connect the GitHub repo; `packages/mcp/smithery.yaml` is in place | ✅ files ready |
| **Glama** (glama.ai/mcp) | Indexes GitHub repos with MCP servers; claim the listing | ⏳ after npm |
| **mcp.so** | Submit form | ⏳ after npm |
| **awesome-mcp-servers** | PR with a one-line entry | ⏳ after npm |
| **llms.txt directories** | Submit `https://junco.madebytobi.com/llms.txt` | ⏳ after deploy |

## Curated lists (one-line PRs)

- awesome-shadcn-ui: under libraries / registries
- awesome-tailwindcss: under UI libraries
- awesome-react-components: under UI component sets
- awesome-design-systems

Suggested line: `[Junco](https://junco.madebytobi.com) - Free design system for React + Tailwind v4: semantic classes, utilities, copy-in (shadcn-compatible) and installed components from one set of tokens, plus blocks, motion, 3D and an MCP server.`

## Launch day

- **Product Hunt**: kit below.
- **Show HN**: `Show HN: Junco – a free design system you can use as CSS classes, shadcn copy-in or an npm package`. Post the link to the site; first comment explains the four levels and the `junco update` three-way merge.
- **Reddit**: r/reactjs, r/tailwindcss, r/webdev (one each, spaced out, following each sub's self-promo rules).
- **X / LinkedIn / Bluesky**: 20 to 30 second screen recording of switching accent, dark mode and motion off on the docs site.

---

## Product Hunt kit

**Name:** Junco

**Tagline** (60 max): `A free design system for React + Tailwind v4, four ways`

**Description** (260 max):
> Junco is a free, MIT-licensed design system for React and Tailwind v4. Use it as plain CSS classes, Tailwind utilities, shadcn-style copy-in code that still updates, or an npm package. Accessible components, blocks, pages, motion, 3D, and an MCP server for AI agents.

**Topics:** Design Tools, Developer Tools, Open Source, User Experience, Artificial Intelligence

**Links:** https://junco.madebytobi.com · https://github.com/tobibytes/junco

**Pricing:** Free

**Maker's first comment:**
> Hey Product Hunt! I'm Tobi, a CS student at Morgan State. I built Junco because every new project meant picking between shadcn (own the code, but it drifts), HeroUI (polished, but hard to change one component) and daisyUI (any framework, but no accessible menus or dialogs).
>
> Junco does all four from one set of tokens:
> • `class="btn btn-primary"` in plain HTML
> • `bg-surface rounded-card` utilities
> • `npx @junco/cli add dialog` copy-in, and `junco update` merges upstream fixes into your edited copy
> • `import { Button } from "junco"`
>
> Every component is keyboard accessible, tested with axe, and every color pair is checked for contrast in light and dark. One attribute (`data-motion="off"`) turns animation down across the whole app. There's also an MCP server so Claude or Cursor can find and install components for you.
>
> It's MIT and completely free. I'd love feedback on what to build next. The component request form is on GitHub.

**Gallery** (1270×760, light and dark mixed; capture from the live site):
1. Home hero with the four levels side by side
2. One component page: live preview, code tabs for all four levels
3. Theme page: accent picker with live contrast pass/fail
4. Dashboard page in dark mode
5. Landing page block with motion
6. Terminal: `junco add` + `junco diff`
7. Claude using the MCP server to add a component

**Timing:** launch at 12:01 am Pacific, Tuesday to Thursday. Post the Show HN the same morning (US time).

**Before launching:** site live, npm published, README badges green, OG image set, a 30-second demo video, and a "Featured on Product Hunt" link ready for the README.
