import React from "react";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <section className="card">
      <h2 className="section-title mb-4">{title}</h2>
      <div className="h-80">{children}</div>
    </section>
  );
}
