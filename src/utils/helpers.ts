export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
export const nowIso = () => new Date().toISOString();
export const money = (value: number) => `LE ${Math.round(value).toLocaleString("en-EG")}.00`;
export const dateText = (value: string) => new Date(value).toLocaleDateString("en-GB");
export const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
export const titleCase = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (m: string) => m.toUpperCase());

export const download = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export function dailyRevenue(orders: any[], days: number) {
  const result = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - 1 - i) * 86400000);
    const key = date.toISOString().slice(0, 10);
    const revenue = orders
      .filter((o) => o.status === "delivered" && o.createdAt.slice(0, 10) === key)
      .reduce((s, o) => s + o.total, 0);
    result.push({ day: `${date.getMonth() + 1}/${date.getDate()}`, revenue });
  }
  return result;
}
