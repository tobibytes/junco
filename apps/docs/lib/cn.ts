import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Same as junco's cn(). Local because junco's bundle is "use client", which makes
 * every export a client reference on the server, so server components can't call it.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
