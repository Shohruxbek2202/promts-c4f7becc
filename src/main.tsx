import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </ThemeProvider>
);
