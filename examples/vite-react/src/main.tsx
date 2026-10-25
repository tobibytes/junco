import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, Toaster, TooltipProvider } from "@junco/react";
import { App } from "./app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
