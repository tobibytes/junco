"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@junco/react";
import type { ComponentDoc } from "./types";

const trail = [
  { label: "Acme", href: "#acme" },
  { label: "Projects", href: "#projects" },
  { label: "Website", href: "#website" },
  { label: "Settings", href: "#settings" },
  { label: "Domains" },
];

export const doc: ComponentDoc = {
  imports: ["Breadcrumb"],
  playground: {
    controls: [
      { name: "maxItems", label: "maxItems", type: "select", options: ["none", "3", "4"], default: "none" },
      { name: "separator", type: "select", options: ["chevron", "slash"], default: "chevron" },
    ],
    render: (v) => (
      <Breadcrumb
        items={trail}
        maxItems={v.maxItems === "none" ? undefined : Number(v.maxItems)}
        separator={v.separator === "slash" ? "/" : undefined}
      />
    ),
    code: (v) => {
      const attrs = [`items={trail}`, v.maxItems !== "none" && `maxItems={${v.maxItems}}`, v.separator === "slash" && `separator="/"`].filter(Boolean);
      return `const trail = [
  { label: "Acme", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Website", href: "/projects/website" },
  { label: "Settings", href: "/projects/website/settings" },
  { label: "Domains" },
];

<Breadcrumb ${attrs.join(" ")} />`;
    },
  },
  usage: {
    installed: `<Breadcrumb items={[{ label: "Projects", href: "/projects" }, { label: "Junco" }]} />`,
    semantic: `<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">Acme</a></li>
    <li><a href="/projects">Projects</a></li>
    <li aria-current="page">Website</li>
  </ol>
</nav>`,
  },
  examples: [
    {
      title: "Composed parts",
      description: "Build it from parts when you need custom items, or your router's Link via asChild.",
      Preview: () => (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#home">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ),
      code: `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink asChild><Link href="/docs">Docs</Link></BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
    },
  ],
  props: [
    {
      component: "Breadcrumb",
      props: [
        { name: "items", type: "{ label: ReactNode; href?: string }[]", description: "Shorthand trail. Leave href off the last item (the current page)." },
        { name: "maxItems", type: "number", description: "With more items than this, the middle collapses to \"…\"." },
        { name: "separator", type: "ReactNode", default: "a chevron", description: "Custom separator." },
        { name: "renderLink", type: "(item, props) => ReactNode", description: "Render links through your router: (item, props) => <Link to={item.href} {...props} />." },
        { name: "classNames", type: "{ root?, list?, item?, link?, page?, separator? }", description: "Class overrides for each part." },
      ],
    },
    {
      component: "BreadcrumbLink",
      props: [{ name: "asChild", type: "boolean", default: "false", description: "Render your router's Link as the child." }],
    },
    {
      component: "BreadcrumbList / BreadcrumbItem / BreadcrumbPage / BreadcrumbSeparator / BreadcrumbEllipsis",
      description: "Parts for composing it yourself.",
      props: [{ name: "className", type: "string", description: "Extra classes for that part." }],
    },
  ],
  a11y: [
    "A nav landmark labelled \"Breadcrumb\" with an ordered list inside, so the order is announced.",
    "The current page has aria-current=\"page\" and isn't a link.",
    "Separators are hidden from assistive tech.",
  ],
};
