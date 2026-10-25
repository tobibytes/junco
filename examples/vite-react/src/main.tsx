import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, TooltipProvider } from "junco";
import { App } from "./app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
