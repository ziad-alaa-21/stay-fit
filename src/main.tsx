import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FileText,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import "./styles.css";

type ProductStatus = "active" | "draft" | "archived";
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
type PaymentMethod = "cod" | "card" | "vodafone_cash";
type ToastKind = "success" | "error" | "warning" | "info";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  flavor: string[];
  weight: string;
  image?: string;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  notes: string;
}

interface StockAdjustment {
  id: string;
  productId: string;
  quantity: number;
  reason: string;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  kind: "order" | "stock" | "customer";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface StoreSettings {
  storeName: string;
  currency: string;
  contactEmail: string;
  phone: string;
  adminName: string;
  adminEmail: string;
  password: string;
}

interface Database {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  stockAdjustments: StockAdjustment[];
  notifications: NotificationItem[];
  settings: StoreSettings;
}

type Action =
  | { type: "SET_DB"; payload: Database }
  | { type: "UPSERT_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCTS"; ids: string[] }
  | { type: "UPDATE_PRODUCTS"; ids: string[]; patch: Partial<Product> }
  | { type: "UPSERT_ORDER"; payload: Order }
  | { type: "DELETE_ORDERS"; ids: string[] }
  | { type: "UPDATE_ORDERS"; ids: string[]; patch: Partial<Order> }
  | { type: "UPSERT_CUSTOMER"; payload: Customer }
  | { type: "DELETE_CUSTOMER"; id: string }
  | { type: "ADJUST_STOCK"; payload: StockAdjustment }
  | { type: "MARK_NOTIFICATION"; id?: string }
  | { type: "SAVE_SETTINGS"; payload: StoreSettings };

const categories = ["Whey Protein", "Creatine", "Pre-Workout", "BCAAs", "Mass Gainer", "Sleep Aid", "Vitamins", "Accessories"];
const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];
const productStatuses: ProductStatus[] = ["active", "draft", "archived"];
const paymentMethods: PaymentMethod[] = ["cod", "card", "vodafone_cash"];
const dbKey = "stayFitAdminDb";
const red = "#E63946";
const chartColors = ["#E63946", "#22C55E", "#EAB308", "#8B5CF6", "#38BDF8", "#F97316", "#EC4899"];

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
const nowIso = () => new Date().toISOString();
const money = (value: number) => `LE ${Math.round(value).toLocaleString("en-EG")}.00`;
const dateText = (value: string) => new Date(value).toLocaleDateString("en-GB");
const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
const titleCase = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (m: string) => m.toUpperCase());

