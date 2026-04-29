import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { DataTable } from "../ui/DataTable";
import { Field } from "../ui/Field";
import { useStore } from "../../hooks/useStore";
import { useToast } from "../../hooks/useToast";
import { Customer } from "../../types";
import { dateText, money } from "../../utils/constants";

interface CustomerModalProps {
  customer: Customer;
  onClose: () => void;
}

export function CustomerModal({ customer, onClose }: CustomerModalProps) {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(customer);
  const orders = db.orders.filter((o) => o.customerId === customer.id);
  
  const save = () => { 
    dispatch({ type: "UPSERT_CUSTOMER", payload: form }); 
    toast.push("success", "Customer profile saved."); 
    onClose(); 
  };
  
  return (
    <Modal title={customer.name} onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
        <Field label="Email" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />
        <Field label="Phone" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} />
        <Field label="Address" value={form.address} onChange={(v: string) => setForm({ ...form, address: v })} />
        <label className="field md:col-span-2">
          Notes
          <textarea 
            className="input min-h-28" 
            value={form.notes} 
            onChange={(e) => setForm({ ...form, notes: e.target.value })} 
          />
        </label>
      </div>
      
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-stay-muted">Total Spent</p>
          <b>{money(orders.reduce((s, o) => s + o.total, 0))}</b>
        </div>
        <div className="card">
          <p className="text-stay-muted">Average Order</p>
          <b>{money(orders.reduce((s, o) => s + o.total, 0) / Math.max(1, orders.length))}</b>
        </div>
        <div className="card">
          <p className="text-stay-muted">Customer Since</p>
          <b>{dateText(customer.joinDate)}</b>
        </div>
      </div>
      
      <h3 className="section-title mt-6">Order History</h3>
      <DataTable>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{dateText(o.createdAt)}</td>
              <td>{money(o.total)}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      
      <div className="mt-6 flex justify-end">
        <button className="btn-primary" onClick={save}>Save Customer</button>
      </div>
    </Modal>
  );
}
