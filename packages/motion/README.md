# @junco/motion

Motion effects for React that follow one switch. Part of the [Junco design system](https://junco.madebytobi.com).

```bash
npm i @junco/motion @junco/tailwind
```

```tsx
import { NumberTicker, Reveal, Marquee, confetti } from "@junco/motion";

<Reveal stagger><h2>Ship faster</h2><p>...</p></Reveal>
<NumberTicker value={12_400} />
<Marquee>{logos}</Marquee>
<button onClick={() => confetti()}>Celebrate</button>
```

**Effects:** Reveal, TextReveal, NumberTicker, Typewriter, Marquee, ShimmerText, AnimatedBeam, SpotlightCard, MagneticButton, BorderBeam, GradientBorder, `confetti()`, `startViewTransition` / `useViewTransition`. **Hooks:** `useMotionScale`, `useReducedMotion`, `useInView`.

Every effect reads `--motion-scale`, so `data-motion="off | subtle | full"` on `<html>` and `prefers-reduced-motion` turn it down or off and show the final state instantly. Screen readers always get the final number or the whole text. No animation library dependency.

[Motion docs](https://junco.madebytobi.com/motion) · [GitHub](https://github.com/tobibytes/junco) · MIT
