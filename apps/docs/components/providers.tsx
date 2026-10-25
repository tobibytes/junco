"use client";

import { ThemeProvider, TooltipProvider } from "junco";
import * as React from "react";

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
  return (
    <ThemeProvider>
      <TooltipProvider>
        <SearchContext.Provider value={search}>{children}</SearchContext.Provider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
