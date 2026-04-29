import React, { useEffect, useState } from "react";
import { Plus, Edit3, Package, Trash2 } from "lucide-react";
import { useStore } from "../hooks/useStore";
import { useToast } from "../hooks/useToast";
import { useTable } from "../hooks/useTable";
import { DataTable, Pagination, SortTh } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ProductModal } from "../components/modals/ProductModal";
import { CrudShell } from "../components/layout/CrudShell";
import { BulkActions } from "../components/layout/BulkActions";
import { ProductThumb } from "../components/ui/ProductThumb";
import { EmptyState } from "../components/ui/Field";
import { Product } from "../types";
import { categories, productStatuses, titleCase } from "../utils/constants";
import { uid, nowIso } from "../utils/helpers";

export function ProductsPage() {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const [filters, setFilters] = useState({ 
    q: "", 
    category: "all", 
    status: "all", 
    stock: "all" 
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [confirm, setConfirm] = useState<string[] | null>(null);
  
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setEditing("new");
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  
  const rows = db.products.filter((p) => 
    (!filters.q || `${p.name} ${p.sku}`.toLowerCase().includes(filters.q.toLowerCase())) && 
    (filters.category === "all" || p.category === filters.category) && 
    (filters.status === "all" || p.status === filters.status) && 
    (filters.stock === "all" || 
      (filters.stock === "low" ? p.stock < p.lowStockThreshold && p.stock > 0 : 
       filters.stock === "out" ? p.stock === 0 : 
       p.stock > 0))
  );
  
  const table = useTable(rows, 20);
  
  const deleteProducts = (ids: string[]) => { 
    dispatch({ type: "DELETE_PRODUCTS", ids }); 
    setSelected([]); 
    toast.push("success", "Products deleted."); 
  };
  
  return (
    <CrudShell 
      title="Products Management" 
      actions={
        <>
          <button className="btn-primary" onClick={() => setEditing("new")}>
            <Plus size={16} /> Add Product
          </button>
          <BulkActions 
            selected={selected} 
            onStatus={(status) => { 
              dispatch({ type: "UPDATE_PRODUCTS", ids: selected, patch: { status: status as any } }); 
              setSelected([]); 
              toast.push("success", "Products updated."); 
            }} 
            statusOptions={productStatuses} 
            onDelete={() => setConfirm(selected)} 
          />
        </>
      }
    >
      <div className="filters">
        <input 
          className="input" 
          placeholder="Search name or SKU" 
          value={filters.q} 
          onChange={(e) => setFilters({ ...filters, q: e.target.value })} 
        />
        <select 
          className="input" 
          value={filters.category} 
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select 
          className="input" 
          value={filters.status} 
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All Statuses</option>
          {productStatuses.map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </select>
        <select 
          className="input" 
          value={filters.stock} 
          onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
        >
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>
      
      <DataTable>
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                checked={selected.length === table.current.length && table.current.length > 0} 
                onChange={(e) => setSelected(e.target.checked ? table.current.map((p) => p.id) : [])} 
              />
            </th>
            <th>Image</th>
            <SortTh label="Product" sortKey="name" table={table} />
            <SortTh label="SKU" sortKey="sku" table={table} />
            <SortTh label="Category" sortKey="category" table={table} />
            <SortTh label="Price" sortKey="price" table={table} />
            <SortTh label="Stock" sortKey="stock" table={table} />
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {table.current.map((p) => (
            <tr key={p.id}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selected.includes(p.id)} 
                  onChange={(e) => setSelected((s) => 
                    e.target.checked ? [...s, p.id] : s.filter((id) => id !== p.id)
                  )} 
                />
              </td>
              <td><ProductThumb product={p} /></td>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.category}</td>
              <td>{p.price}</td>
              <td className={p.stock < p.lowStockThreshold ? "text-red-400" : p.stock <= 20 ? "text-yellow-300" : "text-green-400"}>
                {p.stock}
              </td>
              <td>
                <select 
                  className="mini-select" 
                  value={p.status} 
                  onChange={(e) => { 
                    dispatch({ type: "UPDATE_PRODUCTS", ids: [p.id], patch: { status: e.target.value as any } }); 
                    toast.push("success", "Product status updated."); 
                  }}
                >
                  {productStatuses.map((s) => (
                    <option key={s} value={s}>{titleCase(s)}</option>
                  ))}
                </select>
              </td>
              <td className="actions">
                <button className="icon-btn" onClick={() => setEditing(p)}>
                  <Edit3 size={16} />
                </button>
                <button 
                  className="icon-btn" 
                  onClick={() => { 
                    const copy = { 
                      ...p, 
                      id: uid("prd"), 
                      sku: `${p.sku}-COPY`, 
                      name: `${p.name} - COPY`, 
                      createdAt: nowIso(), 
                      updatedAt: nowIso() 
                    }; 
                    dispatch({ type: "UPSERT_PRODUCT", payload: copy }); 
                    toast.push("success", "Product duplicated."); 
                  }}
                >
                  <Package size={16} />
                </button>
                <button className="icon-btn danger" onClick={() => setConfirm([p.id])}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      
      {!rows.length && (
        <EmptyState 
          label="No products match these filters." 
          action={<button className="btn-primary" onClick={() => setEditing("new")}>Create your first product</button>} 
        />
      )}
      <Pagination {...table} />
      
      {editing && <ProductModal product={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      {confirm && (
        <ConfirmModal 
          message="This will permanently delete the selected products." 
          onCancel={() => setConfirm(null)} 
          onConfirm={() => { deleteProducts(confirm); setConfirm(null); }} 
        />
      )}
    </CrudShell>
  );
}
