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
    setPowStatus("Requesting challenge...");

    try {
      const challengeRes = await fetch("/api/challenge");
      const { nonce, difficulty } = await challengeRes.json();
      setPowStatus(`Computing PoW (difficulty=${difficulty})...`);
      const suffix = await solvePow(nonce, difficulty);
      setPowStatus("Submitting packet...");

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
        setPowStatus("Packet delivered successfully!");
        setNickname("");
        setEmail("");
        setWebsite("");
        setContent("");
        onSuccess();
      } else {
        setPowStatus(`ERROR: ${result.error || "Submission failed"}`);
      }
    } catch (err) {
      setPowStatus("ERROR: Network failure");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-b border-black">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-black mb-0">
          <div className="relative border-b sm:border-b-0 sm:border-r border-black">
            <span className="absolute left-2 top-2 text-gb-muted text-xs select-none">&gt;</span>
            <input
              type="text"
              placeholder="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-white px-3 py-2 pl-6 text-sm focus:outline-none placeholder:text-gb-muted"
            />
            <button
              type="button"
              onClick={handleRandomName}
              className="absolute right-2 top-2 text-[10px] uppercase tracking-wider text-gb-muted hover:text-black border border-black px-1.5 py-0.5"
            >
              random
            </button>
          </div>
          <div className="relative border-b sm:border-b-0 sm:border-r border-black">
            <span className="absolute left-2 top-2 text-gb-muted text-xs select-none">@</span>
            <input
              type="email"
              placeholder="email (for Gravatar)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white px-3 py-2 pl-6 text-sm focus:outline-none placeholder:text-gb-muted"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2 top-2 text-gb-muted text-xs select-none">~</span>
            <input
              type="url"
              placeholder="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full bg-white px-3 py-2 pl-6 text-sm focus:outline-none placeholder:text-gb-muted"
            />
          </div>
        </div>
        <div className="border border-black border-t-0">
          <textarea
            placeholder="Enter your message (Markdown supported)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            rows={4}
            className="w-full bg-white px-3 py-2 text-sm focus:outline-none placeholder:text-gb-muted resize-none"
          />
          <div className="flex items-center justify-between px-3 py-2 border-t border-black">
            <div className="text-xs text-gb-muted min-h-[1.25rem]">{powStatus}</div>
            <div className="text-xs text-gb-muted">{content.length}/2000</div>
          </div>
        </div>
        <div className="flex items-center justify-end mt-3">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-2 text-xs uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Transmitting..." : "Submit [ENTER]"}
          </button>
        </div>
      </form>
    </div>
  );
}
