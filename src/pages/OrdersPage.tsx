import React, { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { useStore } from "../hooks/useStore";
import { useToast } from "../hooks/useToast";
import { useTable } from "../hooks/useTable";
import { DataTable, Pagination, SortTh } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { OrderDetailModal } from "../components/modals/OrderDetailModal";
import { CrudShell } from "../components/layout/CrudShell";
import { BulkActions } from "../components/layout/BulkActions";
import { Order } from "../types";
import { statuses, paymentMethods, dateText, money, titleCase } from "../utils/constants";
import { uid, nowIso } from "../utils/helpers";

export function OrdersPage() {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const [filters, setFilters] = useState({ 
    q: "", 
    status: "all", 
    range: "all", 
    payment: "all", 
    min: "", 
    max: "" 
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<Order | null>(null);
  const [confirm, setConfirm] = useState<string[] | null>(null);
  
  const rows = db.orders.filter((o) => {
    const d = new Date(o.createdAt);
    const rangeOk = 
      filters.range === "all" || 
      (filters.range === "today" && o.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)) || 
      (filters.range === "7" && d >= new Date(Date.now() - 7 * 86400000)) || 
      (filters.range === "30" && d >= new Date(Date.now() - 30 * 86400000));
    
    return (
      (!filters.q || `${o.id} ${o.customerName}`.toLowerCase().includes(filters.q.toLowerCase())) && 
      (filters.status === "all" || o.status === filters.status) && 
      (filters.payment === "all" || o.paymentMethod === filters.payment) && 
      (!filters.min || o.total >= Number(filters.min)) && 
      (!filters.max || o.total <= Number(filters.max)) && 
      rangeOk
    );
  });
  
  const table = useTable(rows, 20);
  
  const deleteOrders = (ids: string[]) => { 
    dispatch({ type: "DELETE_ORDERS", ids }); 
    setSelected([]); 
    toast.push("success", "Order deleted."); 
  };
  
  return (
    <CrudShell 
      title="Orders Management" 
      actions={
        <BulkActions 
          selected={selected} 
          onStatus={(status) => { 
            dispatch({ type: "UPDATE_ORDERS", ids: selected, patch: { status: status as any } }); 
            setSelected([]); 
            toast.push("success", "Orders updated."); 
          }} 
          statusOptions={statuses} 
          onDelete={() => setConfirm(selected)} 
        />
      }
    >
      <div className="filters">
        <input 
          className="input" 
          placeholder="Search order or customer" 
          value={filters.q} 
          onChange={(e) => setFilters({ ...filters, q: e.target.value })} 
        />
        <select 
          className="input" 
          value={filters.status} 
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </select>
        <select 
          className="input" 
          value={filters.range} 
          onChange={(e) => setFilters({ ...filters, range: e.target.value })}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
        <select 
          className="input" 
          value={filters.payment} 
          onChange={(e) => setFilters({ ...filters, payment: e.target.value })}
        >
          <option value="all">All Payments</option>
          {paymentMethods.map((p) => (
            <option key={p} value={p}>{titleCase(p)}</option>
          ))}
        </select>
        <input 
          className="input" 
          placeholder="Min EGP" 
          type="number" 
          value={filters.min} 
          onChange={(e) => setFilters({ ...filters, min: e.target.value })} 
        />
        <input 
          className="input" 
          placeholder="Max EGP" 
          type="number" 
          value={filters.max} 
          onChange={(e) => setFilters({ ...filters, max: e.target.value })} 
        />
      </div>
      
      <DataTable>
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                checked={selected.length === table.current.length && table.current.length > 0} 
                onChange={(e) => setSelected(e.target.checked ? table.current.map((o) => o.id) : [])} 
              />
            </th>
            <SortTh label="Order ID" sortKey="id" table={table} />
            <SortTh label="Customer" sortKey="customerName" table={table} />
            <SortTh label="Date" sortKey="createdAt" table={table} />
            <th>Items</th>
            <SortTh label="Total" sortKey="total" table={table} />
            <SortTh label="Payment" sortKey="paymentMethod" table={table} />
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {table.current.map((o) => (
            <tr key={o.id}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selected.includes(o.id)} 
                  onChange={(e) => setSelected((s) => 
                    e.target.checked ? [...s, o.id] : s.filter((id) => id !== o.id)
                  )} 
                />
              </td>
              <td>{o.id}</td>
              <td>{o.customerName}</td>
              <td>{dateText(o.createdAt)}</td>
              <td>{o.items.length}</td>
              <td>{money(o.total)}</td>
              <td>{titleCase(o.paymentMethod)}</td>
              <td>
                <select 
                  className="mini-select" 
                  value={o.status} 
                  onChange={(e) => { 
                    dispatch({ type: "UPDATE_ORDERS", ids: [o.id], patch: { status: e.target.value as any } }); 
                    toast.push("success", "Order status updated."); 
                  }}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{titleCase(s)}</option>
                  ))}
                </select>
              </td>
              <td className="actions">
                <button className="icon-btn" onClick={() => setModal(o)}>
                  <Eye size={16} />
                </button>
                <button className="icon-btn danger" onClick={() => setConfirm([o.id])}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      
      {!rows.length && <div className="my-8 text-center text-stay-muted">No orders match these filters.</div>}
      <Pagination {...table} />
      
      {modal && <OrderDetailModal order={modal} onClose={() => setModal(null)} />}
      {confirm && (
        <ConfirmModal 
          message="This will permanently delete the selected order records." 
          onCancel={() => setConfirm(null)} 
          onConfirm={() => { deleteOrders(confirm); setConfirm(null); }} 
        />
      )}
    </CrudShell>
  );
}
