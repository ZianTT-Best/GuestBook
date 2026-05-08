"use client";

import { useState } from "react";
import { solvePow } from "@/lib/crypto";
import { generateRandomNickname } from "@/lib/utils";

export default function CommentForm({ onSuccess }: { onSuccess: () => void }) {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [content, setContent] = useState("");
  const [powStatus, setPowStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRandomName = () => {
    setNickname(generateRandomNickname());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setPowStatus("> Requesting challenge...");

    try {
      const challengeRes = await fetch("/api/challenge");
      const { nonce, difficulty } = await challengeRes.json();
      setPowStatus(`> Computing PoW (difficulty=${difficulty})...`);
      const suffix = await solvePow(nonce, difficulty);
      setPowStatus("> Submitting packet...");

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          email,
          website,
          content,
          powNonce: nonce,
          powSuffix: suffix,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setPowStatus("> Packet delivered successfully!");
        setNickname("");
        setEmail("");
        setWebsite("");
        setContent("");
        onSuccess();
      } else {
        setPowStatus(`> ERROR: ${result.error || "Submission failed"}`);
      }
    } catch (err) {
      setPowStatus("> ERROR: Network failure");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="terminal-card">
      <div className="text-terminal-green text-xs mb-3 flex items-center gap-2 flex-wrap">
        <span className="text-terminal-amber">root@visitor</span>:
        <span className="text-terminal-muted">~</span>$ echo &quot;Leave a trace&quot;
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <span className="absolute left-2 top-2 text-terminal-green/50 select-none">&gt;</span>
            <input
              type="text"
              placeholder="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="terminal-input pl-6"
            />
            <button
              type="button"
              onClick={handleRandomName}
              className="absolute right-2 top-2 text-xs text-terminal-amber hover:underline"
            >
              random
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-2 top-2 text-terminal-green/50 select-none">@</span>
            <input
              type="email"
              placeholder="email (for Gravatar)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="terminal-input pl-6"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2 top-2 text-terminal-green/50 select-none">~</span>
            <input
              type="url"
              placeholder="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="terminal-input pl-6"
            />
          </div>
        </div>
        <div className="relative">
          <textarea
            placeholder="Enter your message (Markdown supported)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            rows={4}
            className="terminal-input resize-none"
          />
          <div className="text-right text-xs text-terminal-muted mt-1">{content.length}/2000</div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-terminal-green min-h-[1.25rem]">{powStatus}</div>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="terminal-btn disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {submitting ? "Transmitting..." : "Submit [ENTER]"}
          </button>
        </div>
      </form>
    </div>
  );
}
