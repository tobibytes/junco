/**
 * The behavior layer. Every headless primitive Junco uses is imported here and nowhere else,
 * so swapping Radix for Base UI (see docs/DECISIONS.md) touches this file and the components
 * that use each namespace, not the whole package.
 */
export * as AvatarPrimitive from "@radix-ui/react-avatar";
export * as CheckboxPrimitive from "@radix-ui/react-checkbox";
export * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
export * as SelectPrimitive from "@radix-ui/react-select";
export * as SwitchPrimitive from "@radix-ui/react-switch";
export * as TabsPrimitive from "@radix-ui/react-tabs";
export * as TooltipPrimitive from "@radix-ui/react-tooltip";
export { Slot } from "@radix-ui/react-slot";
