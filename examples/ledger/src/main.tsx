import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, Toaster, TooltipProvider } from "@junco/react";
import { App } from "./app";
import { LedgerProvider } from "./store";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="ledger">
      <TooltipProvider>
        <LedgerProvider>
          <App />
        </LedgerProvider>
        <Toaster position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
