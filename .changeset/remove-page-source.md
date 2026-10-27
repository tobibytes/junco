---
"@junco/cli": minor
---

Remove `junco add page --source`, which shipped in 0.3.0 before it was ready. `junco add page <name> [--variant <v>]` is unchanged; copying a page's full source will come back as part of the registry.
