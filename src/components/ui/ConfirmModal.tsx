import React from "react";
import { Modal } from "./Modal";

interface ConfirmModalProps {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ message, onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <Modal title="Are you sure?" onClose={onCancel}>
      <p className="text-stay-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>Confirm</button>
      </div>
    </Modal>
  );
}
