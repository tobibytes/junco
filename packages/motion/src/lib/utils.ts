import * as React from "react";

/** Hidden on screen, still read by assistive tech. Inline so it works without Tailwind scanning. */
export const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/** Combines a forwarded ref with a local one. */
export function useMergedRef<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return React.useCallback(
    (value: T | null) => {
      for (const ref of refs) {
        if (typeof ref === "function") ref(value);
        else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}

/** CSS custom properties typed loosely enough to pass in `style`. */
export type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;
