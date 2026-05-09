"use client";

import { Comment } from "@/types";
import CommentCard from "./CommentCard";

export default function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-gb-muted text-sm border-b border-black">
        No packets received yet. Be the first to transmit.
      </div>
    );
  }

  return (
    <div>
      {comments.map((c) => (
        <CommentCard key={c.id} comment={c} />
      ))}
    </div>
  );
}
