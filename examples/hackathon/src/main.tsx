import { ThemeProvider, Toaster, TooltipProvider } from "junco";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HomePage } from "./home";
import { RegisterPage } from "./register";
import { Footer, Header, useHashRoute } from "./shell";
import "./index.css";

function App() {
  const route = useHashRoute();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-toast focus:rounded-control focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <Header route={route} />
      <main id="main" tabIndex={-1} className="outline-none">
        {route === "register" ? <RegisterPage /> : <HomePage />}
      </main>
      <Footer />
      <Toaster />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="morganhacks">
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
