import React, { useState, Suspense, lazy } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import { useStore } from "../../hooks/useStore";
import { Action } from "../../types";
import { titleCase } from "../../utils/helpers";

// Direct imports for now - will re-enable lazy loading after fixing build issues
import { StorefrontRedirect } from "../../pages/StorefrontRedirect";
import { Dashboard } from "../../pages/Dashboard";
import { OrdersPage } from "../../pages/OrdersPage";
import { ProductsPage } from "../../pages/ProductsPage";
import { CustomersPage } from "../../pages/CustomersPage";
import { AnalyticsPage } from "../../pages/AnalyticsPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { SettingsPage } from "../../pages/SettingsPage";

export function AppShell() {
  const { db, dispatch } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const page = location.pathname.split("/")[1] || "dashboard";
  const title = titleCase(page);
  
  return (
    <div className="min-h-screen bg-stay-black text-white overflow-x-hidden">
      <Sidebar 
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      
      <div className={`transition-all overflow-x-hidden ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <Header 
          title={title}
          onMenu={() => setMobileOpen(true)}
          onNavigate={navigate}
          dispatch={dispatch}
        />
        
        <main className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 overflow-x-hidden">
          <p className="mb-4 sm:mb-5 text-xs sm:text-sm text-stay-muted">
            Admin / <span className="text-white">{title}</span>
          </p>
          
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<StorefrontRedirect />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
