import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark } from "./icons";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-center gap-2">
          <LogoMark width={16} height={16} />
          <span>
            Junco is free and open source under the MIT license.
          </span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link className="hover:text-foreground" href="/docs/">Docs</Link>
          <Link className="hover:text-foreground" href="/components/">Components</Link>
          <Link className="hover:text-foreground" href="/docs/changelog/">Changelog</Link>
          <a className="hover:text-foreground" href="/llms.txt">llms.txt</a>
          <a className="hover:text-foreground" href={site.github} rel="noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
