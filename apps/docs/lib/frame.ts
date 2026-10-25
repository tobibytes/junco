/** Preview frames (/preview/...) render a block or page alone, with no site chrome. */
export const FRAME_PREFIX = "/preview/";

export const isFramePath = (pathname: string | null | undefined) => !!pathname?.startsWith(FRAME_PREFIX);

export type FrameTheme = "light" | "dark";
export type FrameMotion = "full" | "subtle" | "off";

export function frameUrl(slug: string, variant: string, theme?: FrameTheme, motion?: FrameMotion) {
  const params = new URLSearchParams();
  if (theme) params.set("theme", theme);
  if (motion) params.set("motion", motion);
  const query = params.toString();
  return `${FRAME_PREFIX}${slug}/${variant}/${query ? `?${query}` : ""}`;
}

/** Message the docs send to preview frames to switch theme or motion without reloading them. */
export interface FrameMessage {
  source: "junco-docs";
  theme?: FrameTheme;
  motion?: FrameMotion;
}

export function postToFrame(frame: HTMLIFrameElement | null, message: Omit<FrameMessage, "source">) {
  frame?.contentWindow?.postMessage({ source: "junco-docs", ...message } satisfies FrameMessage, window.location.origin);
}
