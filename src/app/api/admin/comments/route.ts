export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Comment } from "@/types";
import { verifyAdminToken } from "@/lib/utils";

async function auth(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  const secret = process.env.SECRET_PWD;
  if (!token || !secret) return false;
  try {
    await verifyAdminToken(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await auth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { env } = getRequestContext();
    const raw = await env.GUESTBOOK_KV.get("comments");
    const all: Comment[] = raw ? JSON.parse(raw) : [];
    return NextResponse.json({ comments: all });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
