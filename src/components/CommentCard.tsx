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
    ? getGravatarUrl(comment.email, comment.country, 80)
    : `https://www.gravatar.com/avatar/00000000000000000000000000000000?s=80&d=retro`;

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
    <div className="terminal-card border-l-4 border-l-terminal-green">
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-10 h-10 rounded border border-terminal-border shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-terminal-green font-bold text-sm">{comment.nickname}</span>
            {comment.country && (
              <span className="text-xs text-terminal-muted bg-terminal-border px-1 rounded">
                {comment.country}
              </span>
            )}
            <span className="text-xs text-terminal-muted ml-auto">{dateStr}</span>
          </div>
          {comment.website && (
            <a
              href={comment.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-terminal-amber hover:underline block mb-2 truncate"
            >
              {comment.website}
            </a>
          )}
          <div
            className="markdown-body text-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div className="flex items-center gap-4 mt-3 text-xs">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-1 transition-colors ${
                liked ? "text-terminal-red" : "text-terminal-muted hover:text-terminal-green"
              }`}
            >
              <span>{liked ? "♥" : "♡"}</span>
              <span>{likeCount}</span>
            </button>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-muted hover:text-terminal-amber transition-colors"
            >
              Share to X
            </a>
            <button
              onClick={() => setShowQuote(!showQuote)}
              className="text-terminal-muted hover:text-terminal-green transition-colors"
            >
              {showQuote ? "Close Quote" : "Quote Image"}
            </button>
          </div>
        </div>
      </div>
      {showQuote && <QuoteImage comment={comment} onClose={() => setShowQuote(false)} />}
    </div>
  );
}
