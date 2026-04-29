import { useMemo, useState, useCallback } from "react";
import { TableState } from "../types";

export function useTable<T>(rows: T[], pageSize = 20): TableState<T> {
  const [sort, setSort] = useState<{ key: keyof T; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  
  const sorted = useMemo(() => {
    const copy = [...rows];
    if (sort) {
      copy.sort((a, b) => 
        String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), undefined, { numeric: true }) * 
        (sort.dir === "asc" ? 1 : -1)
      );
    }
    return copy;
  }, [rows, sort]);
  
  const pages = useMemo(() => Math.max(1, Math.ceil(sorted.length / pageSize)), [sorted.length, pageSize]);
  const current = useMemo(() => 
    sorted.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize), 
    [sorted, page, pages, pageSize]
  );
  
  const toggleSort = useCallback((key: keyof T) => 
    setSort((s) => 
      s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    ), []
  );
  
  return { 
    current, 
    pages, 
    page: Math.min(page, pages), 
    setPage, 
    toggleSort, 
    sort 
  };
}
