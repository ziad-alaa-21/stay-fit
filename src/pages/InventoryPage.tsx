import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Download } from "lucide-react";
import { useStore } from "../hooks/useStore";
import { useToast } from "../hooks/useToast";
import { useTable } from "../hooks/useTable";
import { DataTable, Pagination, SortTh } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Modal } from "../components/ui/Modal";
import { Field } from "../components/ui/Field";
import { CrudShell } from "../components/layout/CrudShell";
import { ChartCard } from "../components/layout/ChartCard";
import { StockModal } from "../components/modals/StockModal";
import { dateText, download } from "../utils/constants";
import { uid, nowIso } from "../utils/helpers";

export function InventoryPage() {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const location = useLocation();
  const [lowOnly, setLowOnly] = useState(new URLSearchParams(location.search).get("filter") === "low");
  const [adjusting, setAdjusting] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  
  const rows = db.products.filter((p) => !lowOnly || p.stock < p.lowStockThreshold);
  const table = useTable(rows, 20);
  
  const reserved = (id: string) => 
    db.orders.filter((o) => o.status === "pending")
      .flatMap((o) => o.items)
      .filter((i) => i.productId === id)
      .reduce((s, i) => s + i.quantity, 0);
  
  const exportCsv = () => {
    const csv = [
      "Product,SKU,Current Stock,Reserved,Available,Threshold",
      ...rows.map((p) => 
        `"${p.name}",${p.sku},${p.stock},${reserved(p.id)},${p.stock - reserved(p.id)},${p.lowStockThreshold}`
      )
    ].join("\n");
    download("stay-fit-inventory.csv", csv, "text/csv");
    toast.push("success", "Inventory CSV exported.");
  };
  
  return (
    <CrudShell 
      title="Inventory" 
      actions={<button className="btn-secondary" onClick={exportCsv}><Download size={16} /> Export CSV</button>}
    >
      <div className="mb-4 rounded border border-stay-red bg-stay-red/10 p-4">
        <b>{db.products.filter((p) => p.stock < p.lowStockThreshold).length} low stock items</b>
        <button className="ml-4 text-stay-red" onClick={() => setLowOnly(true)}>View All</button>
      </div>
      
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input 
          type="checkbox" 
          checked={lowOnly} 
          onChange={(e) => setLowOnly(e.target.checked)} 
        /> 
        Low stock only
      </label>
      
      <DataTable>
        <thead>
          <tr>
            <SortTh label="Product" sortKey="name" table={table} />
            <th>SKU</th>
            <SortTh label="Current Stock" sortKey="stock" table={table} />
            <th>Reserved</th>
            <th>Available</th>
            <th>Threshold</th>
            <th>Last Restocked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {table.current.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.stock}</td>
              <td>{reserved(p.id)}</td>
              <td>{p.stock - reserved(p.id)}</td>
              <td>
                <input 
                  className="mini-input" 
                  type="number" 
                  value={p.lowStockThreshold} 
                  onChange={(e) => dispatch({ 
                    type: "UPDATE_PRODUCTS", 
                    ids: [p.id], 
                    patch: { lowStockThreshold: Number(e.target.value) } 
                  })} 
                />
              </td>
              <td>{dateText(p.updatedAt)}</td>
              <td className="actions">
                <button className="btn-secondary" onClick={() => setAdjusting(p)}>Adjust</button>
                <button 
                  className="btn-secondary" 
                  onClick={() => { 
                    dispatch({ 
                      type: "ADJUST_STOCK", 
                      payload: { 
                        id: uid("adj"), 
                        productId: p.id, 
                        quantity: 50, 
                        reason: "Quick restock", 
                        createdAt: nowIso() 
                      } 
                    }); 
                    toast.push("success", "Added 50 units."); 
                  }}
                >
                  Restock
                </button>
                <button className="btn-secondary" onClick={() => setHistory(p)}>History</button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      
      <Pagination {...table} />
      
      <ChartCard title="Stock Levels">
        <div className="flex h-full items-center justify-center text-stay-muted">
          Stock Bar Chart
        </div>
      </ChartCard>
      
      {adjusting && <StockModal product={adjusting} onClose={() => setAdjusting(null)} />}
      {history && (
        <Modal title="Stock History" onClose={() => setHistory(null)}>
          <DataTable>
            <tbody>
              {db.stockAdjustments.filter((a) => a.productId === history.id).map((a) => (
                <tr key={a.id}>
                  <td>{dateText(a.createdAt)}</td>
                  <td>{a.quantity > 0 ? `+${a.quantity}` : a.quantity}</td>
                  <td>{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
          {!db.stockAdjustments.some((a) => a.productId === history.id) && (
            <div className="my-8 text-center text-stay-muted">No stock adjustments yet.</div>
          )}
        </Modal>
      )}
    </CrudShell>
  );
}
