import React from "react";
import { NavLink } from "react-router-dom";
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  Warehouse, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "../../hooks/useStore";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { db } = useStore();
  
  const pending = db.orders.filter((o) => o.status === "pending").length;
  const lowStock = db.products.filter((p) => p.stock < p.lowStockThreshold).length;
  
  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: BarChart3, description: "View dashboard overview and statistics" },
    { to: "/orders", label: "Orders", icon: ShoppingCart, badge: pending, description: "Manage customer orders" },
    { to: "/products", label: "Products", icon: Package, badge: lowStock, description: "Manage product catalog" },
    { to: "/customers", label: "Customers", icon: Users, description: "Manage customer accounts" },
    { to: "/analytics", label: "Analytics", icon: TrendingUp, description: "View business analytics" },
    { to: "/inventory", label: "Inventory", icon: Warehouse, description: "Manage inventory levels" },
    { to: "/settings", label: "Settings", icon: Settings, description: "Configure system settings" },
  ];
  
  return (
    <>
      {mobileOpen && (
        <button 
          className="fixed inset-0 z-30 bg-black/60 lg:hidden" 
          aria-label="Close menu" 
          onClick={onMobileClose} 
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-stay-border bg-stay-black transition-all ${
        collapsed ? "w-20" : "w-72"
      } ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex h-20 items-center gap-3 border-b border-stay-border px-3 sm:px-5">
          <Logo />
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-lg sm:text-xl lg:text-2xl leading-none truncate">STAY FIT</p>
              <span className="rounded bg-stay-red px-2 py-0.5 text-xs font-bold">ADMIN</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                title={collapsed ? item.label : undefined} 
                onClick={onMobileClose} 
                aria-label={item.label}
                aria-describedby={`${item.to}-desc`}
                className={({ isActive }) => `group flex items-center gap-2 sm:gap-3 border-l-4 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-bold transition ${
                  isActive 
                    ? "border-stay-red bg-stay-red/10 text-white" 
                    : "border-transparent text-stay-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} className="sm:size-21" aria-hidden="true" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    <span id={`${item.to}-desc`} className="sr-only">
                      {item.description}
                    </span>
                  </>
                )}
                {!collapsed && item.badge ? (
                  <span 
                    className="rounded-full bg-stay-red px-1.5 py-0.5 text-xs text-white min-w-[1.25rem] text-center" 
                    aria-label={`${item.badge} pending items`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
        
        <button 
          className="m-3 hidden items-center justify-center gap-2 rounded border border-stay-border p-3 text-stay-muted hover:text-white lg:flex" 
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> Collapse</>}
        </button>
      </aside>
    </>
  );
}
