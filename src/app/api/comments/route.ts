export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Comment } from "@/types";
import { generateId, generateRandomNickname } from "@/lib/utils";
import { verifyPow } from "@/lib/crypto";

const DEFAULT_DIFFICULTY = 5;
const MAX_CONTENT_LENGTH = 2000;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const { env } = getRequestContext();
    const raw = await env.GUESTBOOK_KV.get("comments");
    const all: Comment[] = raw ? JSON.parse(raw) : [];

    const visible = all
      .filter((c) => !c.isDeleted)
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.createdAt - a.createdAt;
      });

    const total = visible.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const comments = visible.slice((page - 1) * limit, page * limit);

    const announcement = (await env.GUESTBOOK_KV.get("announcement")) || "";

    return NextResponse.json({ comments, pageInfo: { page, limit, total, totalPages }, announcement });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nickname, email, website, content, powNonce, powSuffix } = body;

    // Validate PoW
    const { env } = getRequestContext();
    const challengeKey = `challenge:${powNonce}`;
    const challengeExists = await env.GUESTBOOK_KV.get(challengeKey);
    if (!challengeExists) {
      return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 400 });
    }
    const validPow = await verifyPow(powNonce, powSuffix, DEFAULT_DIFFICULTY);
    if (!validPow) {
      return NextResponse.json({ error: "PoW verification failed" }, { status: 400 });
    }
    // Consume challenge immediately to prevent replay
    await env.GUESTBOOK_KV.delete(challengeKey);

    // Validate content
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: `Content exceeds ${MAX_CONTENT_LENGTH} characters` }, { status: 400 });
    }

    const country = req.headers.get("CF-IPCountry") || undefined;

    const comment: Comment = {
      id: generateId(),
      nickname: nickname?.trim() || generateRandomNickname(),
      email: email?.trim() || undefined,
      website: website?.trim() || undefined,
      content: content.trim(),
      ip: req.headers.get("CF-Connecting-IP") || undefined,
      country,
      createdAt: Date.now(),
      likes: 0,
      isPinned: false,
      isDeleted: false,
    };

    const raw = await env.GUESTBOOK_KV.get("comments");
    const all: Comment[] = raw ? JSON.parse(raw) : [];
    all.push(comment);
    await env.GUESTBOOK_KV.put("comments", JSON.stringify(all));

    return NextResponse.json({ success: true, comment });
  } catch (err) {
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
