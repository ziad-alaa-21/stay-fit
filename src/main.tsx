import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { StoreProvider } from "./context/StoreContext";
import { AppShell } from "./components/layout/AppShell";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <StoreProvider>
          <AppShell />
        </StoreProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
