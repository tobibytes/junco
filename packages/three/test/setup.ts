import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { resetWebGLCache } from "../src/lib/environment";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  resetWebGLCache();
  document.documentElement.removeAttribute("data-motion");
  document.documentElement.removeAttribute("style");
  document.documentElement.className = "";
});
