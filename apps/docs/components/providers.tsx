"use client";

import { ThemeProvider, Toaster, TooltipProvider } from "junco";
import { usePathname } from "next/navigation";
import * as React from "react";
import { isFramePath } from "@/lib/frame";

interface SearchContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SearchContext = React.createContext<SearchContextValue>({ open: false, setOpen: () => {} });

export function useSearch() {
  return React.useContext(SearchContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const search = React.useMemo(() => ({ open, setOpen }), [open]);
  const pathname = usePathname();

  // Preview frames get their theme from the page that embeds them (URL + postMessage), never from
  // the saved site setting, so they skip ThemeProvider. Blocks call toast(), so frames get a Toaster.
  if (isFramePath(pathname)) {
    return (
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    );
  }

  return (
    <ThemeProvider>
      <TooltipProvider>
        <SearchContext.Provider value={search}>{children}</SearchContext.Provider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
