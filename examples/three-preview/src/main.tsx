import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@junco/react";
import { App } from "./app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <App />
    </ThemeProvider>
  </StrictMode>,
);
