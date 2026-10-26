import type * as React from "react";

/** Icons the marketing blocks use. Paths from Lucide (ISC). Swap in any icon library via props. */
export type IconProps = React.SVGProps<SVGSVGElement>;
export type IconComponent = React.ComponentType<IconProps>;

function make(name: string, paths: React.ReactNode): IconComponent {
  const Icon = (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      {...props}
    >
      {paths}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}

export const ArrowRightIcon = make("ArrowRightIcon", <path d="M5 12h14M12 5l7 7-7 7" />);
export const ArrowLeftIcon = make("ArrowLeftIcon", <path d="M19 12H5M12 19l-7-7 7-7" />);
export const CheckIcon = make("CheckIcon", <path d="M20 6 9 17l-5-5" />);
export const MinusIcon = make("MinusIcon", <path d="M5 12h14" />);
export const MenuIcon = make("MenuIcon", <path d="M4 7h16M4 12h16M4 17h16" />);
export const ZapIcon = make("ZapIcon", <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />);
export const LayersIcon = make(
  "LayersIcon",
  <>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="m2 12 9.17 4.17a2 2 0 0 0 1.66 0L22 12" />
    <path d="m2 17 9.17 4.17a2 2 0 0 0 1.66 0L22 17" />
  </>,
);
export const ShieldIcon = make("ShieldIcon", <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />);
export const SparklesIcon = make(
  "SparklesIcon",
  <>
    <path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z" />
    <path d="M20 3v4M22 5h-4" />
  </>,
);
export const GaugeIcon = make(
  "GaugeIcon",
  <>
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </>,
);
export const GlobeIcon = make(
  "GlobeIcon",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
  </>,
);
export const LockIcon = make(
  "LockIcon",
  <>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>,
);
export const CodeIcon = make("CodeIcon", <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />);
export const GitBranchIcon = make(
  "GitBranchIcon",
  <>
    <path d="M6 3v12" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </>,
);
export const MessageIcon = make("MessageIcon", <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />);
export const ChartIcon = make("ChartIcon", <path d="M3 3v16a2 2 0 0 0 2 2h16M7 16l4-4 4 4 6-6" />);
export const CalendarIcon = make(
  "CalendarIcon",
  <>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </>,
);
export const RefreshIcon = make(
  "RefreshIcon",
  <>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </>,
);
export const HomeIcon = make(
  "HomeIcon",
  <>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </>,
);
export const SearchIcon = make(
  "SearchIcon",
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>,
);
export const InboxIcon = make(
  "InboxIcon",
  <>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </>,
);
export const UsersIcon = make(
  "UsersIcon",
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
);
export const RssIcon = make(
  "RssIcon",
  <>
    <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1" />
  </>,
);
export const ClockIcon = make(
  "ClockIcon",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </>,
);
export const TriangleAlertIcon = make(
  "TriangleAlertIcon",
  <>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4M12 17h.01" />
  </>,
);
export const CopyIcon = make(
  "CopyIcon",
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>,
);
