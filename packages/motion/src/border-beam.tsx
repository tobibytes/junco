import * as React from "react";
import { cn } from "junco";
import type { CSSVars } from "./lib/utils";

export interface BorderBeamProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Border width in px. Default 1. */
  width?: number;
}

/**
 * A short light that runs around the border of its parent. Put it last inside a rounded element
 * with `position: relative`. Hidden with motion off (the parent keeps its normal border).
 *
 *   <div className="relative rounded-card border">... <BorderBeam /></div>
 */
export function BorderBeam({ width, className, style, ...props }: BorderBeamProps) {
  const vars: CSSVars = { ...style };
  if (width) vars["--beam-width"] = `${width}px`;
  return <span aria-hidden className={cn("border-beam", className)} style={vars} {...props} />;
}

export interface GradientBorderProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  /** The fill inside the border, as a CSS color. Default the card token. */
  fill?: string;
}

/** A box with a slowly turning border in the chart palette. Still with motion off. */
export const GradientBorder = React.forwardRef<HTMLElement, GradientBorderProps>(
  ({ as: Comp = "div", fill, className, style, ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn("gradient-border rounded-card", className)}
      style={fill ? ({ ...style, "--gradient-fill": fill } as CSSVars) : style}
      {...props}
    />
  ),
);
GradientBorder.displayName = "GradientBorder";
