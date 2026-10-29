import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom is missing a few browser APIs Radix uses for positioning and pointer handling.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.scrollIntoView ??= () => {};

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// ProseMirror measures text for caret and menu positions; jsdom has no layout.
const rect = { x: 0, y: 0, top: 0, left: 0, bottom: 16, right: 0, width: 0, height: 16, toJSON() {} } as DOMRect;
Range.prototype.getClientRects ??= () => ({ length: 1, item: () => rect, 0: rect, [Symbol.iterator]: function* () { yield rect; } }) as unknown as DOMRectList;
Range.prototype.getBoundingClientRect ??= () => rect;
document.elementFromPoint ??= () => null;
