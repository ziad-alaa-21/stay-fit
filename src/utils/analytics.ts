import { Order, Product } from "../types";
import { daysAgo } from "./helpers";

export function dailyRevenue(orders: Order[], days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * 86400000);
    const key = date.toISOString().slice(0, 10);
    const revenue = orders
      .filter((o) => o.status === "delivered" && o.createdAt.slice(0, 10) === key)
      .reduce((s, o) => s + o.total, 0);
    return { day: `${date.getMonth() + 1}/${date.getDate()}`, revenue };
  });
}

export function categorySales(products: Product[], orders: Order[]) {
  const map = new Map<string, number>();
  orders.forEach((order) => 
    order.items.forEach((item) => {
      const category = products.find((p) => p.id === item.productId)?.category ?? "Others";
      map.set(category, (map.get(category) ?? 0) + item.quantity);
    })
  );
  return [...map.entries()]
    .map(([category, units]) => ({ category, units }))
    .sort((a, b) => b.units - a.units);
}

export function metricChange(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
