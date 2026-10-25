import * as React from "react";
import { cn } from "junco";
import { useInView } from "./lib/use-in-view";
import { useMotionScale } from "./lib/use-motion-scale";
import { useMergedRef, visuallyHidden } from "./lib/utils";

export interface TypewriterProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** One string types once; several cycle (type, pause, erase, next). */
  words: string | string[];
  /** Ms per character while typing. Default 60. */
  speed?: number;
  /** Ms to hold a finished word before erasing. Default 1600. */
  pause?: number;
  /** Keep cycling through `words`. Default true when there is more than one. */
  loop?: boolean;
  /** Show the blinking caret. Default true. */
  caret?: boolean;
}

/**
 * Types words out like a terminal. With motion off it shows the first word, complete and still.
 * Screen readers get every option once instead of each keystroke.
 *
 *   Build for <Typewriter words={["the web", "phones", "AI agents"]} />
 */
export const Typewriter = React.forwardRef<HTMLSpanElement, TypewriterProps>(
  ({ words, speed = 60, pause = 1600, loop, caret = true, className, style, ...props }, forwardedRef) => {
    const list = Array.isArray(words) ? words : [words];
    const ref = React.useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: false });
    const scale = useMotionScale(ref);
    const shouldLoop = loop ?? list.length > 1;
    const [state, setState] = React.useState({ word: 0, length: list[0]?.length ?? 0, deleting: false });
    const key = list.join("\u0000");

    // Start from an empty first word once we know motion is on.
    const ready = React.useRef(false);
    React.useEffect(() => {
      if (scale > 0 && !ready.current) {
        ready.current = true;
        setState({ word: 0, length: 0, deleting: false });
      }
      if (scale === 0) {
        ready.current = false;
        setState({ word: 0, length: list[0]?.length ?? 0, deleting: false });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale, key]);

    React.useEffect(() => {
      if (scale === 0 || !inView || !ready.current) return;
      const current = list[state.word] ?? "";
      let delay = speed / scale;
      let next = state;
      if (!state.deleting && state.length < current.length) next = { ...state, length: state.length + 1 };
      else if (!state.deleting) {
        if (!shouldLoop && state.word === list.length - 1) return;
        delay = pause;
        next = { ...state, deleting: true };
      } else if (state.length > 0) {
        delay = speed / 2 / scale;
        next = { ...state, length: state.length - 1 };
      } else next = { word: (state.word + 1) % list.length, length: 0, deleting: false };
      const t = window.setTimeout(() => setState(next), delay);
      return () => window.clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, scale, inView, speed, pause, shouldLoop, key]);

    const text = (list[state.word] ?? "").slice(0, state.length);
    return (
      <span ref={useMergedRef(ref, forwardedRef)} className={cn(className)} style={{ whiteSpace: "pre-wrap", ...style }} {...props}>
        <span style={visuallyHidden}>{list.join(", ")}</span>
        <span aria-hidden>
          {text}
          {caret && <span className="typewriter-caret" />}
        </span>
      </span>
    );
  },
);
Typewriter.displayName = "Typewriter";
