"use client";

import { setSiteAccent, useSiteAccent } from "@/lib/accent";
import { AccentSwatches } from "../accent-picker";

/** One click re-themes the whole site, right in the hero. */
export function HeroAccent() {
  const { touched } = useSiteAccent();
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
      <span className="text-sm text-muted-foreground">Try a color</span>
      <AccentSwatches size="sm" className="justify-center" />
      <button
        type="button"
        onClick={() => setSiteAccent(null)}
        className="rounded-xs text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:invisible"
        disabled={!touched}
      >
        Reset
      </button>
    </div>
  );
}
