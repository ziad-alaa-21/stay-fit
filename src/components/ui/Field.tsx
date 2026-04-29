import React from "react";

interface FieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}

export function Field({ label, value, onChange, type = "text", required }: FieldProps) {
  return (
    <label className="field">
      {label}{required ? " *" : ""}
      <input 
        className="input" 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </label>
  );
}

interface InfoProps {
  label: string;
  value: string;
}

export function Info({ label, value }: InfoProps) {
  return (
    <p className="flex justify-between gap-4 border-b border-stay-border py-2 text-sm">
      <span className="text-stay-muted">{label}</span>
      <b className="text-right">{value}</b>
    </p>
  );
}

interface EmptyStateProps {
  label: string;
  action?: React.ReactNode;
}

export function EmptyState({ label, action }: EmptyStateProps) {
  return (
    <div className="my-8 rounded border border-dashed border-stay-border p-8 text-center">
      <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-stay-red/10 text-stay-red">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <p className="text-stay-muted">{label}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
