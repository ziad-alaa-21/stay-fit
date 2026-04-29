import React from "react";

interface DataTableProps {
  children: React.ReactNode;
}

export function DataTable({ children }: DataTableProps) {
  return (
    <div className="table-wrap">
      <table className="data-table" role="table" aria-label="Data table">
        {children}
      </table>
    </div>
  );
}

interface SortThProps<T> {
  label: string;
  sortKey: keyof T;
  table: {
    sort: { key: keyof T; dir: "asc" | "desc" } | null;
    toggleSort: (key: keyof T) => void;
  };
}

export function SortTh<T>({ label, sortKey, table }: SortThProps<T>) {
  const isSorted = table.sort?.key === sortKey;
  const sortDirection = isSorted && table.sort ? (table.sort.dir === "asc" ? "ascending" : "descending") : "none";
  
  return (
    <th scope="col">
      <button 
        onClick={() => table.toggleSort(sortKey)}
        aria-label={`Sort by ${label}`}
        aria-sort={sortDirection as "ascending" | "descending" | "none"}
        className="sort-button"
      >
        {label} 
        <span className="ml-1" aria-hidden="true">
          {isSorted && table.sort ? (table.sort.dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

interface PaginationProps {
  page: number;
  pages: number;
  setPage: (n: number) => void;
}

export function Pagination({ page, pages, setPage }: PaginationProps) {
  const pageNumbers = Array.from({ length: Math.min(5, pages) }, (_, i) => 
    Math.max(1, Math.min(pages - 4, page - 2)) + i
  ).filter((p, i, a) => a.indexOf(p) === i);

  return (
    <nav className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm" aria-label="Pagination navigation">
      <p className="text-stay-muted text-center sm:text-left" aria-live="polite">
        Page {page} of {pages}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2" role="group" aria-label="Page navigation">
        <button 
          className="btn-secondary text-xs sm:text-sm px-2 sm:px-4" 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
          aria-label="Go to previous page"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">‹</span>
        </button>
        {pageNumbers.map((p) => (
          <button 
            key={p} 
            className={`${p === page ? "btn-primary" : "btn-secondary"} text-xs sm:text-sm min-w-[2rem] sm:min-w-[3rem]`} 
            onClick={() => setPage(p)}
            aria-label={`Go to page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}
        <button 
          className="btn-secondary text-xs sm:text-sm px-2 sm:px-4" 
          disabled={page === pages} 
          onClick={() => setPage(page + 1)}
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">›</span>
        </button>
      </div>
    </nav>
  );
}
