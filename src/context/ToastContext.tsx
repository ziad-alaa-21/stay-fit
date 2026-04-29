import React, { createContext, useState, useContext } from "react";
import { ToastKind } from "../types";
import { uid } from "../utils/helpers";

const ToastContext = createContext<{ push: (kind: ToastKind, message: string) => void } | null>(null);

export { ToastContext };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: string; kind: ToastKind; message: string }>>([]);
  
  const push = (kind: ToastKind, message: string) => {
    const id = uid("toast");
    setToasts((current) => [...current, { id, kind, message }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4000);
  };
  
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 z-[90] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`rounded border p-4 shadow-glow ${
              toast.kind === "success" 
                ? "border-green-500 bg-green-950" 
                : toast.kind === "error" 
                ? "border-red-500 bg-red-950" 
                : toast.kind === "warning" 
                ? "border-yellow-500 bg-yellow-950" 
                : "border-sky-500 bg-sky-950"
            }`}
          >
            <p className="text-sm font-bold text-white">{toast.kind.charAt(0).toUpperCase() + toast.kind.slice(1)}</p>
            <p className="text-sm text-white/85">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