function generateDemoData(): Database {
  const first = ["Omar", "Mariam", "Youssef", "Nour", "Ahmed", "Farida", "Karim", "Laila", "Hassan", "Salma", "Mazen", "Dina"];
  const last = ["Hassan", "Adel", "Mahmoud", "Nabil", "Fouad", "Samir", "Ibrahim", "Khaled", "Mostafa", "Yehia"];
  const flavors = ["Chocolate Spread", "Strawberry Rush", "Cosmic Candy", "Vanilla Forge", "Blue Raspberry", "Banana Cream", "Energy Drink"];
  const weights = ["300g", "500g", "1kg", "2kg", "5kg"];
  const products: Product[] = Array.from({ length: 50 }, (_, index) => {
    const category = categories[index % 7];
    const flavor = flavors[(index * 3) % flavors.length];
    const base = category === "Whey Protein" ? 2400 : category === "Mass Gainer" ? 2900 : category === "Creatine" ? 950 : 1200;
    const low = index < 10 ? Math.floor(Math.random() * 9) : Math.floor(10 + Math.random() * 120);
    return {
      id: uid("prd"),
      name: `STAY FIT ${category.toUpperCase()} - ${flavor}`,
      sku: `SF-${category.slice(0, 3).toUpperCase()}-${1000 + index}`,
      category,
      description: `Premium ${category.toLowerCase()} built for intense training blocks.`,
      price: base + (index % 5) * 120,
      compareAtPrice: base + 450,
      costPerItem: Math.round(base * 0.52),
      stock: low,
      lowStockThreshold: 10,
      status: index % 12 === 0 ? "archived" : index % 7 === 0 ? "draft" : "active",
      flavor: [flavor],
      weight: weights[index % weights.length],
      salesCount: 20 + ((index * 17) % 260),
      createdAt: daysAgo(120 - index),
      updatedAt: daysAgo(index % 20),
    };
  });
  const customers: Customer[] = Array.from({ length: 80 }, (_, index) => {
    const name = `${first[index % first.length]} ${last[(index * 2) % last.length]}`;
    return {
      id: uid("cus"),
      name,
      email: `${name.toLowerCase().replace(" ", ".")}${index}@stayfit.test`,
      phone: `+20 10${Math.floor(10000000 + Math.random() * 89999999)}`,
      address: `${12 + index} Gym Street, New Cairo, Egypt`,
      totalOrders: 0,
      totalSpent: 0,
      joinDate: daysAgo(180 - (index % 90)),
      notes: index % 8 === 0 ? "Prefers phone confirmation before shipping." : "",
    };
  });
  const orders: Order[] = Array.from({ length: 200 }, (_, index) => {
    const customer = customers[index % customers.length];
    const itemCount = 1 + (index % 4);
    const items = Array.from({ length: itemCount }, (_, itemIndex) => {
      const product = products[(index * 5 + itemIndex * 7) % products.length];
      const quantity = 1 + ((index + itemIndex) % 3);
      return { productId: product.id, productName: product.name, quantity, unitPrice: product.price, total: product.price * quantity };
    });
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const shippingCost = subtotal > 2500 ? 0 : 85;
    return {
      id: `SF-${new Date().getFullYear()}-${String(10000 + index)}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddress: customer.address,
      items,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      status: statuses[index % statuses.length],
      paymentMethod: paymentMethods[index % paymentMethods.length],
      createdAt: daysAgo(index % 90),
      updatedAt: daysAgo(index % 30),
    };
  });
  orders.forEach((order) => {
    const customer = customers.find((c) => c.id === order.customerId);
    if (customer && order.status !== "cancelled" && order.status !== "refunded") {
      customer.totalOrders += 1;
      customer.totalSpent += order.total;
    }
  });
  const notifications: NotificationItem[] = [
    ...orders.slice(0, 6).map((order) => ({ id: uid("not"), kind: "order" as const, title: "Recent order", body: `${order.id} from ${order.customerName}`, read: false, createdAt: order.createdAt })),
    ...products.filter((p) => p.stock < p.lowStockThreshold).slice(0, 8).map((p) => ({ id: uid("not"), kind: "stock" as const, title: "Low stock alert", body: `${p.name} has ${p.stock} units left`, read: false, createdAt: nowIso() })),
    ...customers.slice(0, 4).map((c) => ({ id: uid("not"), kind: "customer" as const, title: "New customer", body: `${c.name} joined STAY FIT`, read: true, createdAt: c.joinDate })),
  ];
  return {
    products,
    orders,
    customers,
    stockAdjustments: [],
    notifications,
    settings: {
      storeName: "STAY FIT",
      currency: "EGP",
      contactEmail: "admin@stayfit.eg",
      phone: "+20 100 000 0000",
      adminName: "STAY FIT Admin",
      adminEmail: "owner@stayfit.eg",
      password: "demo-password",
    },
  };
}

function reducer(state: Database, action: Action): Database {
  switch (action.type) {
    case "SET_DB":
      return action.payload;
    case "UPSERT_PRODUCT": {
      const exists = state.products.some((p) => p.id === action.payload.id);
      return { ...state, products: exists ? state.products.map((p) => (p.id === action.payload.id ? action.payload : p)) : [action.payload, ...state.products] };
    }
    case "DELETE_PRODUCTS":
      return { ...state, products: state.products.filter((p) => !action.ids.includes(p.id)) };
    case "UPDATE_PRODUCTS":
      return { ...state, products: state.products.map((p) => (action.ids.includes(p.id) ? { ...p, ...action.patch, updatedAt: nowIso() } : p)) };
    case "UPSERT_ORDER": {
      const exists = state.orders.some((o) => o.id === action.payload.id);
      return { ...state, orders: exists ? state.orders.map((o) => (o.id === action.payload.id ? action.payload : o)) : [action.payload, ...state.orders] };
    }
    case "DELETE_ORDERS":
      return { ...state, orders: state.orders.filter((o) => !action.ids.includes(o.id)) };
    case "UPDATE_ORDERS":
      return { ...state, orders: state.orders.map((o) => (action.ids.includes(o.id) ? { ...o, ...action.patch, updatedAt: nowIso() } : o)) };
    case "UPSERT_CUSTOMER": {
      const exists = state.customers.some((c) => c.id === action.payload.id);
      return { ...state, customers: exists ? state.customers.map((c) => (c.id === action.payload.id ? action.payload : c)) : [action.payload, ...state.customers] };
    }
    case "DELETE_CUSTOMER":
      return { ...state, customers: state.customers.filter((c) => c.id !== action.id) };
    case "ADJUST_STOCK":
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.productId ? { ...p, stock: Math.max(0, p.stock + action.payload.quantity), updatedAt: nowIso() } : p)),
        stockAdjustments: [action.payload, ...state.stockAdjustments],
      };
    case "MARK_NOTIFICATION":
      return { ...state, notifications: state.notifications.map((n) => (!action.id || n.id === action.id ? { ...n, read: true } : n)) };
    case "SAVE_SETTINGS":
      return { ...state, settings: action.payload };
    default:
      return state;
  }
}

const StoreContext = createContext<{ db: Database; dispatch: React.Dispatch<Action> } | null>(null);
const ToastContext = createContext<{ push: (kind: ToastKind, message: string) => void } | null>(null);

function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("StoreContext missing");
  return ctx;
}

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("ToastContext missing");
  return ctx;
}

function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, dispatch] = useReducer(reducer, undefined, () => {
    const saved = localStorage.getItem(dbKey);
    if (saved) return JSON.parse(saved) as Database;
    const demo = generateDemoData();
    localStorage.setItem(dbKey, JSON.stringify(demo));
    return demo;
  });
  useEffect(() => localStorage.setItem(dbKey, JSON.stringify(db)), [db]);
  return <StoreContext.Provider value={{ db, dispatch }}>{children}</StoreContext.Provider>;
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: string; kind: ToastKind; message: string }>>([]);
  const push = (kind: ToastKind, message: string) => {
    const id = uid("toast");
    setToasts((current) => [...current, { id, kind, message }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4000);
  };
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 z-[90] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={`rounded border p-4 shadow-glow ${toast.kind === "success" ? "border-green-500 bg-green-950" : toast.kind === "error" ? "border-red-500 bg-red-950" : toast.kind === "warning" ? "border-yellow-500 bg-yellow-950" : "border-sky-500 bg-sky-950"}`}>
            <p className="text-sm font-bold text-white">{titleCase(toast.kind)}</p>
            <p className="text-sm text-white/85">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "border-yellow-500/50 bg-yellow-500/15 text-yellow-300",
    processing: "border-sky-500/50 bg-sky-500/15 text-sky-300",
    shipped: "border-violet-500/50 bg-violet-500/15 text-violet-300",
    delivered: "border-green-500/50 bg-green-500/15 text-green-300",
    cancelled: "border-red-500/50 bg-red-500/15 text-red-300",
    refunded: "border-zinc-500/50 bg-zinc-500/15 text-zinc-300",
    active: "border-green-500/50 bg-green-500/15 text-green-300",
    draft: "border-zinc-500/50 bg-zinc-500/15 text-zinc-300",
    archived: "border-red-500/50 bg-red-500/15 text-red-300",
  };
  return <span className={`inline-flex rounded border px-2 py-1 text-xs font-bold uppercase ${colors[status] ?? "border-stay-border text-stay-muted"}`}>{titleCase(status)}</span>;
}

function Modal({ title, children, onClose, wide = false }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <section className={`max-h-[92vh] w-full overflow-auto rounded-lg border border-stay-border bg-stay-card shadow-glow ${wide ? "max-w-5xl" : "max-w-2xl"} max-sm:h-full max-sm:max-h-full max-sm:rounded-none`}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stay-border bg-stay-card p-5">
          <h2 className="font-display text-2xl uppercase">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

function ConfirmModal({ message, onCancel, onConfirm }: { message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal title="Are you sure?" onClose={onCancel}>
      <p className="text-stay-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>Confirm</button>
      </div>
    </Modal>
  );
}

function useTable<T>(rows: T[], pageSize = 20) {
  const [sort, setSort] = useState<{ key: keyof T; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const sorted = useMemo(() => {
    const copy = [...rows];
    if (sort) copy.sort((a, b) => String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), undefined, { numeric: true }) * (sort.dir === "asc" ? 1 : -1));
    return copy;
  }, [rows, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = sorted.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize);
  const toggleSort = (key: keyof T) => setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  return { current, pages, page: Math.min(page, pages), setPage, toggleSort, sort };
}

function SortTh<T>({ label, sortKey, table }: { label: string; sortKey: keyof T; table: ReturnType<typeof useTable<T>> }) {
  return <th><button onClick={() => table.toggleSort(sortKey)}>{label} {table.sort?.key === sortKey ? (table.sort.dir === "asc" ? "↑" : "↓") : ""}</button></th>;
}

function Pagination({ page, pages, setPage }: { page: number; pages: number; setPage: (n: number) => void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-stay-muted">Page {page} of {pages}</p>
      <div className="flex gap-2">
        <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => Math.max(1, Math.min(pages - 4, page - 2)) + i).filter((p, i, a) => a.indexOf(p) === i).map((p) => (
          <button key={p} className={p === page ? "btn-primary" : "btn-secondary"} onClick={() => setPage(p)}>{p}</button>
        ))}
        <button className="btn-secondary" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

function AppShell() {
  const { db, dispatch } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const page = location.pathname.split("/")[1] || "dashboard";
  const title = titleCase(page);
  const pending = db.orders.filter((o) => o.status === "pending").length;
  const lowStock = db.products.filter((p) => p.stock < p.lowStockThreshold).length;
  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/orders", label: "Orders", icon: ShoppingCart, badge: pending },
    { to: "/products", label: "Products", icon: Package, badge: lowStock },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/analytics", label: "Analytics", icon: TrendingUp },
    { to: "/inventory", label: "Inventory", icon: Warehouse },
    { to: "/settings", label: "Settings", icon: Settings },
  ];
  return (
    <div className="min-h-screen bg-stay-black text-white">
      {mobileOpen && <button className="fixed inset-0 z-30 bg-black/60 lg:hidden" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-stay-border bg-stay-black transition-all ${collapsed ? "w-20" : "w-72"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex h-20 items-center gap-3 border-b border-stay-border px-5">
          <Logo />
          {!collapsed && <div><p className="font-display text-2xl leading-none">STAY FIT</p><span className="rounded bg-stay-red px-2 py-0.5 text-xs font-bold">ADMIN</span></div>}
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} title={collapsed ? item.label : undefined} onClick={() => setMobileOpen(false)} className={({ isActive }) => `group flex items-center gap-3 border-l-4 px-3 py-3 text-sm font-bold transition ${isActive ? "border-stay-red bg-stay-red/10 text-white" : "border-transparent text-stay-muted hover:bg-white/5 hover:text-white"}`}>
                <Icon size={21} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge ? <span className="rounded-full bg-stay-red px-2 py-0.5 text-xs text-white">{item.badge}</span> : null}
              </NavLink>
            );
          })}
        </nav>
        <button className="m-3 hidden items-center justify-center gap-2 rounded border border-stay-border p-3 text-stay-muted hover:text-white lg:flex" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> Collapse</>}
        </button>
      </aside>
      <div className={`transition-all ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <Header title={title} onMenu={() => setMobileOpen(true)} onNavigate={navigate} dispatch={dispatch} />
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <p className="mb-5 text-sm text-stay-muted">Admin / <span className="text-white">{title}</span></p>
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
        </main>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg className="h-11 w-11 shrink-0 drop-shadow-[0_0_12px_rgba(230,57,70,0.6)]" viewBox="0 0 120 120" aria-label="STAY FIT logo">
      <circle cx="60" cy="60" r="54" fill="#0A0A0A" stroke="#E63946" strokeWidth="4" />
      <path d="M67 13 39 64h21l-10 43 35-58H64l3-36Z" fill="#E63946" />
      <text x="60" y="88" textAnchor="middle" fill="#E63946" fontSize="14" fontWeight="800">STAY FIT</text>
    </svg>
  );
}

function StorefrontRedirect() {
  useEffect(() => {
    window.location.replace("/storefront.html");
  }, []);
  return <div className="min-h-screen bg-stay-black" />;
}

function Header({ title, onMenu, onNavigate, dispatch }: { title: string; onMenu: () => void; onNavigate: (to: string) => void; dispatch: React.Dispatch<Action> }) {
  const { db } = useStore();
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return [
      ...db.products.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q)).slice(0, 4).map((p) => ({ label: p.name, meta: p.sku, to: "/products" })),
      ...db.orders.filter((o) => `${o.id} ${o.customerName}`.toLowerCase().includes(q)).slice(0, 4).map((o) => ({ label: o.id, meta: o.customerName, to: "/orders" })),
      ...db.customers.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q)).slice(0, 4).map((c) => ({ label: c.name, meta: c.email, to: "/customers" })),
    ].slice(0, 8);
  }, [db, query]);
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
        <button className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open sidebar"><Menu size={20} /></button>
        <div className="min-w-[150px]">
          <h1 className="font-display text-3xl uppercase leading-none">{title}</h1>
          <p className="text-xs text-stay-muted">STAY FIT Admin</p>
        </div>
        <div className="relative mx-auto hidden w-full max-w-xl md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stay-muted" size={18} />
          <input id="global-search" className="input pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, orders, customers..." />
          {query && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-96 overflow-auto rounded border border-stay-border bg-stay-card shadow-glow">
              {results.length ? results.map((result, index) => (
                <button key={`${result.label}-${index}`} className="block w-full border-b border-stay-border px-4 py-3 text-left hover:bg-white/5" onClick={() => { onNavigate(result.to); setQuery(""); }}>
                  <p className="font-bold">{result.label}</p><p className="text-sm text-stay-muted">{result.meta}</p>
                </button>
              )) : <p className="p-4 text-sm text-stay-muted">No results found.</p>}
            </div>
          )}
        </div>
        <div className="relative">
          <button className="icon-btn relative" onClick={() => setNotifOpen((v) => !v)} aria-label="Notifications"><Bell size={20} />{unread ? <span className="absolute -right-1 -top-1 rounded-full bg-stay-red px-1.5 text-xs">{unread}</span> : null}</button>
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded border border-stay-border bg-stay-card shadow-glow">
              <div className="flex items-center justify-between border-b border-stay-border p-3"><b>Notifications</b><button className="text-xs text-stay-red" onClick={() => dispatch({ type: "MARK_NOTIFICATION" })}>Mark all read</button></div>
              {db.notifications.slice(0, 8).map((n) => <button key={n.id} className="block w-full border-b border-stay-border p-3 text-left hover:bg-white/5" onClick={() => dispatch({ type: "MARK_NOTIFICATION", id: n.id })}><p className={n.read ? "text-stay-muted" : "font-bold"}>{n.title}</p><p className="text-sm text-stay-muted">{n.body}</p></button>)}
            </div>
          )}
        </div>
        <div className="relative">
          <button className="flex items-center gap-3 rounded border border-stay-border px-3 py-2" onClick={() => setProfileOpen((v) => !v)}><span className="hidden text-sm sm:block">{db.settings.adminName}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-stay-red font-bold">A</span></button>
          {profileOpen && <div className="absolute right-0 mt-3 w-48 rounded border border-stay-border bg-stay-card shadow-glow"><button className="menu-item" onClick={() => onNavigate("/settings")}>Profile</button><button className="menu-item" onClick={() => onNavigate("/settings")}>Settings</button><button className="menu-item" onClick={() => alert("Mock logout complete.")}>Logout</button></div>}
        </div>
      </div>
    </header>
  );
}

