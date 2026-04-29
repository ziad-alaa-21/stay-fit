import React, { useState, useMemo } from "react";
import { useStore } from "../hooks/useStore";
import { ChartCard } from "../components/layout/ChartCard";
import { DataTable } from "../components/ui/DataTable";
import { categories, statuses, paymentMethods, titleCase } from "../utils/constants";
import { dailyRevenue, daysAgo } from "../utils/helpers";
import { red, chartColors } from "../utils/constants";

export function AnalyticsPage() {
  const { db } = useStore();
  const [range, setRange] = useState(30);
  const [compare, setCompare] = useState(false);
  const [category, setCategory] = useState("all");
  
  const revenue = useMemo(() => 
    dailyRevenue(db.orders, range).map((d: any, i: number) => ({ 
      ...d, 
      previous: compare ? dailyRevenue(db.orders.map((o) => ({ ...o, createdAt: daysAgo((range * 2) - i) })), range)[i]?.revenue ?? 0 : undefined 
    })), [db.orders, range, compare]
  );
  
  const products = useMemo(() => 
    db.products.filter((p) => category === "all" || p.category === category), [db.products, category]
  );
  
  const topRevenue = useMemo(() => 
    [...products].sort((a, b) => b.salesCount * b.price - a.salesCount * a.price).slice(0, 10).map((p) => ({ 
      name: p.sku, 
      revenue: p.salesCount * p.price 
    })), [products]
  );
  
  const topUnits = useMemo(() => 
    [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 10).map((p) => ({ 
      name: p.sku, 
      units: p.salesCount 
    })), [products]
  );
  
  const orderStatus = useMemo(() => 
    statuses.map((s) => ({ 
      name: titleCase(s), 
      value: db.orders.filter((o) => o.status === s).length 
    })), [db.orders]
  );
  
  const payments = useMemo(() => 
    paymentMethods.map((p) => ({ 
      name: titleCase(p), 
      count: db.orders.filter((o) => o.paymentMethod === p).length 
    })), [db.orders]
  );
  
  const newCustomers = useMemo(() => 
    Array.from({ length: range }, (_, i) => { 
      const day = new Date(Date.now() - (range - 1 - i) * 86400000).toISOString().slice(0, 10); 
      return { 
        day: day.slice(5), 
        customers: db.customers.filter((c) => c.joinDate.slice(0, 10) === day).length 
      }; 
    }), [db.customers, range]
  );
  
  const topCustomers = useMemo(() => 
    [...db.customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10), [db.customers]
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {[7, 30, 90].map((d) => (
          <button 
            className={range === d ? "btn-primary" : "btn-secondary"} 
            onClick={() => setRange(d)} 
            key={d}
          >
            {d}D
          </button>
        ))}
        <button 
          className={compare ? "btn-primary" : "btn-secondary"} 
          onClick={() => setCompare(!compare)}
        >
          Compare Previous
        </button>
        <select 
          className="input max-w-xs" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      
      <ChartCard title="Revenue Analytics">
        <div className="flex h-full items-center justify-center text-stay-muted">
          Revenue Chart ({range} days)
        </div>
      </ChartCard>
      
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Top Products by Revenue">
          <div className="flex h-full items-center justify-center text-stay-muted">
            Revenue Bar Chart
          </div>
        </ChartCard>
        <ChartCard title="Top Products by Units">
          <div className="flex h-full items-center justify-center text-stay-muted">
            Units Bar Chart
          </div>
        </ChartCard>
      </div>
      
      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard title="Order Status">
          <div className="flex h-full items-center justify-center text-stay-muted">
            Status Pie Chart
          </div>
        </ChartCard>
        <ChartCard title="Payment Methods">
          <div className="flex h-full items-center justify-center text-stay-muted">
            Payment Bar Chart
          </div>
        </ChartCard>
        <ChartCard title="New Customers">
          <div className="flex h-full items-center justify-center text-stay-muted">
            Customer Line Chart
          </div>
        </ChartCard>
      </div>
      
      <section className="card">
        <h2 className="section-title">Top Customers</h2>
        <DataTable>
          <tbody>
            {topCustomers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.totalOrders} orders</td>
                <td>{c.totalSpent}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </div>
  );
}
