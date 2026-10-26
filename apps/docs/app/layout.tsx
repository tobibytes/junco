import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";
import { site } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Junco: one design system, four ways to use it", template: "%s | Junco" },
  description: site.description,
  applicationName: "Junco",
  authors: [{ name: `${site.author.name} (${site.author.brand})`, url: site.author.url }],
  creator: site.author.brand,
  publisher: site.author.brand,
  openGraph: {
    type: "website",
    siteName: "Junco",
    url: site.url,
    title: "Junco: one design system, four ways to use it",
    description: site.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Junco design system" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before first paint so pages never flash. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a constant script from this repo, no user input */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
