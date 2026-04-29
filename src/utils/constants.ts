import { OrderStatus, PaymentMethod, ProductStatus } from "../types";
import { money, dateText, titleCase, download } from "./helpers";

export const categories = [
  "Whey Protein", 
  "Creatine", 
  "Pre-Workout", 
  "BCAAs", 
  "Mass Gainer", 
  "Sleep Aid", 
  "Vitamins", 
  "Accessories"
];

export const statuses: OrderStatus[] = [
  "pending", 
  "processing", 
  "shipped", 
  "delivered", 
  "cancelled", 
  "refunded"
];

export const productStatuses: ProductStatus[] = [
  "active", 
  "draft", 
  "archived"
];

export const paymentMethods: PaymentMethod[] = [
  "cod", 
  "card", 
  "vodafone_cash"
];

export const dbKey = "stayFitAdminDb";
export const red = "#E63946";
export const chartColors = [
  "#E63946", 
  "#22C55E", 
  "#EAB308", 
  "#8B5CF6", 
  "#38BDF8", 
  "#F97316", 
  "#EC4899"
];

// Re-export helper functions for convenience
export { money, dateText, titleCase, download };
