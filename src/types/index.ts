export type ProductStatus = "active" | "draft" | "archived";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentMethod = "cod" | "card" | "vodafone_cash";
export type ToastKind = "success" | "error" | "warning" | "info";

export interface Product {
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

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
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

export interface Customer {
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

export interface StockAdjustment {
  id: string;
  productId: string;
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  kind: "order" | "stock" | "customer";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  contactEmail: string;
  phone: string;
  adminName: string;
  adminEmail: string;
  password: string;
}

export interface Database {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  stockAdjustments: StockAdjustment[];
  notifications: NotificationItem[];
  settings: StoreSettings;
}

export type Action =
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

export interface TableState<T> {
  current: T[];
  pages: number;
  page: number;
  setPage: (page: number) => void;
  toggleSort: (key: keyof T) => void;
  sort: { key: keyof T; dir: "asc" | "desc" } | null;
}
