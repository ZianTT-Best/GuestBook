"use client";

import { useState, useEffect, useMemo } from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import Pagination from "./Pagination";
import { CommentsResponse, Comment } from "@/types";

type SortMode = "latest" | "oldest" | "likes";

export default function Guestbook() {
  const [data, setData] = useState<CommentsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [sort, setSort] = useState<SortMode>("latest");

  const fetchComments = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?page=${p}&limit=10`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(page);
  }, [page]);

  const sortedComments = useMemo(() => {
    if (!data) return [];
    const arr = [...data.comments];
    if (sort === "oldest") {
      return arr.sort((a, b) => a.createdAt - b.createdAt);
    }
    if (sort === "likes") {
      return arr.sort((a, b) => b.likes - a.likes);
    }
    return arr;
  }, [data, sort]);

  const now = new Date().toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sortBtnClass = (mode: SortMode) =>
    `text-[11px] uppercase tracking-wider cursor-pointer select-none transition-colors ${
      sort === mode ? "text-black font-bold" : "text-gb-muted hover:text-black"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <nav className="border-b border-black flex items-stretch justify-between">
        <div className="flex items-center">
          <div className="px-4 py-3 text-xs uppercase tracking-widest border-r border-black flex items-center gap-2">
            <span>☰</span>
            <span>Messages</span>
          </div>
        </div>
        <div className="px-4 py-3 text-xs uppercase tracking-widest font-bold">
          Ziantt
        </div>
      </nav>

      {/* Sub header */}
      <div className="border-b border-black flex items-stretch justify-between">
        <div className="px-4 py-2 text-xs uppercase tracking-wider">Wall</div>
        <div className="px-4 py-2 text-[11px] text-gb-muted">{now}</div>
      </div>

      {/* Action bar */}
      <div className="border-b border-black flex items-stretch justify-between flex-wrap">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 text-[11px] uppercase tracking-wider border-r border-black bg-black text-white hover:bg-white hover:text-black transition-colors shrink-0"
        >
          + Send New Message
        </button>
        {data && data.pageInfo.totalPages > 1 && (
          <div className="flex items-center border-r border-black">
            <Pagination
              pageInfo={data.pageInfo}
              onChange={setPage}
              variant="compact"
            />
          </div>
        )}
        <div className="flex items-center gap-3 px-4">
          <span className={sortBtnClass("latest")} onClick={() => setSort("latest")}>
            ⇅ Latest
          </span>
          <span className="text-gb-muted">|</span>
          <span className={sortBtnClass("oldest")} onClick={() => setSort("oldest")}>
            Oldest
          </span>
          <span className="text-gb-muted">|</span>
          <span className={sortBtnClass("likes")} onClick={() => setSort("likes")}>
            Likes
          </span>
        </div>
      </div>

      {/* Stats bar */}
      {data && (
        <div className="border-b border-black flex items-center justify-between px-4 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-gb-muted">
            Total: {data.pageInfo.total} // Size: {data.pageInfo.limit}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gb-muted">
            Sort: {sort}
          </span>
        </div>
      )}

      {/* Announcement */}
      {data?.announcement && (
        <div className="border-b border-black px-4 py-3 bg-gb-light">
          <div className="text-[10px] uppercase tracking-wider text-gb-muted mb-1">[System Announcement]</div>
          <div className="text-sm whitespace-pre-wrap">{data.announcement}</div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <CommentForm onSuccess={() => fetchComments(1)} />
      )}

      {/* Comments */}
      <div className="flex-1">
        {loading ? (
          <div className="px-4 py-12 text-center text-gb-muted text-sm animate-pulse">
            Loading packets...
          </div>
        ) : (
          <CommentList comments={sortedComments} />
        )}
      </div>

      {/* Bottom pagination */}
      {data && data.pageInfo.totalPages > 1 && (
        <div className="border-t border-black">
          <Pagination pageInfo={data.pageInfo} onChange={setPage} variant="full" />
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-black flex items-stretch justify-between text-[10px] uppercase tracking-wider">
        <div className="px-4 py-2.5 border-r border-black">
          [ Reply by Email ]
        </div>
        <div className="px-4 py-2.5 text-gb-muted">
          Ziantt Guestbook v1.0 // Pow Protected
        </div>
      </footer>
    </div>
  );
}
