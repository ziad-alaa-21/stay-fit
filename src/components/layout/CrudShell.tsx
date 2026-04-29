import React from "react";

interface CrudShellProps {
  title: string;
  actions: React.ReactNode;
  children: React.ReactNode;
}

export function CrudShell({ title, actions, children }: CrudShellProps) {
  return (
    <section className="card">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">{title}</h2>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
      {children}
    </section>
  );
}