function metricChange(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function Dashboard() {
  const { db } = useStore();
  const navigate = useNavigate();
  const [range, setRange] = useState(30);
  const [orderModal, setOrderModal] = useState<Order | null>(null);
  const delivered = db.orders.filter((o) => o.status === "delivered");
  const last30 = delivered.filter((o) => new Date(o.createdAt) >= new Date(Date.now() - 30 * 86400000));
  const prev30 = delivered.filter((o) => new Date(o.createdAt) < new Date(Date.now() - 30 * 86400000) && new Date(o.createdAt) >= new Date(Date.now() - 60 * 86400000));
  const stats = [
    { label: "Total Revenue", value: money(delivered.reduce((s, o) => s + o.total, 0)), change: metricChange(last30.reduce((s, o) => s + o.total, 0), prev30.reduce((s, o) => s + o.total, 0)) },
    { label: "Total Orders", value: db.orders.length.toLocaleString(), change: metricChange(db.orders.filter((o) => new Date(o.createdAt) >= new Date(Date.now() - 30 * 86400000)).length, db.orders.filter((o) => new Date(o.createdAt) < new Date(Date.now() - 30 * 86400000) && new Date(o.createdAt) >= new Date(Date.now() - 60 * 86400000)).length) },
    { label: "Total Customers", value: db.customers.length.toLocaleString(), change: metricChange(db.customers.filter((c) => new Date(c.joinDate) >= new Date(Date.now() - 30 * 86400000)).length, db.customers.filter((c) => new Date(c.joinDate) < new Date(Date.now() - 30 * 86400000) && new Date(c.joinDate) >= new Date(Date.now() - 60 * 86400000)).length) },
    { label: "Low Stock Alerts", value: db.products.filter((p) => p.stock < p.lowStockThreshold).length.toLocaleString(), change: 0, onClick: () => navigate("/inventory?filter=low") },
  ];
  const revenue = dailyRevenue(db.orders, range);
  const byCategory = categorySales(db.products, db.orders);
  const topProducts = [...db.products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
  const maxSales = topProducts[0]?.salesCount || 1;
  const recent = [...db.orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 10);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <button key={stat.label} onClick={stat.onClick} className="card text-left"><p className="text-sm text-stay-muted">{stat.label}</p><p className="mt-2 text-3xl font-black">{stat.value}</p><p className={`mt-3 flex items-center gap-1 text-sm ${stat.change >= 0 ? "text-green-400" : "text-red-400"}`}>{stat.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}{Math.abs(stat.change).toFixed(1)}% vs previous 30d</p></button>)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="card">
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="section-title">Revenue</h2><div className="flex gap-2">{[7, 30, 90].map((d) => <button key={d} className={range === d ? "btn-primary" : "btn-secondary"} onClick={() => setRange(d)}>{d}D</button>)}</div></div>
          <div className="h-80"><ResponsiveContainer><AreaChart data={revenue}><defs><linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={red} stopOpacity={0.55} /><stop offset="95%" stopColor={red} stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#333" /><XAxis dataKey="day" stroke="#A0A0A0" /><YAxis stroke="#A0A0A0" /><Tooltip formatter={(v) => money(Number(v))} contentStyle={{ background: "#1A1A1A", border: "1px solid #333" }} /><Area dataKey="revenue" stroke={red} fill="url(#redFill)" strokeWidth={3} /></AreaChart></ResponsiveContainer></div>
        </section>
        <section className="card">
          <h2 className="section-title">Sales by Category</h2>
          <div className="relative h-80"><ResponsiveContainer><PieChart><Pie data={byCategory} dataKey="units" nameKey="category" innerRadius={76} outerRadius={110}>{byCategory.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}</Pie><Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #333" }} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center"><p className="text-center text-sm text-stay-muted"><span className="block text-3xl font-black text-white">{byCategory.reduce((s, c) => s + c.units, 0)}</span>units sold</p></div></div>
        </section>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card overflow-hidden"><div className="mb-4 flex justify-between"><h2 className="section-title">Recent Orders</h2><Link className="text-sm text-stay-red" to="/orders">View All</Link></div><DataTable><thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{recent.map((o) => <tr key={o.id}><td>{o.id}</td><td>{o.customerName}</td><td>{dateText(o.createdAt)}</td><td>{money(o.total)}</td><td><StatusBadge status={o.status} /></td><td><button className="btn-secondary" onClick={() => setOrderModal(o)}>View</button></td></tr>)}</tbody></DataTable></section>
        <section className="card"><div className="mb-4 flex justify-between"><h2 className="section-title">Top Selling Products</h2><Link className="text-sm text-stay-red" to="/analytics">View Report</Link></div><div className="space-y-4">{topProducts.map((p) => <div key={p.id} className="flex items-center gap-4"><ProductThumb product={p} /><div className="min-w-0 flex-1"><p className="truncate font-bold">{p.name}</p><p className="text-sm text-stay-muted">{p.salesCount} units · {money(p.salesCount * p.price)}</p><div className="mt-2 h-2 rounded bg-stay-elevated"><div className="h-full rounded bg-stay-red" style={{ width: `${(p.salesCount / maxSales) * 100}%` }} /></div></div></div>)}</div></section>
      </div>
      {orderModal && <OrderDetailModal order={orderModal} onClose={() => setOrderModal(null)} />}
    </div>
  );
}

