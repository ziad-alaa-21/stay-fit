import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, Search } from "lucide-react";
import { useStore } from "../../hooks/useStore";
import { Action } from "../../types";

interface HeaderProps {
  title: string;
  onMenu: () => void;
  onNavigate: (to: string) => void;
  dispatch: React.Dispatch<Action>;
}

export function Header({ title, onMenu, onNavigate, dispatch }: HeaderProps) {
  const { db } = useStore();
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return [
      ...db.products.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q)).slice(0, 4).map((p) => ({ 
        label: p.name, 
        meta: p.sku, 
        to: "/products" 
      })),
      ...db.orders.filter((o) => `${o.id} ${o.customerName}`.toLowerCase().includes(q)).slice(0, 4).map((o) => ({ 
        label: o.id, 
        meta: o.customerName, 
        to: "/orders" 
      })),
      ...db.customers.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q)).slice(0, 4).map((c) => ({ 
        label: c.name, 
        meta: c.email, 
        to: "/customers" 
      })),
    ].slice(0, 8);
  }, [db, query]);
  
  const handleSearchResultClick = useCallback((to: string) => {
    onNavigate(to);
    setQuery("");
  }, [onNavigate]);
  
  const handleMarkAllRead = useCallback(() => {
    dispatch({ type: "MARK_NOTIFICATION" });
  }, [dispatch]);
  
  const handleNotificationClick = useCallback((id: string) => {
    dispatch({ type: "MARK_NOTIFICATION", id });
  }, [dispatch]);
  
  useEffect(() => {
    const focus = (event: KeyboardEvent) => {
      if (event.key === "/" || (event.ctrlKey && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", focus);
    return () => window.removeEventListener("keydown", focus);
  }, []);
  
  const unread = db.notifications.filter((n) => !n.read).length;
  
  return (
    <header className="sticky top-0 z-20 border-b border-stay-border bg-stay-black/95 backdrop-blur">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open sidebar">
          <Menu size={20} />
        </button>
        
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl uppercase leading-none truncate">{title}</h1>
          <p className="text-xs text-stay-muted">STAY FIT Admin</p>
        </div>
        
        {/* Desktop Search */}
        <div className="relative hidden md:block mx-auto w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stay-muted" size={18} />
          <input 
            id="global-search" 
            className="input pl-10" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search products, orders, customers..." 
          />
          {query && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-96 overflow-auto rounded border border-stay-border bg-stay-card shadow-glow z-50">
              {results.length ? results.map((result, index) => (
                <button 
                  key={`${result.label}-${index}`} 
                  className="block w-full border-b border-stay-border px-4 py-3 text-left hover:bg-white/5" 
                  onClick={() => handleSearchResultClick(result.to)}
                >
                  <p className="font-bold">{result.label}</p>
                  <p className="text-sm text-stay-muted">{result.meta}</p>
                </button>
              )) : <p className="p-4 text-sm text-stay-muted">No results found.</p>}
            </div>
          )}
        </div>
        
        {/* Mobile Search Button */}
        <button 
          className="icon-btn md:hidden" 
          onClick={() => setQuery(query ? "" : " ")}
          aria-label="Toggle search"
        >
          <Search size={20} />
        </button>
        
        {/* Mobile Search Input */}
        {query && (
          <div className="absolute top-full left-0 right-0 z-50 p-4 bg-stay-black border-b border-stay-border md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stay-muted" size={18} />
              <input 
                className="input pl-10 w-full" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search products, orders, customers..." 
                autoFocus
              />
            </div>
            {query && (
              <div className="mt-2 max-h-64 overflow-auto rounded border border-stay-border bg-stay-card">
                {results.length ? results.map((result, index) => (
                  <button 
                    key={`${result.label}-${index}`} 
                    className="block w-full border-b border-stay-border px-4 py-3 text-left hover:bg-white/5" 
                    onClick={() => handleSearchResultClick(result.to)}
                  >
                    <p className="font-bold">{result.label}</p>
                    <p className="text-sm text-stay-muted">{result.meta}</p>
                  </button>
                )) : <p className="p-4 text-sm text-stay-muted">No results found.</p>}
              </div>
            )}
          </div>
        )}
        
        <div className="relative">
          <button 
            className="icon-btn relative" 
            onClick={() => setNotifOpen((v) => !v)} 
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unread ? <span className="absolute -right-1 -top-1 rounded-full bg-stay-red px-1.5 text-xs">{unread}</span> : null}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded border border-stay-border bg-stay-card shadow-glow">
              <div className="flex items-center justify-between border-b border-stay-border p-3">
                <b>Notifications</b>
                <button 
                  className="text-xs text-stay-red" 
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </button>
              </div>
              {db.notifications.slice(0, 8).map((n) => (
                <button 
                  key={n.id} 
                  className="block w-full border-b border-stay-border p-3 text-left hover:bg-white/5" 
                  onClick={() => handleNotificationClick(n.id)}
                >
                  <p className={n.read ? "text-stay-muted" : "font-bold"}>{n.title}</p>
                  <p className="text-sm text-stay-muted">{n.body}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            className="flex items-center gap-3 rounded border border-stay-border px-3 py-2" 
            onClick={() => setProfileOpen((v) => !v)}
          >
            <span className="hidden text-sm sm:block">{db.settings.adminName}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-stay-red font-bold">A</span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-48 rounded border border-stay-border bg-stay-card shadow-glow">
              <button className="menu-item" onClick={() => onNavigate("/settings")}>Profile</button>
              <button className="menu-item" onClick={() => onNavigate("/settings")}>Settings</button>
              <button className="menu-item" onClick={() => alert("Mock logout complete.")}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
