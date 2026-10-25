/**
 * Part of the behavior seam (see primitives.ts), split out so components that only need Slot
 * (Button, Badge, ...) don't load every Radix package. That keeps them usable from `@junco/react/server`.
 */
export { Slot, Slottable } from "@radix-ui/react-slot";
