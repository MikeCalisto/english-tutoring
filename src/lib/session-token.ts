/**
 * Подписанный токен сессии в cookie: { sid, uid, role } + HMAC-SHA256.
 * Работает и в proxy (Web Crypto), и в серверных компонентах.
 */
export interface SessionClaims {
  sid: string;
  uid: string;
  role: "admin" | "teacher" | "student";
}

export const COOKIE = "sid";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(s: string) {
  const p = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(p + "=".repeat((4 - (p.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function key() {
  return crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(c: SessionClaims): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(c)));
  const sig = await crypto.subtle.sign("HMAC", await key(), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const ok = await crypto.subtle.verify("HMAC", await key(), unb64url(sig), enc.encode(body));
  if (!ok) return null;
  try {
    const c = JSON.parse(new TextDecoder().decode(unb64url(body))) as SessionClaims;
    if (!c.sid || !c.uid || !c.role) return null;
    return c;
  } catch {
    return null;
  }
}
