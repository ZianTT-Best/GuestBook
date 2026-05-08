import { md5 } from "./crypto";
import { SignJWT, jwtVerify } from "jose";

const PREFIXES = [
  "0x", "Null", "Buffer", "Stack", "Heap", "Packet", "Frame", "Root",
  "Ghost", "Crypto", "Shell", "Byte", "Net", "SQL", "XSS", "Dark",
  "Light", "Core", "System", "Kernel", "Hash", "Cipher", "Bit",
  "Cyber", "Tech", "Data", "Logic", "Syntax", "Runtime",
];

const SUFFIXES = [
  "Overflow", "Trace", "Runner", "Walker", "Hunter", "Punk", "Bot",
  "Node", "Fault", "Error", "Exception", "Pointer", "Master", "Ghost",
  "Byte", "Bit", "Dump", "Inject", "Exploit", "Shell", "Cracker",
  "Breach", "Phantom", "Wraith", "Spectre", "Glitch", "Vortex",
];

export function generateRandomNickname(): string {
  const pre = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suf = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const hex = Math.floor(Math.random() * 65536).toString(16).padStart(4, "0");
  return `${pre}${suf}_${hex}`;
}

export function getGravatarUrl(email: string, country: string | undefined, size = 80): string {
  const trimmed = email.trim().toLowerCase();
  const hash = md5(trimmed);
  const base = country === "CN" ? "https://cravatar.cn/avatar" : "https://www.gravatar.com/avatar";
  return `${base}/${hash}?s=${size}&d=retro&r=g`;
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

export async function signAdminToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(key);
}

export async function verifyAdminToken(token: string, secret: string) {
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  return jwtVerify(token, key, { clockTolerance: 60 });
}