function DataTable({ children }: { children: React.ReactNode }) {
  return <div className="table-wrap"><table className="data-table">{children}</table></div>;
}

function ProductThumb({ product }: { product: Product }) {
  if (product.image) return <img src={product.image} alt="" className="h-14 w-14 rounded object-cover" />;
  return <div className="grid h-14 w-14 shrink-0 place-items-center rounded bg-gradient-to-br from-stay-red/70 to-stay-elevated font-display text-lg">{product.category.slice(0, 2).toUpperCase()}</div>;
}

function dailyRevenue(orders: Order[], days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * 86400000);
    const key = date.toISOString().slice(0, 10);
    const revenue = orders.filter((o) => o.status === "delivered" && o.createdAt.slice(0, 10) === key).reduce((s, o) => s + o.total, 0);
    return { day: `${date.getMonth() + 1}/${date.getDate()}`, revenue };
  });
}

function categorySales(products: Product[], orders: Order[]) {
  const map = new Map<string, number>();
  orders.forEach((order) => order.items.forEach((item) => {
    const category = products.find((p) => p.id === item.productId)?.category ?? "Others";
    map.set(category, (map.get(category) ?? 0) + item.quantity);
  }));
  return [...map.entries()].map(([category, units]) => ({ category, units })).sort((a, b) => b.units - a.units);
}

