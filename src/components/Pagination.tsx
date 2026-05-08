"use client";

import { PageInfo } from "@/types";

export default function Pagination({ pageInfo, onChange }: { pageInfo: PageInfo; onChange: (p: number) => void }) {
  const { page, totalPages } = pageInfo;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="terminal-btn text-xs disabled:opacity-50"
      >
        &lt; Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`text-xs px-2 py-1 border ${
            p === page
              ? "bg-terminal-green/20 border-terminal-green text-terminal-green"
              : "border-terminal-border text-terminal-muted hover:text-terminal-fg"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="terminal-btn text-xs disabled:opacity-50"
      >
        Next &gt;
      </button>
    </div>
  );
}
