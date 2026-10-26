import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { ThemeProvider, Toaster, TooltipProvider } from "@junco/react";
import { router } from "./app";
import { AuthProvider } from "./lib/auth";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="acme">
      <TooltipProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
