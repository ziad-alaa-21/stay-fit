import React from "react";
import { titleCase } from "../../utils/helpers";

interface BulkActionsProps {
  selected: string[];
  onStatus: (status: string) => void;
  statusOptions: string[];
  onDelete: () => void;
}

export function BulkActions({ selected, onStatus, statusOptions, onDelete }: BulkActionsProps) {
  if (!selected.length) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-stay-muted">{selected.length} selected</span>
      <select 
        className="input w-full sm:w-44 min-w-[120px]" 
        onChange={(e) => e.target.value && onStatus(e.target.value)} 
        defaultValue=""
      >
        <option value="">Bulk status</option>
        {statusOptions.map((s) => (
          <option key={s} value={s}>{titleCase(s)}</option>
        ))}
      </select>
      <button className="btn-danger text-xs sm:text-sm px-2 sm:px-4" onClick={onDelete}>
        <span className="hidden sm:inline">Delete Selected</span>
        <span className="sm:hidden">Delete</span>
      </button>
    </div>
  );
}
