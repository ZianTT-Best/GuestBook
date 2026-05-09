"use client";

import { useState, useEffect } from "react";
import { marked } from "marked";
import { Comment } from "@/types";
import { getGravatarUrl } from "@/lib/utils";
import QuoteImage from "./QuoteImage";

function escapeHtmlTags(text: string): string {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeLinks(html: string): string {
  return html
    .replace(/href="javascript:/gi, 'href="blocked:')
    .replace(/href="data:/gi, 'href="blocked:');
}

export default function CommentCard({ comment }: { comment: Comment }) {
  const [html, setHtml] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    const raw = escapeHtmlTags(comment.content);
    Promise.resolve(marked.parse(raw)).then((h) => {
      setHtml(sanitizeLinks(String(h)));
    });
  }, [comment.content]);

  const avatarUrl = comment.email
    ? getGravatarUrl(comment.email, comment.country, 160)
    : `https://www.gravatar.com/avatar/00000000000000000000000000000000?s=160&d=retro`;

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await fetch(`/api/comments/${comment.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLikeCount(data.likes);
        setLiked(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${comment.nickname}: ${comment.content.slice(0, 100)}...`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  const dateStr = new Date(comment.createdAt).toLocaleString("zh-CN");

  return (
    <div className="flex border-b border-black">
      {/* Left: Avatar area */}
      <div className="w-[140px] shrink-0 border-r border-black p-4 flex flex-col items-start">
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-20 h-20 border border-black mb-3 object-cover"
          loading="lazy"
        />
        <span className="text-xs font-bold uppercase tracking-wide">
          {comment.nickname}
        </span>
        {comment.email && (
          <span className="text-[10px] text-gb-muted mt-1 break-all leading-tight">
            {comment.email}
          </span>
        )}
        {comment.website && (
          <a
            href={comment.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-gb-muted hover:text-black hover:underline break-all leading-tight mt-0.5"
          >
            {comment.website}
          </a>
        )}
      </div>

      {/* Right: Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 min-h-[80px]">
          <div
            className="markdown-body text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        <div className="border-t border-black flex items-center justify-between flex-wrap">
          <div className="flex">
            <button
              onClick={handleLike}
              disabled={liked}
              className="px-3 py-1.5 text-[11px] uppercase tracking-wider border-r border-black hover:bg-gb-light transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <span>{liked ? "♥" : "♡"}</span>
              <span>Like ({likeCount})</span>
            </button>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-[11px] uppercase tracking-wider border-r border-black hover:bg-gb-light transition-colors flex items-center gap-1"
            >
              <span>↗</span>
              <span>Share to X</span>
            </a>
            <button
              onClick={() => setShowQuote(!showQuote)}
              className="px-3 py-1.5 text-[11px] uppercase tracking-wider border-r border-black hover:bg-gb-light transition-colors"
            >
              {showQuote ? "Close Quote" : "Quote Image"}
            </button>
          </div>
          <span className="px-3 py-1.5 text-[11px] text-gb-muted">
            {dateStr}
          </span>
        </div>
      </div>
      {showQuote && <QuoteImage comment={comment} onClose={() => setShowQuote(false)} />}
    </div>
  );
}
