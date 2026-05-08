"use client";

import { useState, useEffect } from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import Pagination from "./Pagination";
import { CommentsResponse } from "@/types";

export default function Guestbook() {
  const [data, setData] = useState<CommentsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchComments = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?page=${p}&limit=20`);
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

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <pre className="text-terminal-green text-xs sm:text-sm leading-tight mb-2">
{`╔══════════════════════════════════════╗
║     ZianTT GuestBook v1.0            ║
║     [CTF_MODE: ENABLED]              ║
╚══════════════════════════════════════╝`}
        </pre>
        <p className="text-terminal-muted text-sm">root@ziantt-guestbook:~$ ./guestbook.sh</p>
      </header>

      {data?.announcement && (
        <div className="terminal-card mb-6 border-l-4 border-terminal-amber">
          <div className="text-terminal-amber text-xs mb-1">[SYSTEM ANNOUNCEMENT]</div>
          <div className="text-sm whitespace-pre-wrap">{data.announcement}</div>
        </div>
      )}

      <CommentForm onSuccess={() => fetchComments(1)} />

      <div className="mt-8">
        {loading ? (
          <div className="text-terminal-green animate-pulse">&gt; Loading packets...</div>
        ) : (
          <>
            <CommentList comments={data?.comments || []} />
            {data && data.pageInfo.totalPages > 1 && (
              <Pagination pageInfo={data.pageInfo} onChange={setPage} />
            )}
          </>
        )}
      </div>

      <footer className="mt-12 text-center text-terminal-muted text-xs border-t border-terminal-border pt-4">
        <p>Powered by Cloudflare Workers & KV | PoW Protected</p>
      </footer>
    </main>
  );
}
