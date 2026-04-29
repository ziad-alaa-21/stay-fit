import React from "react";

export function Logo() {
  return (
    <svg 
      className="h-11 w-11 shrink-0 drop-shadow-[0_0_12px_rgba(230,57,70,0.6)]" 
      viewBox="0 0 120 120" 
      aria-label="STAY FIT logo"
    >
      <circle cx="60" cy="60" r="54" fill="#0A0A0A" stroke="#E63946" strokeWidth="4" />
      <path d="M67 13 39 64h21l-10 43 35-58H64l3-36Z" fill="#E63946" />
      <text x="60" y="88" textAnchor="middle" fill="#E63946" fontSize="14" fontWeight="800">
        STAY FIT
      </text>
    </svg>
  );
}
