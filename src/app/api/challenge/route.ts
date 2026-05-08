export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

const DIFFICULTY = 5;

function randomHex(length: number): string {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET() {
  try {
    const nonce = randomHex(16);
    const { env } = getRequestContext();
    await env.GUESTBOOK_KV.put(`challenge:${nonce}`, "1", { expirationTtl: 600 });
    return NextResponse.json({ nonce, difficulty: DIFFICULTY });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate challenge" }, { status: 500 });
  }
}