function OrdersPage() {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const [filters, setFilters] = useState({ q: "", status: "all", range: "all", payment: "all", min: "", max: "" });
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<Order | null>(null);
  const [confirm, setConfirm] = useState<string[] | null>(null);
  const rows = db.orders.filter((o) => {
    const d = new Date(o.createdAt);
    const rangeOk = filters.range === "all" || (filters.range === "today" && o.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)) || (filters.range === "7" && d >= new Date(Date.now() - 7 * 86400000)) || (filters.range === "30" && d >= new Date(Date.now() - 30 * 86400000));
    return (!filters.q || `${o.id} ${o.customerName}`.toLowerCase().includes(filters.q.toLowerCase())) && (filters.status === "all" || o.status === filters.status) && (filters.payment === "all" || o.paymentMethod === filters.payment) && (!filters.min || o.total >= Number(filters.min)) && (!filters.max || o.total <= Number(filters.max)) && rangeOk;
  });
  const table = useTable(rows, 20);
  const deleteOrders = (ids: string[]) => { dispatch({ type: "DELETE_ORDERS", ids }); setSelected([]); toast.push("success", "Order deleted."); };
  return (
    <CrudShell title="Orders Management" actions={<BulkActions selected={selected} onStatus={(status) => { dispatch({ type: "UPDATE_ORDERS", ids: selected, patch: { status: status as OrderStatus } }); setSelected([]); toast.push("success", "Orders updated."); }} statusOptions={statuses} onDelete={() => setConfirm(selected)} />}>
      <div className="filters">
        <input className="input" placeholder="Search order or customer" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="all">All Statuses</option>{statuses.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select>
        <select className="input" value={filters.range} onChange={(e) => setFilters({ ...filters, range: e.target.value })}><option value="all">All Dates</option><option value="today">Today</option><option value="7">Last 7 Days</option><option value="30">Last 30 Days</option></select>
        <select className="input" value={filters.payment} onChange={(e) => setFilters({ ...filters, payment: e.target.value })}><option value="all">All Payments</option>{paymentMethods.map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}</select>
        <input className="input" placeholder="Min EGP" type="number" value={filters.min} onChange={(e) => setFilters({ ...filters, min: e.target.value })} />
        <input className="input" placeholder="Max EGP" type="number" value={filters.max} onChange={(e) => setFilters({ ...filters, max: e.target.value })} />
      </div>
      <DataTable><thead><tr><th><input type="checkbox" checked={selected.length === table.current.length && table.current.length > 0} onChange={(e) => setSelected(e.target.checked ? table.current.map((o) => o.id) : [])} /></th><SortTh label="Order ID" sortKey="id" table={table} /><SortTh label="Customer" sortKey="customerName" table={table} /><SortTh label="Date" sortKey="createdAt" table={table} /><th>Items</th><SortTh label="Total" sortKey="total" table={table} /><SortTh label="Payment" sortKey="paymentMethod" table={table} /><th>Status</th><th>Actions</th></tr></thead><tbody>{table.current.map((o) => <tr key={o.id}><td><input type="checkbox" checked={selected.includes(o.id)} onChange={(e) => setSelected((s) => e.target.checked ? [...s, o.id] : s.filter((id) => id !== o.id))} /></td><td>{o.id}</td><td>{o.customerName}</td><td>{dateText(o.createdAt)}</td><td>{o.items.length}</td><td>{money(o.total)}</td><td>{titleCase(o.paymentMethod)}</td><td><select className="mini-select" value={o.status} onChange={(e) => { dispatch({ type: "UPDATE_ORDERS", ids: [o.id], patch: { status: e.target.value as OrderStatus } }); toast.push("success", "Order status updated."); }}>{statuses.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></td><td className="actions"><button className="icon-btn" onClick={() => setModal(o)}><Eye size={16} /></button><button className="icon-btn danger" onClick={() => setConfirm([o.id])}><Trash2 size={16} /></button></td></tr>)}</tbody></DataTable>
      {!rows.length && <EmptyState label="No orders match these filters." />}
      <Pagination {...table} />
      {modal && <OrderDetailModal order={modal} onClose={() => setModal(null)} />}
      {confirm && <ConfirmModal message="This will permanently delete the selected order records." onCancel={() => setConfirm(null)} onConfirm={() => { deleteOrders(confirm); setConfirm(null); }} />}
    </CrudShell>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [status, setStatus] = useState(order.status);
  const save = () => { dispatch({ type: "UPDATE_ORDERS", ids: [order.id], patch: { status } }); toast.push("success", "Order status updated."); onClose(); };
  const print = () => window.print();
  return (
    <Modal title={`Order ${order.id}`} onClose={onClose} wide>
      <div className="print-invoice grid gap-6 lg:grid-cols-2">
        <div className="space-y-3"><h3 className="section-title">Order Info</h3><Info label="Date" value={dateText(order.createdAt)} /><label className="block text-sm text-stay-muted">Status<select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>{statuses.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></label><Info label="Payment" value={titleCase(order.paymentMethod)} /><Info label="Subtotal" value={money(order.subtotal)} /><Info label="Shipping" value={money(order.shippingCost)} /><Info label="Total" value={money(order.total)} /></div>
        <div className="space-y-3"><h3 className="section-title">Customer</h3><Info label="Name" value={order.customerName} /><Info label="Email" value={order.customerEmail} /><Info label="Phone" value={order.customerPhone} /><Info label="Address" value={order.shippingAddress} /></div>
      </div>
      <div className="mt-6"><DataTable><thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.productId}><td>{item.productName}</td><td>{item.quantity}</td><td>{money(item.unitPrice)}</td><td>{money(item.total)}</td></tr>)}</tbody></DataTable></div>
      <div className="mt-6 flex justify-end gap-3"><button className="btn-secondary" onClick={print}><FileText size={16} /> Print Invoice</button><button className="btn-primary" onClick={save}>Save Status</button></div>
    </Modal>
  );
}

