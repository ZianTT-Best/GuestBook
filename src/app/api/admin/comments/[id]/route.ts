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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const { env } = getRequestContext();
    const raw = await env.GUESTBOOK_KV.get("comments");
    const all: Comment[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (body.content !== undefined) all[idx].content = body.content;
    if (body.isPinned !== undefined) all[idx].isPinned = !!body.isPinned;
    if (body.isDeleted !== undefined) all[idx].isDeleted = !!body.isDeleted;
    await env.GUESTBOOK_KV.put("comments", JSON.stringify(all));
    return NextResponse.json({ success: true, comment: all[idx] });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { env } = getRequestContext();
    const raw = await env.GUESTBOOK_KV.get("comments");
    const all: Comment[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    all[idx].isDeleted = true;
    await env.GUESTBOOK_KV.put("comments", JSON.stringify(all));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
