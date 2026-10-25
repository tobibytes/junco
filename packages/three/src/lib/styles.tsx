/**
 * Default layout for scene containers. It lives in a cascade layer with zero specificity, so any
 * class you pass (`absolute inset-0`, `h-96`, `rounded-card`) wins over it, Tailwind or not.
 * React 19 hoists this <style> into <head> once, however many scenes render.
 */
const css = `@layer base{:where([data-junco-scene]){position:relative;display:block;overflow:hidden}:where([data-junco-canvas]){position:relative;width:100%;height:100%;min-height:1px}}@keyframes junco-three-spin{to{transform:rotate(360deg)}}`;

export function SceneStyles() {
  return (
    <style href="junco-three" precedence="default">
      {css}
    </style>
  );
}
