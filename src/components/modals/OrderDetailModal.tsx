import React, { useState } from "react";
import { FileText } from "lucide-react";
import { Modal } from "../ui/Modal";
import { DataTable } from "../ui/DataTable";
import { Info } from "../ui/Field";
import { useStore } from "../../hooks/useStore";
import { useToast } from "../../hooks/useToast";
import { Order } from "../../types";
import { statuses, dateText, money } from "../../utils/constants";
import { titleCase } from "../../utils/helpers";

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [status, setStatus] = useState(order.status);
  
  const save = () => { 
    dispatch({ type: "UPDATE_ORDERS", ids: [order.id], patch: { status } }); 
    toast.push("success", "Order status updated."); 
    onClose(); 
  };
  
  const print = () => window.print();
  
  return (
    <Modal title={`Order ${order.id}`} onClose={onClose} wide>
      <div className="print-invoice grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="section-title">Order Info</h3>
          <Info label="Date" value={dateText(order.createdAt)} />
          <label className="block text-sm text-stay-muted">
            Status
            <select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              {statuses.map((s) => (
                <option key={s} value={s}>{titleCase(s)}</option>
              ))}
            </select>
          </label>
          <Info label="Payment" value={titleCase(order.paymentMethod)} />
          <Info label="Subtotal" value={money(order.subtotal)} />
          <Info label="Shipping" value={money(order.shippingCost)} />
          <Info label="Total" value={money(order.total)} />
        </div>
        
        <div className="space-y-3">
          <h3 className="section-title">Customer</h3>
          <Info label="Name" value={order.customerName} />
          <Info label="Email" value={order.customerEmail} />
          <Info label="Phone" value={order.customerPhone} />
          <Info label="Address" value={order.shippingAddress} />
        </div>
      </div>
      
      <div className="mt-6">
        <DataTable>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{money(item.unitPrice)}</td>
                <td>{money(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
      
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={print}>
          <FileText size={16} /> Print Invoice
        </button>
        <button className="btn-primary" onClick={save}>Save Status</button>
      </div>
    </Modal>
  );
}
