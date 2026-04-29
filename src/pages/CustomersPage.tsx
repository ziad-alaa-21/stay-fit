import React, { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { useStore } from "../hooks/useStore";
import { useToast } from "../hooks/useToast";
import { useTable } from "../hooks/useTable";
import { DataTable, Pagination, SortTh } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { CustomerModal } from "../components/modals/CustomerModal";
import { CrudShell } from "../components/layout/CrudShell";
import { EmptyState } from "../components/ui/Field";
import { Customer } from "../types";
import { dateText, money } from "../utils/constants";

export function CustomersPage() {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [confirm, setConfirm] = useState<Customer | null>(null);
  
  const rows = db.customers.filter((c) => 
    `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase())
  );
  const table = useTable(rows, 20);
  
  return (
    <CrudShell title="Customers" actions={null}>
      <div className="filters">
        <input 
          className="input" 
          placeholder="Search name, email, or phone" 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
        />
      </div>
      
      <DataTable>
        <thead>
          <tr>
            <SortTh label="Customer ID" sortKey="id" table={table} />
            <SortTh label="Name" sortKey="name" table={table} />
            <SortTh label="Email" sortKey="email" table={table} />
            <th>Phone</th>
            <SortTh label="Orders" sortKey="totalOrders" table={table} />
            <SortTh label="Total Spent" sortKey="totalSpent" table={table} />
            <SortTh label="Join Date" sortKey="joinDate" table={table} />
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {table.current.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.totalOrders}</td>
              <td>{money(c.totalSpent)}</td>
              <td>{dateText(c.joinDate)}</td>
              <td className="actions">
                <button className="icon-btn" onClick={() => setEditing(c)}>
                  <Eye size={16} />
                </button>
                <button className="icon-btn danger" onClick={() => setConfirm(c)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      
      {!rows.length && <EmptyState label="No customers match this search." />}
      <Pagination {...table} />
      
      {editing && <CustomerModal customer={editing} onClose={() => setEditing(null)} />}
      {confirm && (
        <ConfirmModal 
          message={`Delete ${confirm.name}?`} 
          onCancel={() => setConfirm(null)} 
          onConfirm={() => { 
            dispatch({ type: "DELETE_CUSTOMER", id: confirm.id }); 
            toast.push("success", "Customer deleted."); 
            setConfirm(null); 
          }} 
        />
      )}
    </CrudShell>
  );
}
