import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Field } from "../ui/Field";
import { useStore } from "../../hooks/useStore";
import { useToast } from "../../hooks/useToast";
import { uid, nowIso } from "../../utils/helpers";

interface StockModalProps {
  product: any;
  onClose: () => void;
}

export function StockModal({ product, onClose }: StockModalProps) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  
  const save = () => {
    if (!quantity || !reason.trim()) return toast.push("error", "Quantity and reason are required.");
    dispatch({ type: "ADJUST_STOCK", payload: { id: uid("adj"), productId: product.id, quantity, reason, createdAt: nowIso() } });
    toast.push("success", "Stock adjusted.");
    onClose();
  };
  
  return (
    <Modal title={`Adjust ${product.sku}`} onClose={onClose}>
      <Field label="+/- Quantity" type="number" value={quantity} onChange={(v: string) => setQuantity(Number(v))} />
      <Field label="Reason" value={reason} onChange={(v: string) => setReason(v)} />
      <div className="mt-6 flex justify-end">
        <button className="btn-primary" onClick={save}>Save Adjustment</button>
      </div>
    </Modal>
  );
}
