export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { signAdminToken } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const secret = process.env.SECRET_PWD;
    if (!secret) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }
    if (password !== secret) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const token = await signAdminToken(secret);
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });
    return response;
  } catch (err) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
