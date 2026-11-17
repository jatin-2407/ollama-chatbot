import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRoutes } from "./components/AppRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

const app = (
  <StrictMode>
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
(import.meta.hot.data.root ??= createRoot(document.getElementById("root")!)).render(app);
