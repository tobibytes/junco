# Registry

Source files for copy-in (`npx junco add`) and shadcn compatibility (`npx shadcn add <url>`).

Plan:
- Components are NOT duplicated here. A build script reads `packages/react/src/components/*` and emits registry JSON (shadcn registry-item schema) into `apps/docs/public/r/`.
- Blocks, pages and templates live here as source, grouped as `blocks/<name>/`, `pages/<category>/<name>/<variant>/`, `templates/<name>/`.
- Each item records its version hash so `junco diff` and `junco update` can compare a user's copy against upstream.
