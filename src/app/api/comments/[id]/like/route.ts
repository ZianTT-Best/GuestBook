export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Comment } from "@/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { env } = getRequestContext();
    const raw = await env.GUESTBOOK_KV.get("comments");
    const all: Comment[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    all[idx].likes += 1;
    await env.GUESTBOOK_KV.put("comments", JSON.stringify(all));
    return NextResponse.json({ success: true, likes: all[idx].likes });
  } catch (err) {
    return NextResponse.json({ error: "Failed to like comment" }, { status: 500 });
  }
}
