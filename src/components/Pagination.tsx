"use client";

import { PageInfo } from "@/types";

interface PaginationProps {
  pageInfo: PageInfo;
  onChange: (p: number) => void;
  variant?: "compact" | "full";
}

export default function Pagination({ pageInfo, onChange, variant = "full" }: PaginationProps) {
  const { page, totalPages } = pageInfo;

  if (variant === "compact") {
    return (
      <div className="flex items-center">
        <button
          onClick={() => onChange(1)}
          disabled={page <= 1}
          className="px-2 py-2 text-xs border-r border-black hover:bg-gb-light disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          {"<<"}
        </button>
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-2 py-2 text-xs border-r border-black hover:bg-gb-light disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          {"<"}
        </button>
        <span className="px-3 py-2 text-xs border-r border-black select-none">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-2 py-2 text-xs border-r border-black hover:bg-gb-light disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          {">"}
        </button>
        <button
          onClick={() => onChange(totalPages)}
          disabled={page >= totalPages}
          className="px-2 py-2 text-xs hover:bg-gb-light disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          {">>"}
        </button>
      </div>
    );
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={() => onChange(1)}
        disabled={page <= 1}
        className="px-3 py-2 text-xs border-r border-black hover:bg-gb-light disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        {"<<"}
      </button>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="px-3 py-2 text-xs border-r border-black hover:bg-gb-light disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        {"<"}
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-2 text-xs border-r border-black transition-colors ${
            p === page
              ? "bg-black text-white hover:bg-gray-800"
              : "hover:bg-gb-light"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="px-3 py-2 text-xs border-r border-black hover:bg-gb-light disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        {">"}
      </button>
      <button
        onClick={() => onChange(totalPages)}
        disabled={page >= totalPages}
        className="px-3 py-2 text-xs hover:bg-gb-light disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        {">>"}
      </button>
    </div>
  );
}