function ProductsPage() {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const [filters, setFilters] = useState({ q: "", category: "all", status: "all", stock: "all" });
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [confirm, setConfirm] = useState<string[] | null>(null);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setEditing("new");
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const rows = db.products.filter((p) => (!filters.q || `${p.name} ${p.sku}`.toLowerCase().includes(filters.q.toLowerCase())) && (filters.category === "all" || p.category === filters.category) && (filters.status === "all" || p.status === filters.status) && (filters.stock === "all" || (filters.stock === "low" ? p.stock < p.lowStockThreshold && p.stock > 0 : filters.stock === "out" ? p.stock === 0 : p.stock > 0)));
  const table = useTable(rows, 20);
  const deleteProducts = (ids: string[]) => { dispatch({ type: "DELETE_PRODUCTS", ids }); setSelected([]); toast.push("success", "Products deleted."); };
  return (
    <CrudShell title="Products Management" actions={<><button className="btn-primary" onClick={() => setEditing("new")}><Plus size={16} /> Add Product</button><BulkActions selected={selected} onStatus={(status) => { dispatch({ type: "UPDATE_PRODUCTS", ids: selected, patch: { status: status as ProductStatus } }); setSelected([]); toast.push("success", "Products updated."); }} statusOptions={productStatuses} onDelete={() => setConfirm(selected)} /></>}>
      <div className="filters"><input className="input" placeholder="Search name or SKU" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} /><select className="input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="all">All Categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select><select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="all">All Statuses</option>{productStatuses.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select><select className="input" value={filters.stock} onChange={(e) => setFilters({ ...filters, stock: e.target.value })}><option value="all">All Stock</option><option value="in">In Stock</option><option value="low">Low Stock</option><option value="out">Out of Stock</option></select></div>
      <DataTable><thead><tr><th><input type="checkbox" checked={selected.length === table.current.length && table.current.length > 0} onChange={(e) => setSelected(e.target.checked ? table.current.map((p) => p.id) : [])} /></th><th>Image</th><SortTh label="Product" sortKey="name" table={table} /><SortTh label="SKU" sortKey="sku" table={table} /><SortTh label="Category" sortKey="category" table={table} /><SortTh label="Price" sortKey="price" table={table} /><SortTh label="Stock" sortKey="stock" table={table} /><th>Status</th><th>Actions</th></tr></thead><tbody>{table.current.map((p) => <tr key={p.id}><td><input type="checkbox" checked={selected.includes(p.id)} onChange={(e) => setSelected((s) => e.target.checked ? [...s, p.id] : s.filter((id) => id !== p.id))} /></td><td><ProductThumb product={p} /></td><td>{p.name}</td><td>{p.sku}</td><td>{p.category}</td><td>{money(p.price)}</td><td className={p.stock < p.lowStockThreshold ? "text-red-400" : p.stock <= 20 ? "text-yellow-300" : "text-green-400"}>{p.stock}</td><td><select className="mini-select" value={p.status} onChange={(e) => { dispatch({ type: "UPDATE_PRODUCTS", ids: [p.id], patch: { status: e.target.value as ProductStatus } }); toast.push("success", "Product status updated."); }}>{productStatuses.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></td><td className="actions"><button className="icon-btn" onClick={() => setEditing(p)}><Edit3 size={16} /></button><button className="icon-btn" onClick={() => { const copy = { ...p, id: uid("prd"), sku: `${p.sku}-COPY`, name: `${p.name} - COPY`, createdAt: nowIso(), updatedAt: nowIso() }; dispatch({ type: "UPSERT_PRODUCT", payload: copy }); toast.push("success", "Product duplicated."); }}><Package size={16} /></button><button className="icon-btn danger" onClick={() => setConfirm([p.id])}><Trash2 size={16} /></button></td></tr>)}</tbody></DataTable>
      {!rows.length && <EmptyState label="No products match these filters." action={<button className="btn-primary" onClick={() => setEditing("new")}>Create your first product</button>} />}
      <Pagination {...table} />
      {editing && <ProductModal product={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      {confirm && <ConfirmModal message="This will permanently delete the selected products." onCancel={() => setConfirm(null)} onConfirm={() => { deleteProducts(confirm); setConfirm(null); }} />}
    </CrudShell>
  );
}

function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Product>(product ?? { id: uid("prd"), name: "", sku: `SF-${Math.floor(1000 + Math.random() * 9000)}`, category: "Whey Protein", description: "", price: 0, compareAtPrice: undefined, costPerItem: undefined, stock: 0, lowStockThreshold: 10, status: "active", flavor: [], weight: "1kg", salesCount: 0, createdAt: nowIso(), updatedAt: nowIso() });
  const save = () => {
    if (!form.name.trim() || !form.sku.trim() || form.price <= 0 || form.stock < 0) return toast.push("error", "Name, SKU, price > 0, and stock >= 0 are required.");
    setSaving(true);
    setTimeout(() => { dispatch({ type: "UPSERT_PRODUCT", payload: { ...form, updatedAt: nowIso() } }); toast.push("success", product ? "Product updated." : "Product created."); setSaving(false); onClose(); }, 300);
  };
  const set = <K extends keyof Product>(key: K, value: Product[K]) => setForm((f) => ({ ...f, [key]: value }));
  const upload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("image", String(reader.result));
    reader.readAsDataURL(file);
  };
  return (
    <Modal title={product ? "Edit Product" : "Add Product"} onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Product Name" value={form.name} onChange={(v) => set("name", v)} required />
        <label className="field">SKU<div className="flex gap-2"><input className="input" value={form.sku} onChange={(e) => set("sku", e.target.value)} /><button className="btn-secondary" onClick={() => set("sku", `SF-${Math.floor(1000 + Math.random() * 9000)}`)}>Auto</button></div></label>
        <label className="field">Category<select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field">Status<select className="input" value={form.status} onChange={(e) => set("status", e.target.value as ProductStatus)}>{productStatuses.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></label>
        <Field label="Price (EGP)" type="number" value={form.price} onChange={(v) => set("price", Number(v))} required />
        <Field label="Compare-at Price" type="number" value={form.compareAtPrice ?? ""} onChange={(v) => set("compareAtPrice", v ? Number(v) : undefined)} />
        <Field label="Cost per Item" type="number" value={form.costPerItem ?? ""} onChange={(v) => set("costPerItem", v ? Number(v) : undefined)} />
        <Field label="Stock Quantity" type="number" value={form.stock} onChange={(v) => set("stock", Number(v))} required />
        <Field label="Low Stock Threshold" type="number" value={form.lowStockThreshold} onChange={(v) => set("lowStockThreshold", Number(v))} />
        <Field label="Weight" value={form.weight} onChange={(v) => set("weight", v)} />
        <Field label="Flavor / Variant (comma separated)" value={form.flavor.join(", ")} onChange={(v) => set("flavor", v.split(",").map((x) => x.trim()).filter(Boolean))} />
        <label className="field">Image Upload<input className="input" type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} /></label>
        <label className="field md:col-span-2">Description<textarea className="input min-h-28" value={form.description} onChange={(e) => set("description", e.target.value)} /></label>
      </div>
      {form.image && <img src={form.image} alt="Product preview" className="mt-4 h-32 rounded object-cover" />}
      <div className="mt-6 flex justify-end gap-3"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Product"}</button></div>
    </Modal>
  );
}

function CustomersPage() {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [confirm, setConfirm] = useState<Customer | null>(null);
  const rows = db.customers.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase()));
  const table = useTable(rows, 20);
  return (
    <CrudShell title="Customers" actions={null}>
      <div className="filters"><input className="input" placeholder="Search name, email, or phone" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <DataTable><thead><tr><SortTh label="Customer ID" sortKey="id" table={table} /><SortTh label="Name" sortKey="name" table={table} /><SortTh label="Email" sortKey="email" table={table} /><th>Phone</th><SortTh label="Orders" sortKey="totalOrders" table={table} /><SortTh label="Total Spent" sortKey="totalSpent" table={table} /><SortTh label="Join Date" sortKey="joinDate" table={table} /><th>Actions</th></tr></thead><tbody>{table.current.map((c) => <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.totalOrders}</td><td>{money(c.totalSpent)}</td><td>{dateText(c.joinDate)}</td><td className="actions"><button className="icon-btn" onClick={() => setEditing(c)}><Eye size={16} /></button><button className="icon-btn danger" onClick={() => setConfirm(c)}><Trash2 size={16} /></button></td></tr>)}</tbody></DataTable>
      {!rows.length && <EmptyState label="No customers match this search." />}
      <Pagination {...table} />
      {editing && <CustomerModal customer={editing} onClose={() => setEditing(null)} />}
      {confirm && <ConfirmModal message={`Delete ${confirm.name}?`} onCancel={() => setConfirm(null)} onConfirm={() => { dispatch({ type: "DELETE_CUSTOMER", id: confirm.id }); toast.push("success", "Customer deleted."); setConfirm(null); }} />}
    </CrudShell>
  );
}

function CustomerModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(customer);
  const orders = db.orders.filter((o) => o.customerId === customer.id);
  const save = () => { dispatch({ type: "UPSERT_CUSTOMER", payload: form }); toast.push("success", "Customer profile saved."); onClose(); };
  return (
    <Modal title={customer.name} onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-2"><Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} /><Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} /><Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /><Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} /><label className="field md:col-span-2">Notes<textarea className="input min-h-28" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label></div>
      <div className="mt-6 grid gap-4 md:grid-cols-3"><div className="card"><p className="text-stay-muted">Total Spent</p><b>{money(orders.reduce((s, o) => s + o.total, 0))}</b></div><div className="card"><p className="text-stay-muted">Average Order</p><b>{money(orders.reduce((s, o) => s + o.total, 0) / Math.max(1, orders.length))}</b></div><div className="card"><p className="text-stay-muted">Customer Since</p><b>{dateText(customer.joinDate)}</b></div></div>
      <h3 className="section-title mt-6">Order History</h3><DataTable><tbody>{orders.map((o) => <tr key={o.id}><td>{o.id}</td><td>{dateText(o.createdAt)}</td><td>{money(o.total)}</td><td><StatusBadge status={o.status} /></td></tr>)}</tbody></DataTable>
      <div className="mt-6 flex justify-end"><button className="btn-primary" onClick={save}>Save Customer</button></div>
    </Modal>
  );
}

function AnalyticsPage() {
  const { db } = useStore();
  const [range, setRange] = useState(30);
  const [compare, setCompare] = useState(false);
  const [category, setCategory] = useState("all");
  const revenue = dailyRevenue(db.orders, range).map((d, i) => ({ ...d, previous: compare ? dailyRevenue(db.orders.map((o) => ({ ...o, createdAt: daysAgo((range * 2) - i) })), range)[i]?.revenue ?? 0 : undefined }));
  const products = db.products.filter((p) => category === "all" || p.category === category);
  const topRevenue = [...products].sort((a, b) => b.salesCount * b.price - a.salesCount * a.price).slice(0, 10).map((p) => ({ name: p.sku, revenue: p.salesCount * p.price }));
  const topUnits = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 10).map((p) => ({ name: p.sku, units: p.salesCount }));
  const orderStatus = statuses.map((s) => ({ name: titleCase(s), value: db.orders.filter((o) => o.status === s).length }));
  const payments = paymentMethods.map((p) => ({ name: titleCase(p), count: db.orders.filter((o) => o.paymentMethod === p).length }));
  const newCustomers = Array.from({ length: range }, (_, i) => { const day = new Date(Date.now() - (range - 1 - i) * 86400000).toISOString().slice(0, 10); return { day: day.slice(5), customers: db.customers.filter((c) => c.joinDate.slice(0, 10) === day).length }; });
  const topCustomers = [...db.customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">{[7, 30, 90].map((d) => <button className={range === d ? "btn-primary" : "btn-secondary"} onClick={() => setRange(d)} key={d}>{d}D</button>)}<button className={compare ? "btn-primary" : "btn-secondary"} onClick={() => setCompare(!compare)}>Compare Previous</button><select className="input max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All Categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
      <ChartCard title="Revenue Analytics"><ResponsiveContainer><LineChart data={revenue}><CartesianGrid stroke="#333" /><XAxis dataKey="day" stroke="#A0A0A0" /><YAxis stroke="#A0A0A0" /><Tooltip formatter={(v) => money(Number(v))} contentStyle={{ background: "#1A1A1A", border: "1px solid #333" }} /><Line dataKey="revenue" stroke={red} strokeWidth={3} /><Line dataKey="previous" stroke="#22C55E" strokeWidth={2} /></LineChart></ResponsiveContainer></ChartCard>
      <div className="grid gap-6 xl:grid-cols-2"><ChartCard title="Top Products by Revenue"><ResponsiveContainer><BarChart data={topRevenue}><CartesianGrid stroke="#333" /><XAxis dataKey="name" stroke="#A0A0A0" /><YAxis stroke="#A0A0A0" /><Tooltip formatter={(v) => money(Number(v))} contentStyle={{ background: "#1A1A1A", border: "1px solid #333" }} /><Bar dataKey="revenue" fill={red} /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Top Products by Units"><ResponsiveContainer><BarChart data={topUnits}><CartesianGrid stroke="#333" /><XAxis dataKey="name" stroke="#A0A0A0" /><YAxis stroke="#A0A0A0" /><Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #333" }} /><Bar dataKey="units" fill="#22C55E" /></BarChart></ResponsiveContainer></ChartCard></div>
      <div className="grid gap-6 xl:grid-cols-3"><ChartCard title="Order Status"><ResponsiveContainer><PieChart><Pie data={orderStatus} dataKey="value" nameKey="name">{orderStatus.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}</Pie><Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #333" }} /></PieChart></ResponsiveContainer></ChartCard><ChartCard title="Payment Methods"><ResponsiveContainer><BarChart data={payments}><XAxis dataKey="name" stroke="#A0A0A0" /><YAxis stroke="#A0A0A0" /><Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #333" }} /><Bar dataKey="count" fill="#EAB308" /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="New Customers"><ResponsiveContainer><LineChart data={newCustomers}><XAxis dataKey="day" stroke="#A0A0A0" /><YAxis stroke="#A0A0A0" /><Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #333" }} /><Line dataKey="customers" stroke="#38BDF8" /></LineChart></ResponsiveContainer></ChartCard></div>
      <section className="card"><h2 className="section-title">Top Customers</h2><DataTable><tbody>{topCustomers.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{c.totalOrders} orders</td><td>{money(c.totalSpent)}</td></tr>)}</tbody></DataTable></section>
    </div>
  );
}

