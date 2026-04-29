import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Field } from "../ui/Field";
import { useStore } from "../../hooks/useStore";
import { useToast } from "../../hooks/useToast";
import { Product } from "../../types";
import { categories, productStatuses } from "../../utils/constants";
import { uid, nowIso } from "../../utils/helpers";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Product>(
    product ?? {
      id: uid("prd"),
      name: "",
      sku: `SF-${Math.floor(1000 + Math.random() * 9000)}`,
      category: "Whey Protein",
      description: "",
      price: 0,
      compareAtPrice: undefined,
      costPerItem: undefined,
      stock: 0,
      lowStockThreshold: 10,
      status: "active",
      flavor: [],
      weight: "1kg",
      salesCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
  );
  
  const save = () => {
    if (!form.name.trim() || !form.sku.trim() || form.price <= 0 || form.stock < 0) {
      return toast.push("error", "Name, SKU, price > 0, and stock >= 0 are required.");
    }
    setSaving(true);
    setTimeout(() => { 
      dispatch({ type: "UPSERT_PRODUCT", payload: { ...form, updatedAt: nowIso() } }); 
      toast.push("success", product ? "Product updated." : "Product created."); 
      setSaving(false); 
      onClose(); 
    }, 300);
  };
  
  const set = <K extends keyof Product>(key: K, value: Product[K]) => 
    setForm((f) => ({ ...f, [key]: value }));
  
  const upload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("image", String(reader.result));
    reader.readAsDataURL(file);
  };
  
  return (
    <Modal title={product ? "Edit Product" : "Add Product"} onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Product Name" value={form.name} onChange={(v) => set("name", v)} required />
        <label className="field">
          SKU
          <div className="flex gap-2">
            <input 
              className="input" 
              value={form.sku} 
              onChange={(e) => set("sku", e.target.value)} 
            />
            <button 
              className="btn-secondary" 
              onClick={() => set("sku", `SF-${Math.floor(1000 + Math.random() * 9000)}`)}
            >
              Auto
            </button>
          </div>
        </label>
        <label className="field">
          Category
          <select 
            className="input" 
            value={form.category} 
            onChange={(e) => set("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Status
          <select 
            className="input" 
            value={form.status} 
            onChange={(e) => set("status", e.target.value as any)}
          >
            {productStatuses.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </label>
        <Field label="Price (EGP)" type="number" value={form.price} onChange={(v) => set("price", Number(v))} required />
        <Field label="Compare-at Price" type="number" value={form.compareAtPrice ?? ""} onChange={(v) => set("compareAtPrice", v ? Number(v) : undefined)} />
        <Field label="Cost per Item" type="number" value={form.costPerItem ?? ""} onChange={(v) => set("costPerItem", v ? Number(v) : undefined)} />
        <Field label="Stock Quantity" type="number" value={form.stock} onChange={(v) => set("stock", Number(v))} required />
        <Field label="Low Stock Threshold" type="number" value={form.lowStockThreshold} onChange={(v) => set("lowStockThreshold", Number(v))} />
        <Field label="Weight" value={form.weight} onChange={(v) => set("weight", v)} />
        <Field label="Flavor / Variant (comma separated)" value={form.flavor.join(", ")} onChange={(v) => set("flavor", v.split(",").map((x) => x.trim()).filter(Boolean))} />
        <label className="field">
          Image Upload
          <input 
            className="input" 
            type="file" 
            accept="image/*" 
            onChange={(e) => upload(e.target.files?.[0])} 
          />
        </label>
        <label className="field md:col-span-2">
          Description
          <textarea 
            className="input min-h-28" 
            value={form.description} 
            onChange={(e) => set("description", e.target.value)} 
          />
        </label>
      </div>
      {form.image && (
        <img 
          src={form.image} 
          alt="Product preview" 
          className="mt-4 h-32 rounded object-cover" 
        />
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </Modal>
  );
}
