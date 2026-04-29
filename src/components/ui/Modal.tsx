import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}

export function Modal({ title, children, onClose, wide = false }: ModalProps) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <section className={`max-h-[92vh] w-full overflow-auto rounded-lg border border-stay-border bg-stay-card shadow-glow ${
        wide ? "max-w-5xl" : "max-w-2xl"
      } max-sm:h-full max-sm:max-h-full max-sm:rounded-none`}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stay-border bg-stay-card p-5">
          <h2 className="font-display text-2xl uppercase">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
