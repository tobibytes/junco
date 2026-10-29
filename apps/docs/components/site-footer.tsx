import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark } from "./icons";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-start gap-2 sm:items-center">
          <LogoMark width={16} height={16} className="mt-0.5 shrink-0 sm:mt-0" />
          <p>
            Junco™ is designed and built by{" "}
            <a href={site.author.url} rel="noreferrer" className="font-medium text-foreground underline-offset-4 hover:underline">
              {site.author.brand}
            </a>{" "}
            ({site.author.name}). © {new Date().getFullYear()}. Free and open source under the{" "}
            <a href={`${site.github}/blob/main/LICENSE`} rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">
              MIT license
            </a>
            .
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link className="hover:text-foreground" href="/docs/">Docs</Link>
          <Link className="hover:text-foreground" href="/components/">Components</Link>
          <Link className="hover:text-foreground" href="/docs/changelog/">Changelog</Link>
          <a className="hover:text-foreground" href="/llms.txt">llms.txt</a>
          <a className="hover:text-foreground" href={site.github} rel="noreferrer">GitHub</a>
          <a className="hover:text-foreground" href="https://towhee.madebytobi.com">Towhee</a>
        </nav>
      </div>
    </footer>
  );
}
