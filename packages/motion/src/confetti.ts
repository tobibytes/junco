import { readMotionScale } from "./lib/use-motion-scale";

export interface ConfettiOptions {
  /** Where it bursts from, as fractions of the viewport. Default { x: 0.5, y: 0.6 }. */
  origin?: { x: number; y: number };
  /** Or burst from the center of this element. */
  from?: Element | null;
  /** Number of pieces. Default 120. */
  count?: number;
  /** Spread angle in degrees. Default 70. */
  spread?: number;
  /** Colors, as CSS colors. Default the chart tokens. */
  colors?: string[];
}

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  w: number;
  h: number;
  color: string;
}

function tokenColors(): string[] {
  const style = getComputedStyle(document.documentElement);
  const colors = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--primary"]
    .map((name) => style.getPropertyValue(name).trim())
    .filter(Boolean);
  return colors.length ? colors : ["currentColor"];
}

/**
 * A one-off burst of confetti on a temporary full-screen canvas, colored from the theme.
 * Does nothing with motion off. Resolves when the last piece has fallen.
 *
 *   <Button onClick={(e) => confetti({ from: e.currentTarget })}>Claim</Button>
 */
export function confetti(options: ConfettiOptions = {}): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const scale = readMotionScale();
  if (scale === 0) return Promise.resolve();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "var(--z-toast)",
  });
  document.body.appendChild(canvas);
  ctx.scale(dpr, dpr);

  let ox = (options.origin?.x ?? 0.5) * W;
  let oy = (options.origin?.y ?? 0.6) * H;
  if (options.from) {
    const r = options.from.getBoundingClientRect();
    ox = r.left + r.width / 2;
    oy = r.top + r.height / 2;
  }
  const colors = options.colors ?? tokenColors();
  const spread = ((options.spread ?? 70) * Math.PI) / 180;
  const count = Math.round((options.count ?? 120) * Math.max(scale, 0.4));
  const pieces: Piece[] = Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const speed = 7 + Math.random() * 7;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: 5 + Math.random() * 5,
      h: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)]!,
    };
  });

  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      const fade = Math.max(0, 1 - (now - start - 1800) / 900);
      for (const p of pieces) {
        p.vy += 0.25;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        if (p.y < H + 20) alive++;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, Math.abs(Math.cos(p.r * 2)) * p.h + 1);
        ctx.restore();
      }
      if (alive > 0 && fade > 0) requestAnimationFrame(step);
      else {
        canvas.remove();
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}
