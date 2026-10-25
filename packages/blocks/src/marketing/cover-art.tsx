import * as React from "react";
import { cn } from "@junco/react";
import { createRandom } from "../lib/fake";

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

export interface CoverArtProps extends React.SVGProps<SVGSVGElement> {
  /** Same seed, same picture. Use the post slug. */
  seed: string;
}

/**
 * Abstract cover art in the theme's chart colors, for posts without an image.
 * Deterministic per seed, re-colors with the theme, decorative.
 */
export function CoverArt({ seed, className, ...props }: CoverArtProps) {
  const r = createRandom(hash(seed));
  const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  const a = r.pick(palette);
  const b = r.pick(palette.filter((c) => c !== a));
  const id = `cover-${hash(seed).toString(36)}`;
  const kind = r.int(0, 2);
  const rings = Array.from({ length: 6 }, (_, i) => i);

  return (
    <svg
      viewBox="0 0 400 225"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable={false}
      className={cn("block h-full w-full bg-muted", className)}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-a`} cx={r.int(20, 80) + "%"} cy={r.int(10, 60) + "%"} r="70%">
          <stop offset="0" stopColor={a} stopOpacity="0.42" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-b`} cx={r.int(20, 80) + "%"} cy={r.int(40, 90) + "%"} r="60%">
          <stop offset="0" stopColor={b} stopOpacity="0.3" />
          <stop offset="1" stopColor={b} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="var(--foreground)" strokeOpacity="0.06" />
        </pattern>
      </defs>
      <rect width="400" height="225" fill={`url(#${id}-grid)`} />
      <rect width="400" height="225" fill={`url(#${id}-a)`} />
      <rect width="400" height="225" fill={`url(#${id}-b)`} />
      {kind === 0 &&
        rings.map((i) => (
          <circle key={i} cx="200" cy="112" r={18 + i * 18} fill="none" stroke="var(--foreground)" strokeOpacity={0.14 - i * 0.015} />
        ))}
      {kind === 1 &&
        rings.map((i) => (
          <rect
            key={i}
            x={140 + i * 6}
            y={52 + i * 6}
            width={120 - i * 12}
            height={120 - i * 12}
            rx="10"
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.16 - i * 0.02}
            transform={`rotate(${i * 7} 200 112)`}
          />
        ))}
      {kind === 2 && (
        <path
          d={`M0 ${150 + r.int(-20, 20)} C 100 ${80 + r.int(-30, 30)}, 300 ${200 + r.int(-30, 20)}, 400 ${110 + r.int(-20, 20)}`}
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}
