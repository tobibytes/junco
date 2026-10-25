"use client";

import { Badge, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@junco/react";
import type { ComponentDoc } from "./types";

export const doc: ComponentDoc = {
  imports: ["Card", "CardHeader", "CardTitle", "CardDescription", "CardAction", "CardContent", "CardFooter"],
  playground: {
    controls: [
      { name: "variant", type: "select", options: ["outline", "muted", "elevated", "ghost"], default: "outline" },
      { name: "isInteractive", type: "boolean", default: false },
      { name: "footer", type: "boolean", default: true },
    ],
    render: (v) => (
      <Card variant={v.variant as "outline"} isInteractive={v.isInteractive as boolean} className="w-full max-w-sm" tabIndex={v.isInteractive ? 0 : undefined}>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
          <CardAction>
            <Badge variant="outline">Pro</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">48,210 requests</p>
          <p className="text-sm text-muted-foreground">62% of your monthly limit.</p>
        </CardContent>
        {v.footer && (
          <CardFooter>
            <Button size="sm" variant="outline">
              View details
            </Button>
          </CardFooter>
        )}
      </Card>
    ),
    code: (v) => {
      const attrs = [v.variant !== "outline" && `variant="${v.variant}"`, v.isInteractive && "isInteractive"].filter(Boolean);
      return `<Card${attrs.length ? " " + attrs.join(" ") : ""}>
  <CardHeader>
    <CardTitle>Usage</CardTitle>
    <CardDescription>Last 30 days</CardDescription>
    <CardAction><Badge variant="outline">Pro</Badge></CardAction>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-semibold tabular-nums">48,210 requests</p>
    <p className="text-sm text-muted-foreground">62% of your monthly limit.</p>
  </CardContent>${
    v.footer
      ? `
  <CardFooter>
    <Button size="sm" variant="outline">View details</Button>
  </CardFooter>`
      : ""
  }
</Card>`;
    },
  },
  usage: {
    installed: `<Card>
  <CardHeader>
    <CardTitle>Usage</CardTitle>
    <CardDescription>Last 30 days</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter>…</CardFooter>
</Card>`,
    semantic: `<!-- A simple card -->
<div class="card">Plain content with padding.</div>

<!-- With parts: card-flush moves the padding onto the parts -->
<div class="card card-flush">
  <div class="card-header">
    <h3 class="card-title">Usage</h3>
    <p class="card-description">Last 30 days</p>
  </div>
  <div class="card-content">48,210 requests</div>
  <div class="card-footer"><button class="btn btn-sm">View details</button></div>
</div>`,
    utilities: `<div className="flex flex-col rounded-card border border-border bg-card text-card-foreground">
  <div className="grid gap-1 p-5 pb-0">
    <h3 className="font-semibold tracking-tight">Usage</h3>
    <p className="text-sm text-muted-foreground">Last 30 days</p>
  </div>
  <div className="p-5">…</div>
</div>`,
  },
  examples: [
    {
      title: "Variants",
      description: "Depth comes from borders. Only elevated has a shadow, for things that float.",
      Preview: () => (
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {(["outline", "muted", "elevated", "ghost"] as const).map((variant) => (
            <Card key={variant} variant={variant}>
              <CardHeader>
                <CardTitle className="capitalize">{variant}</CardTitle>
                <CardDescription>variant=&quot;{variant}&quot;</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      ),
      code: `<Card variant="outline">…</Card>
<Card variant="muted">…</Card>
<Card variant="elevated">…</Card>
<Card variant="ghost">…</Card>`,
    },
    {
      title: "As a link",
      description: "isInteractive adds hover and focus styles for a card that is itself a link.",
      Preview: () => (
        <a href="#as-a-link" className="block w-full max-w-sm rounded-card focus-visible:outline-none">
          <Card isInteractive>
            <CardHeader>
              <CardTitle>Getting started</CardTitle>
              <CardDescription>Install Junco and add your first component.</CardDescription>
            </CardHeader>
          </Card>
        </a>
      ),
      code: `<a href="/docs/getting-started">
  <Card isInteractive>
    <CardHeader>
      <CardTitle>Getting started</CardTitle>
      <CardDescription>Install Junco and add your first component.</CardDescription>
    </CardHeader>
  </Card>
</a>`,
    },
  ],
  props: [
    {
      component: "Card",
      description: "Also takes every <div> attribute.",
      props: [
        { name: "variant", type: '"outline" | "muted" | "elevated" | "ghost"', default: '"outline"', description: "outline is the default panel; muted groups inside another card; elevated floats; ghost has no border." },
        { name: "isInteractive", type: "boolean", default: "false", description: "Hover and focus styles for a card that is a link or button." },
      ],
    },
    {
      component: "CardTitle",
      props: [{ name: "as", type: '"h1" … "h6"', default: '"h3"', description: "Heading level, so the card fits the page outline." }],
    },
    {
      component: "CardHeader / CardDescription / CardAction / CardContent / CardFooter",
      description: "Layout parts. CardAction sits top-right in the header (a menu or badge).",
      props: [{ name: "className", type: "string", description: "Extra classes for that part." }],
    },
  ],
  a11y: [
    "A card is a visual group, not a landmark. Give it a heading (CardTitle) so screen reader users can jump to it.",
    "For a clickable card, wrap it in one real link or button; don't nest other interactive controls inside it.",
  ],
};
