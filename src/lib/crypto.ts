/**
 * Pure JS MD5 for Gravatar (Web Crypto doesn't support MD5)
 */
export function md5(input: string): string {
  const msg = unescape(encodeURIComponent(input));
  const k: number[] = [];
  let i = 0;
  const sin = Math.sin;
  for (; i < 64; ) {
    k[i] = (Math.abs(sin(++i)) * 4294967296) | 0;
  }

  const words: number[] = [];
  const length = msg.length;
  for (i = 0; i < length; ) {
    words[i >> 2] |= msg.charCodeAt(i) << (8 * (i++ % 4));
  }
  words[length >> 2] |= 0x80 << (8 * (length % 4));
  words[(((length + 64) >> 9) << 4) + 14] = length * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (i = 0; i < words.length; i += 16) {
    const oldA = a;
    const oldB = b;
    const oldC = c;
    const oldD = d;

    for (let j = 0; j < 64; j++) {
      let f: number, g: number;
      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }
      const tmp = d;
      d = c;
      c = b;
      b = b + leftRotate(a + f + k[j] + words[i + g], [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][((j / 16) | 0) * 4 + (j % 4)]);
      a = tmp;
    }

    a += oldA;
    b += oldB;
    c += oldC;
    d += oldD;
  }

  return [a, b, c, d]
    .map((n) => {
      return (
        (n < 0 ? n + 4294967296 : n)
          .toString(16)
          .padStart(8, "0")
          .match(/.{2}/g)!
          .reverse()
          .join("")
      );
    })
    .join("");
}

function leftRotate(x: number, c: number): number {
  return (x << c) | (x >>> (32 - c));
}

/**
 * Verify PoW: SHA-256(nonce + suffix) must start with `difficulty` zeros
 */
export async function verifyPow(nonce: string, suffix: string, difficulty: number): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(nonce + suffix);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.startsWith("0".repeat(difficulty));
}

/**
 * Client-side PoW solver (used in browser)
 */
export async function solvePow(nonce: string, difficulty: number): Promise<string> {
  const encoder = new TextEncoder();
  let suffix = 0;
  const target = "0".repeat(difficulty);
  while (true) {
    const suffixStr = suffix.toString();
    const data = encoder.encode(nonce + suffixStr);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hashHex.startsWith(target)) {
      return suffixStr;
    }
    suffix++;
    // Yield to UI every 4096 iterations
    if (suffix % 4096 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }
}
