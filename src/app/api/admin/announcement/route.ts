export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
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

export async function GET() {
  try {
    const { env } = getRequestContext();
    const announcement = (await env.GUESTBOOK_KV.get("announcement")) || "";
    return NextResponse.json({ announcement });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch announcement" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await auth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { announcement } = await req.json();
    const { env } = getRequestContext();
    await env.GUESTBOOK_KV.put("announcement", String(announcement || ""));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
