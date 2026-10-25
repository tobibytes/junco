"use client";

import { usePathname } from "next/navigation";
import { isFramePath } from "@/lib/frame";
import { SearchDialog } from "./search";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Header, footer and search around every page, except preview frames, which render bare. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isFramePath(pathname)) return <>{children}</>;
  return (
    <>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </main>
        <SiteFooter />
      </div>
      <SearchDialog />
    </>
  );
}
