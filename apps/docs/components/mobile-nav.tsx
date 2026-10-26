"use client";

import { Button } from "@junco/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { LogoMark, MenuIcon, XIcon } from "./icons";
import { SidebarNav } from "./sidebar-nav";
import { MotionSegmented, ThemeSegmented } from "./theme-controls";

/** A left drawer with the full nav, for phones. Native <dialog> gives focus trapping and Esc. */
export function MobileNav() {
  const ref = React.useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const close = React.useCallback(() => ref.current?.close(), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close the menu on every page change
  React.useEffect(() => close(), [pathname, close]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <MenuIcon />
      </Button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: clicking the backdrop closes it; Escape does the same from the keyboard */}
      <dialog
        ref={ref}
        aria-label="Menu"
        onClick={(e) => {
          if (e.target === ref.current) close();
        }}
        className="drawer m-0 h-dvh max-h-none w-[min(20rem,85vw)] border-r border-border bg-background p-0 text-foreground"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <Link href="/" onClick={close} className="flex items-center gap-2 font-semibold tracking-tight">
              <LogoMark /> Junco
            </Link>
            <Button variant="ghost" size="icon" aria-label="Close menu" onClick={close}>
              <XIcon />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-4">
            <SidebarNav onNavigate={close} />
          </div>
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border p-3">
            <ThemeSegmented />
            <MotionSegmented />
          </div>
        </div>
      </dialog>
    </>
  );
}
