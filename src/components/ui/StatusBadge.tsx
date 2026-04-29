import React, { useMemo } from "react";
import { titleCase } from "../../utils/helpers";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = React.memo(function StatusBadge({ status }: StatusBadgeProps) {
  const colors = useMemo(() => ({
    pending: "border-yellow-500/50 bg-yellow-500/15 text-yellow-300",
    processing: "border-sky-500/50 bg-sky-500/15 text-sky-300",
    shipped: "border-violet-500/50 bg-violet-500/15 text-violet-300",
    delivered: "border-green-500/50 bg-green-500/15 text-green-300",
    cancelled: "border-red-500/50 bg-red-500/15 text-red-300",
    refunded: "border-zinc-500/50 bg-zinc-500/15 text-zinc-300",
    active: "border-green-500/50 bg-green-500/15 text-green-300",
    draft: "border-zinc-500/50 bg-zinc-500/15 text-zinc-300",
    archived: "border-red-500/50 bg-red-500/15 text-red-300",
  }), []);
  
  return (
    <span className={`inline-flex rounded border px-2 py-1 text-xs font-bold uppercase ${
      colors[status as keyof typeof colors] ?? "border-stay-border text-stay-muted"
    }`}>
      {titleCase(status)}
    </span>
  );
});
