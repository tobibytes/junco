"use client";

import { Pagination } from "@junco/react";
import * as React from "react";
import type { ComponentDoc } from "./types";

function Controlled({ pageCount = 12, size, isCompact }: { pageCount?: number; size?: "sm" | "md"; isCompact?: boolean }) {
  const [page, setPage] = React.useState(4);
  return <Pagination page={page} pageCount={pageCount} onPageChange={setPage} size={size} isCompact={isCompact} />;
}

export const doc: ComponentDoc = {
  imports: ["Pagination"],
  playground: {
    controls: [
      { name: "pageCount", label: "pages", type: "select", options: ["5", "12", "50"], default: "12" },
      { name: "size", type: "select", options: ["sm", "md"], default: "md" },
      { name: "isCompact", type: "boolean", default: false },
    ],
    render: (v) => (
      <Controlled key={String(v.pageCount)} pageCount={Number(v.pageCount)} size={v.size as "md"} isCompact={v.isCompact as boolean} />
    ),
    code: (v) => {
      const attrs = [`page={page}`, `pageCount={${v.pageCount}}`, `onPageChange={setPage}`, v.size !== "md" && `size="${v.size}"`, v.isCompact && "isCompact"].filter(Boolean);
      return `const [page, setPage] = useState(1);\n\n<Pagination ${attrs.join(" ")} />`;
    },
  },
  usage: {
    installed: `const [page, setPage] = useState(1);

<Pagination page={page} pageCount={12} onPageChange={setPage} />`,
    semantic: `<nav aria-label="Pagination">
  <ul class="pagination">
    <li><a class="pagination-item" href="?page=3">Previous</a></li>
    <li><a class="pagination-item" href="?page=1">1</a></li>
    <li><span class="pagination-ellipsis" aria-hidden="true">…</span></li>
    <li><a class="pagination-item" href="?page=4" aria-current="page">4</a></li>
    <li><a class="pagination-item" href="?page=5">5</a></li>
    <li><a class="pagination-item" href="?page=12">12</a></li>
    <li><a class="pagination-item" href="?page=5">Next</a></li>
  </ul>
</nav>`,
  },
  examples: [
    {
      title: "Real links",
      description: "getHref makes each page a real link: better for SEO, middle-click and sharing.",
      Preview: () => {
        const [page, setPage] = React.useState(2);
        return <Pagination page={page} pageCount={8} onPageChange={setPage} getHref={(p) => `#page-${p}`} />;
      },
      code: `<Pagination
  page={page}
  pageCount={8}
  onPageChange={setPage}
  getHref={(p) => \`/invoices?page=\${p}\`}
/>`,
    },
    {
      title: "Compact",
      description: "Prev, next and \"Page x of y\" only. Good on narrow screens.",
      Preview: () => <Controlled isCompact />,
      code: `<Pagination page={page} pageCount={12} onPageChange={setPage} isCompact />`,
    },
  ],
  props: [
    {
      component: "Pagination",
      props: [
        { name: "page", type: "number", description: "Required. Current page, 1-based." },
        { name: "pageCount", type: "number", description: "Required. Total pages." },
        { name: "onPageChange", type: "(page: number) => void", description: "Required. Called with the new page." },
        { name: "getHref", type: "(page: number) => string", description: "Build a URL per page so each one is a real link." },
        { name: "siblings", type: "number", default: "1", description: "Pages shown on each side of the current one." },
        { name: "boundaries", type: "number", default: "1", description: "Pages always shown at each end." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "Button size." },
        { name: "isCompact", type: "boolean", default: "false", description: "Hide the numbered pages." },
        { name: "label", type: "string", default: '"Pagination"', description: "Accessible name for the nav." },
        { name: "classNames", type: "{ root?, list?, item?, ellipsis?, summary? }", description: "Class overrides for each part." },
      ],
    },
    {
      component: "usePagination / getPaginationItems",
      description: "The math on its own, for custom layouts. Returns numbers and \"ellipsis-start\" / \"ellipsis-end\" markers, always the same length so the control never jumps.",
      props: [
        { name: "page", type: "number", description: "Current page." },
        { name: "pageCount", type: "number", description: "Total pages." },
        { name: "siblings / boundaries", type: "number", description: "Same as on Pagination." },
      ],
    },
  ],
  keyboard: [
    { keys: ["Tab"], action: "Moves between the page buttons." },
    { keys: ["Enter"], action: "Goes to the focused page." },
  ],
  a11y: [
    "A nav landmark labelled \"Pagination\", with aria-current=\"page\" on the current page.",
    "Every button has a full name (\"Page 5\", \"Next page\"), not just a number or an arrow.",
    "The control keeps the same width on every page, and focus stays put when you press Next.",
  ],
};
