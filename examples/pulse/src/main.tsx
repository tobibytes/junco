import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, Toaster, TooltipProvider } from "junco";
import { App } from "./app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="pulse">
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
