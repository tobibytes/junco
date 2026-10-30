export const site = {
  name: "Junco",
  /** The one place the site URL lives. Metadata, sitemap and copy-in commands all read it. */
  url: "https://junco.madebytobi.com",
  description:
    "A free, open source design system for React and Tailwind v4. Tokens, components, blocks and pages you can use as plain CSS classes, utilities, copy-in source or installed components.",
  github: "https://github.com/tobibytes/junco",
  /** Who makes Junco. Shown in the footer and in page metadata. */
  author: { brand: "Tobibytes", url: "https://madebytobi.com" },
  /** Where component source lives on GitHub, for "View source" links. */
  sourceBase: "https://github.com/tobibytes/junco/blob/main/packages/react/src/components",
} as const;
