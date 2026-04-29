import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useStore } from "../hooks/useStore";
import { useTable } from "../hooks/useTable";
import { DataTable, Pagination } from "../components/ui/DataTable";
import { ProductThumb } from "../components/ui/ProductThumb";
import { OrderDetailModal } from "../components/modals/OrderDetailModal";
import { dailyRevenue, categorySales, metricChange } from "../utils/analytics";
import { money, dateText } from "../utils/constants";
import { red, chartColors } from "../utils/constants";
import { Order } from "../types";

export function Dashboard() {
  const { db } = useStore();
  const navigate = useNavigate();
  const [range, setRange] = useState(30);
  const [orderModal, setOrderModal] = useState<Order | null>(null);
  
  const delivered = db.orders.filter((o) => o.status === "delivered");
  const last30 = delivered.filter((o) => new Date(o.createdAt) >= new Date(Date.now() - 30 * 86400000));
  const prev30 = delivered.filter((o) => 
    new Date(o.createdAt) < new Date(Date.now() - 30 * 86400000) && 
    new Date(o.createdAt) >= new Date(Date.now() - 60 * 86400000)
  );
  
  const stats = [
    { 
      label: "Total Revenue", 
      value: money(delivered.reduce((s, o) => s + o.total, 0)), 
      change: metricChange(
        last30.reduce((s, o) => s + o.total, 0), 
        prev30.reduce((s, o) => s + o.total, 0)
      ) 
    },
    { 
      label: "Total Orders", 
      value: db.orders.length.toLocaleString(), 
      change: metricChange(
        db.orders.filter((o) => new Date(o.createdAt) >= new Date(Date.now() - 30 * 86400000)).length,
        db.orders.filter((o) => 
          new Date(o.createdAt) < new Date(Date.now() - 30 * 86400000) && 
          new Date(o.createdAt) >= new Date(Date.now() - 60 * 86400000)
        ).length
      ) 
    },
    { 
      label: "Total Customers", 
      value: db.customers.length.toLocaleString(), 
      change: metricChange(
        db.customers.filter((c) => new Date(c.joinDate) >= new Date(Date.now() - 30 * 86400000)).length,
        db.customers.filter((c) => 
          new Date(c.joinDate) < new Date(Date.now() - 30 * 86400000) && 
          new Date(c.joinDate) >= new Date(Date.now() - 60 * 86400000)
        ).length
      ) 
    },
    { 
      label: "Low Stock Alerts", 
      value: db.products.filter((p) => p.stock < p.lowStockThreshold).length.toLocaleString(), 
      change: 0, 
      onClick: () => navigate("/inventory?filter=low") 
    },
  ];
  
  const revenue = dailyRevenue(db.orders, range);
  const byCategory = categorySales(db.products, db.orders);
  const topProducts = [...db.products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
  const maxSales = topProducts[0]?.salesCount || 1;
  const recent = [...db.orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 10);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <button 
            key={stat.label} 
            onClick={stat.onClick} 
            className="card text-left"
          >
            <p className="text-sm text-stay-muted">{stat.label}</p>
            <p className="mt-2 text-3xl font-black">{stat.value}</p>
            <p className={`mt-3 flex items-center gap-1 text-sm ${
              stat.change >= 0 ? "text-green-400" : "text-red-400"
            }`}>
              {stat.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(stat.change).toFixed(1)}% vs previous 30d
            </p>
          </button>
        ))}
      </div>
      
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="section-title">Revenue</h2>
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <button 
                  key={d} 
                  className={range === d ? "btn-primary" : "btn-secondary"} 
                  onClick={() => setRange(d)}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            {/* Chart component would go here - keeping it simple for now */}
            <div className="flex h-full items-center justify-center text-stay-muted">
              Revenue Chart ({range} days)
            </div>
          </div>
        </section>
        
        <section className="card">
          <h2 className="section-title">Sales by Category</h2>
          <div className="relative h-80">
            {/* Pie chart component would go here */}
            <div className="flex h-full items-center justify-center text-stay-muted">
              Category Chart
            </div>
          </div>
        </section>
      </div>
      
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="mb-4 flex justify-between">
            <h2 className="section-title">Recent Orders</h2>
            <a className="text-sm text-stay-red" href="/orders">View All</a>
          </div>
          <DataTable>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{dateText(o.createdAt)}</td>
                  <td>{money(o.total)}</td>
                  <td>{o.status}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => setOrderModal(o)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </section>
        
        <section className="card">
          <div className="mb-4 flex justify-between">
            <h2 className="section-title">Top Selling Products</h2>
            <a className="text-sm text-stay-red" href="/analytics">View Report</a>
          </div>
          <div className="space-y-4">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-4">
                <ProductThumb product={p} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{p.name}</p>
                  <p className="text-sm text-stay-muted">
                    {p.salesCount} units · {money(p.salesCount * p.price)}
                  </p>
                  <div className="mt-2 h-2 rounded bg-stay-elevated">
                    <div 
                      className="h-full rounded bg-stay-red" 
                      style={{ width: `${(p.salesCount / maxSales) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {orderModal && <OrderDetailModal order={orderModal} onClose={() => setOrderModal(null)} />}
    </div>
  );
}
