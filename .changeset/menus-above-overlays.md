---
"@junco/tokens": minor
"@junco/tailwind": minor
"@junco/react": patch
---

Menus, selects and popovers now open above dialogs and sheets. A new `--z-popover` layer (and `z-popover` utility) sits between `--z-overlay` and `--z-toast`; DropdownMenu, Select and Popover use it instead of `z-dropdown`, which stays for in-page floating bits.
