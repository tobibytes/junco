import type * as React from "react";

/** Toolbar and menu icons. Paths from Lucide (ISC). Size them with className. */
function make(paths: React.ReactNode) {
  return (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      {...props}
    >
      {paths}
    </svg>
  );
}

export const BoldIcon = make(<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />);
export const ItalicIcon = make(
  <>
    <line x1="19" x2="10" y1="4" y2="4" />
    <line x1="14" x2="5" y1="20" y2="20" />
    <line x1="15" x2="9" y1="4" y2="20" />
  </>,
);
export const StrikeIcon = make(
  <>
    <path d="M16 4H9a3 3 0 0 0-2.83 4" />
    <path d="M14 12a4 4 0 0 1 0 8H6" />
    <line x1="4" x2="20" y1="12" y2="12" />
  </>,
);
export const CodeIcon = make(
  <>
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </>,
);
export const ListIcon = make(<path d="M3 12h.01M3 18h.01M3 6h.01M8 12h13M8 18h13M8 6h13" />);
export const ListOrderedIcon = make(<path d="M10 12h11M10 18h11M10 6h11M4 10h2M4 6h1v4M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />);
export const QuoteIcon = make(
  <>
    <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
  </>,
);
export const CodeBlockIcon = make(
  <>
    <path d="m10 9-3 3 3 3M14 15l3-3-3-3" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </>,
);
export const MinusIcon = make(<path d="M5 12h14" />);
export const TextIcon = make(<path d="M17 6.1H3M21 12.1H3M15.1 18H3" />);
export const UndoIcon = make(
  <>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </>,
);
export const RedoIcon = make(
  <>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
  </>,
);
