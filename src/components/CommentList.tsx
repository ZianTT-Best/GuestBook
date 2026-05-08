"use client";

import { Comment } from "@/types";
import CommentCard from "./CommentCard";

export default function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <div className="terminal-card text-terminal-muted text-center py-8">
        No packets received yet. Be the first to transmit.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <CommentCard key={c.id} comment={c} />
      ))}
    </div>
  );
}
