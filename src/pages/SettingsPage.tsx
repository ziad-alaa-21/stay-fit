import React, { useState } from "react";
import { Download, Upload } from "lucide-react";
import { useStore } from "../hooks/useStore";
import { useToast } from "../hooks/useToast";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Field } from "../components/ui/Field";
import { generateDemoData } from "../data/demoData";
import { download } from "../utils/constants";

export function SettingsPage() {
  const { db, dispatch } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(db.settings);
  const [confirm, setConfirm] = useState<"reset" | "clear" | null>(null);
  
  const save = () => { 
    dispatch({ type: "SAVE_SETTINGS", payload: form }); 
    toast.push("success", "Settings saved."); 
  };
  
  const exportJson = () => { 
    download("stay-fit-backup.json", JSON.stringify(db, null, 2), "application/json"); 
    toast.push("success", "Backup exported."); 
  };
  
  const importJson = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { 
        dispatch({ type: "SET_DB", payload: JSON.parse(String(reader.result)) }); 
        toast.push("success", "Backup imported."); 
      } catch { 
        toast.push("error", "Invalid backup file."); 
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="card">
        <h2 className="section-title">Store Settings</h2>
        <div className="space-y-4">
          <Field label="Store Name" value={form.storeName} onChange={(v) => setForm({ ...form, storeName: v })} />
          <Field label="Currency" value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} />
          <Field label="Contact Email" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        </div>
      </section>
      
      <section className="card">
        <h2 className="section-title">Admin Profile</h2>
        <div className="space-y-4">
          <Field label="Admin Name" value={form.adminName} onChange={(v) => setForm({ ...form, adminName: v })} />
          <Field label="Admin Email" value={form.adminEmail} onChange={(v) => setForm({ ...form, adminEmail: v })} />
          <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        </div>
      </section>
      
      <section className="card xl:col-span-2">
        <h2 className="section-title">Data Management</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={save}>Save Settings</button>
          <button className="btn-secondary" onClick={() => setConfirm("reset")}>Reset Demo Data</button>
          <button className="btn-danger" onClick={() => setConfirm("clear")}>Clear All Data</button>
          <button className="btn-secondary" onClick={exportJson}>
            <Download size={16} /> Export All Data
          </button>
          <label className="btn-secondary cursor-pointer">
            <Upload size={16} /> Import Data
            <input 
              className="hidden" 
              type="file" 
              accept="application/json" 
              onChange={(e) => importJson(e.target.files?.[0])} 
            />
          </label>
        </div>
      </section>
      
      {confirm && (
        <ConfirmModal 
          message={
            confirm === "reset" 
              ? "This will replace all current records with fresh demo data." 
              : "This will wipe all STAY FIT admin data from localStorage."
          } 
          onCancel={() => setConfirm(null)} 
          onConfirm={() => { 
            const next = confirm === "reset" 
              ? generateDemoData() 
              : { ...generateDemoData(), products: [], orders: [], customers: [], stockAdjustments: [], notifications: [] }; 
            dispatch({ type: "SET_DB", payload: next }); 
            toast.push("warning", confirm === "reset" ? "Demo data regenerated." : "All data cleared."); 
            setConfirm(null); 
          }} 
        />
      )}
    </div>
  );
}
