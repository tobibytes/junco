# @junco/tailwind

The Junco theme for Tailwind CSS v4: every token as a utility, motion utilities, and pure-CSS semantic classes that work in any framework or plain HTML. Part of the [Junco design system](https://junco.madebytobi.com).

```bash
npm i @junco/tailwind tailwindcss
```

```css
@import "tailwindcss";
@import "@junco/tailwind";
```

**Utilities:** `bg-surface`, `text-muted-foreground`, `border-border-strong`, `rounded-card`, `rounded-control`, `shadow-float`, `duration-fast`, `ease-enter`, `z-overlay`, `animate-rise`, `animate-pop-in`, ...

**Semantic classes (no JavaScript):**

```html
<button class="btn btn-primary">Save</button>
<span class="badge badge-success badge-dot">Paid</span>
<input class="input" aria-invalid="true" />
<label><input type="checkbox" role="switch" class="switch" /> Notifications</label>
<dialog class="modal">...</dialog>
<table class="table table-zebra">...</table>
```

Includes `btn`, `card`, `badge`, `input`, `textarea`, `select`, `checkbox`, `radio`, `switch`, `label`, `field`, `kbd`, `spinner`, `skeleton`, `separator`, `avatar`, `tabs`, `tooltip`, `modal`, `popover`, `menu`, `toast`, `table`, `stat`, `empty`, `pagination`, `breadcrumb`, `accordion-item`, `prose`, plus motion classes (`reveal`, `marquee`, `shimmer`, `spotlight`).

**Motion switch:** set `data-motion="off | subtle | full"` on `<html>`; every animation scales with it, and `prefers-reduced-motion` always wins.

[Docs](https://junco.madebytobi.com) · [GitHub](https://github.com/tobibytes/junco) · MIT