function InventoryPage() {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const location = useLocation();
  const [lowOnly, setLowOnly] = useState(new URLSearchParams(location.search).get("filter") === "low");
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [history, setHistory] = useState<Product | null>(null);
  const rows = db.products.filter((p) => !lowOnly || p.stock < p.lowStockThreshold);
  const table = useTable(rows, 20);
  const reserved = (id: string) => db.orders.filter((o) => o.status === "pending").flatMap((o) => o.items).filter((i) => i.productId === id).reduce((s, i) => s + i.quantity, 0);
  const exportCsv = () => {
    const csv = ["Product,SKU,Current Stock,Reserved,Available,Threshold", ...rows.map((p) => `"${p.name}",${p.sku},${p.stock},${reserved(p.id)},${p.stock - reserved(p.id)},${p.lowStockThreshold}`)].join("\n");
    download("stay-fit-inventory.csv", csv, "text/csv");
    toast.push("success", "Inventory CSV exported.");
  };
  return (
    <CrudShell title="Inventory" actions={<button className="btn-secondary" onClick={exportCsv}><Download size={16} /> Export CSV</button>}>
      <div className="mb-4 rounded border border-stay-red bg-stay-red/10 p-4"><b>{db.products.filter((p) => p.stock < p.lowStockThreshold).length} low stock items</b><button className="ml-4 text-stay-red" onClick={() => setLowOnly(true)}>View All</button></div>
      <label className="mb-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Low stock only</label>
      <DataTable><thead><tr><SortTh label="Product" sortKey="name" table={table} /><th>SKU</th><SortTh label="Current Stock" sortKey="stock" table={table} /><th>Reserved</th><th>Available</th><th>Threshold</th><th>Last Restocked</th><th>Actions</th></tr></thead><tbody>{table.current.map((p) => <tr key={p.id}><td>{p.name}</td><td>{p.sku}</td><td>{p.stock}</td><td>{reserved(p.id)}</td><td>{p.stock - reserved(p.id)}</td><td><input className="mini-input" type="number" value={p.lowStockThreshold} onChange={(e) => dispatch({ type: "UPDATE_PRODUCTS", ids: [p.id], patch: { lowStockThreshold: Number(e.target.value) } })} /></td><td>{dateText(p.updatedAt)}</td><td className="actions"><button className="btn-secondary" onClick={() => setAdjusting(p)}>Adjust</button><button className="btn-secondary" onClick={() => { dispatch({ type: "ADJUST_STOCK", payload: { id: uid("adj"), productId: p.id, quantity: 50, reason: "Quick restock", createdAt: nowIso() } }); toast.push("success", "Added 50 units."); }}>Restock</button><button className="btn-secondary" onClick={() => setHistory(p)}>History</button></td></tr>)}</tbody></DataTable>
      <Pagination {...table} />
      <ChartCard title="Stock Levels"><ResponsiveContainer><BarChart data={rows.slice(0, 20).map((p) => ({ name: p.sku, stock: p.stock }))} layout="vertical"><XAxis type="number" stroke="#A0A0A0" /><YAxis dataKey="name" type="category" stroke="#A0A0A0" width={90} /><Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid #333" }} /><Bar dataKey="stock" fill={red} /></BarChart></ResponsiveContainer></ChartCard>
      {adjusting && <StockModal product={adjusting} onClose={() => setAdjusting(null)} />}
      {history && <Modal title="Stock History" onClose={() => setHistory(null)}><DataTable><tbody>{db.stockAdjustments.filter((a) => a.productId === history.id).map((a) => <tr key={a.id}><td>{dateText(a.createdAt)}</td><td>{a.quantity > 0 ? `+${a.quantity}` : a.quantity}</td><td>{a.reason}</td></tr>)}</tbody></DataTable>{!db.stockAdjustments.some((a) => a.productId === history.id) && <EmptyState label="No stock adjustments yet." />}</Modal>}
    </CrudShell>
  );
}

function StockModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const save = () => {
    if (!quantity || !reason.trim()) return toast.push("error", "Quantity and reason are required.");
    dispatch({ type: "ADJUST_STOCK", payload: { id: uid("adj"), productId: product.id, quantity, reason, createdAt: nowIso() } });
    toast.push("success", "Stock adjusted.");
    onClose();
  };
  return <Modal title={`Adjust ${product.sku}`} onClose={onClose}><Field label="+/- Quantity" type="number" value={quantity} onChange={(v) => setQuantity(Number(v))} /><Field label="Reason" value={reason} onChange={setReason} /><div className="mt-6 flex justify-end"><button className="btn-primary" onClick={save}>Save Adjustment</button></div></Modal>;
}

function SettingsPage() {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(db.settings);
  const [confirm, setConfirm] = useState<"reset" | "clear" | null>(null);
  const save = () => { dispatch({ type: "SAVE_SETTINGS", payload: form }); toast.push("success", "Settings saved."); };
  const exportJson = () => { download("stay-fit-backup.json", JSON.stringify(db, null, 2), "application/json"); toast.push("success", "Backup exported."); };
  const importJson = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { dispatch({ type: "SET_DB", payload: JSON.parse(String(reader.result)) }); toast.push("success", "Backup imported."); }
      catch { toast.push("error", "Invalid backup file."); }
    };
    reader.readAsText(file);
  };
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="card"><h2 className="section-title">Store Settings</h2><div className="space-y-4"><Field label="Store Name" value={form.storeName} onChange={(v) => setForm({ ...form, storeName: v })} /><Field label="Currency" value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} /><Field label="Contact Email" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} /><Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></div></section>
      <section className="card"><h2 className="section-title">Admin Profile</h2><div className="space-y-4"><Field label="Admin Name" value={form.adminName} onChange={(v) => setForm({ ...form, adminName: v })} /><Field label="Admin Email" value={form.adminEmail} onChange={(v) => setForm({ ...form, adminEmail: v })} /><Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} /></div></section>
      <section className="card xl:col-span-2"><h2 className="section-title">Data Management</h2><div className="flex flex-wrap gap-3"><button className="btn-primary" onClick={save}>Save Settings</button><button className="btn-secondary" onClick={() => setConfirm("reset")}>Reset Demo Data</button><button className="btn-danger" onClick={() => setConfirm("clear")}>Clear All Data</button><button className="btn-secondary" onClick={exportJson}><Download size={16} /> Export All Data</button><label className="btn-secondary cursor-pointer"><Upload size={16} /> Import Data<input className="hidden" type="file" accept="application/json" onChange={(e) => importJson(e.target.files?.[0])} /></label></div></section>
      {confirm && <ConfirmModal message={confirm === "reset" ? "This will replace all current records with fresh demo data." : "This will wipe all STAY FIT admin data from localStorage."} onCancel={() => setConfirm(null)} onConfirm={() => { const next = confirm === "reset" ? generateDemoData() : { ...generateDemoData(), products: [], orders: [], customers: [], stockAdjustments: [], notifications: [] }; dispatch({ type: "SET_DB", payload: next }); toast.push("warning", confirm === "reset" ? "Demo data regenerated." : "All data cleared."); setConfirm(null); }} />}
    </div>
  );
}

function CrudShell({ title, actions, children }: { title: string; actions: React.ReactNode; children: React.ReactNode }) {
  return <section className="card"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="section-title">{title}</h2><div className="flex flex-wrap gap-2">{actions}</div></div>{children}</section>;
}

function BulkActions({ selected, onStatus, statusOptions, onDelete }: { selected: string[]; onStatus: (status: string) => void; statusOptions: string[]; onDelete: () => void }) {
  if (!selected.length) return null;
  return <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-stay-muted">{selected.length} selected</span><select className="input w-44" onChange={(e) => e.target.value && onStatus(e.target.value)} defaultValue=""><option value="">Bulk status</option>{statusOptions.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select><button className="btn-danger" onClick={onDelete}>Delete Selected</button></div>;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="card"><h2 className="section-title mb-4">{title}</h2><div className="h-80">{children}</div></section>;
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="field">{label}{required ? " *" : ""}<input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <p className="flex justify-between gap-4 border-b border-stay-border py-2 text-sm"><span className="text-stay-muted">{label}</span><b className="text-right">{value}</b></p>;
}

function EmptyState({ label, action }: { label: string; action?: React.ReactNode }) {
  return <div className="my-8 rounded border border-dashed border-stay-border p-8 text-center"><div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-stay-red/10 text-stay-red"><Package /></div><p className="text-stay-muted">{label}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

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
