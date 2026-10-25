import * as React from "react";

export interface LinkComponentProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

type LinkComponent = React.ComponentType<LinkComponentProps>;

const LinkContext = React.createContext<LinkComponent | null>(null);

/**
 * Tells every marketing block which link component to render, so links go through your router:
 *
 *   import NextLink from "next/link";
 *   <LinkProvider component={NextLink}><LandingPage /></LinkProvider>
 *
 * Without it, blocks render plain <a> tags.
 */
export function LinkProvider({ component, children }: { component: LinkComponent; children: React.ReactNode }) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>;
}

/** A link that uses the component from LinkProvider, or <a>. External links open safely. */
export const MarketingLink = React.forwardRef<HTMLAnchorElement, LinkComponentProps>(({ href, ...props }, ref) => {
  const Custom = React.useContext(LinkContext);
  const external = /^https?:\/\//.test(href);
  if (Custom && !external) return <Custom href={href} {...props} />;
  return <a ref={ref} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} {...props} />;
});
MarketingLink.displayName = "MarketingLink";
