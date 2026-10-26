---
"@junco/react": patch
---

Sparkline is hidden from screen readers by default, since it's decorative. Pass `aria-hidden={false}` with a `role="img"` and `aria-label` to expose it.
