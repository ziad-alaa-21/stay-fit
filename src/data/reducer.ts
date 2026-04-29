import { Database, Action } from "../types";
import { nowIso } from "../utils/helpers";

export function reducer(state: Database, action: Action): Database {
  switch (action.type) {
    case "SET_DB":
      return action.payload;
    case "UPSERT_PRODUCT": {
      const exists = state.products.some((p) => p.id === action.payload.id);
      return { 
        ...state, 
        products: exists 
          ? state.products.map((p) => (p.id === action.payload.id ? action.payload : p)) 
          : [action.payload, ...state.products] 
      };
    }
    case "DELETE_PRODUCTS":
      return { ...state, products: state.products.filter((p) => !action.ids.includes(p.id)) };
    case "UPDATE_PRODUCTS":
      return { 
        ...state, 
        products: state.products.map((p) => 
          action.ids.includes(p.id) ? { ...p, ...action.patch, updatedAt: nowIso() } : p
        ) 
      };
    case "UPSERT_ORDER": {
      const exists = state.orders.some((o) => o.id === action.payload.id);
      return { 
        ...state, 
        orders: exists 
          ? state.orders.map((o) => (o.id === action.payload.id ? action.payload : o)) 
          : [action.payload, ...state.orders] 
      };
    }
    case "DELETE_ORDERS":
      return { ...state, orders: state.orders.filter((o) => !action.ids.includes(o.id)) };
    case "UPDATE_ORDERS":
      return { 
        ...state, 
        orders: state.orders.map((o) => 
          action.ids.includes(o.id) ? { ...o, ...action.patch, updatedAt: nowIso() } : o
        ) 
      };
    case "UPSERT_CUSTOMER": {
      const exists = state.customers.some((c) => c.id === action.payload.id);
      return { 
        ...state, 
        customers: exists 
          ? state.customers.map((c) => (c.id === action.payload.id ? action.payload : c)) 
          : [action.payload, ...state.customers] 
      };
    }
    case "DELETE_CUSTOMER":
      return { ...state, customers: state.customers.filter((c) => c.id !== action.id) };
    case "ADJUST_STOCK":
      return {
        ...state,
        products: state.products.map((p) => 
          p.id === action.payload.productId 
            ? { ...p, stock: Math.max(0, p.stock + action.payload.quantity), updatedAt: nowIso() } 
            : p
        ),
        stockAdjustments: [action.payload, ...state.stockAdjustments],
      };
    case "MARK_NOTIFICATION":
      return { 
        ...state, 
        notifications: state.notifications.map((n) => 
          !action.id || n.id === action.id ? { ...n, read: true } : n
        ) 
      };
    case "SAVE_SETTINGS":
      return { ...state, settings: action.payload };
    default:
      return state;
  }
}
