# @junco/blocks

## 0.1.4

### Patch Changes

- 7fb892b: Pages take the last few hard-coded links as props, so they work with any router: `DashboardPage customersHref` (null hides "View all"), `OnboardingPage doneHref`, and `LogInPage signUpHref={null}` to hide "Sign up" in invite-only apps.
- 297c097: UsersPage and TeamMembersPage now call the latest `onUsersChange` / `onMembersChange`. Before, changing a role or removing someone called the callback from the first render.
- Updated dependencies [297c097]
  - @junco/react@0.2.2
  - @junco/motion@0.1.4

## 0.1.3

### Patch Changes

- 888d2d8: Published from GitHub Actions with npm Trusted Publishing, so every version now carries a provenance statement linking it to the commit and workflow that built it.
- Updated dependencies [888d2d8]
  - @junco/react@0.2.1
  - @junco/motion@0.1.3

## 0.1.2

### Patch Changes

- The React package is now `@junco/react` (npm blocks the unscoped `junco` name). Depend on `@junco/react` instead of `junco`.
- Updated dependencies
  - @junco/motion@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [ddf1ab3]
  - junco@0.2.0
  - @junco/motion@0.1.1

## 0.1.0

### Minor Changes

- 92b848d: First public release: tokens, Tailwind theme and semantic classes, React components (primitives, overlays, data table, forms), the `junco` CLI and registry, the MCP server, blocks and pages (app and marketing), motion effects, and 3D scenes.

### Patch Changes

- Updated dependencies [92b848d]
- Updated dependencies [b336fd2]
  - junco@0.1.0
  - @junco/motion@0.1.0
