import { SidebarNav } from "../sidebar-nav";
import { MotionSegmented, ThemeSegmented } from "../theme-controls";
import { OnThisPage } from "./on-this-page";

/** Sidebar + content + "On this page", shared by /docs and /components. */
export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-1">
      <div className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 flex-col border-r border-border md:flex">
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <SidebarNav />
        </div>
        <div className="grid gap-2 border-t border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeSegmented />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Motion</span>
            <MotionSegmented />
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 gap-10 px-4 py-8 sm:px-6 md:px-10 md:py-12">
        <article id="content" className="mx-auto w-full max-w-3xl min-w-0">
          {children}
        </article>
        <div className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 overflow-y-auto py-1 xl:block">
          <OnThisPage />
        </div>
      </div>
    </div>
  );
}
