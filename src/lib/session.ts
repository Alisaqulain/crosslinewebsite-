import crypto from "crypto";
import type { AdminUserRole } from "./types";

export interface AdminSession {
  userId: string;
  username: string;
  ownerId: string;
  ownerName: string;
  role: AdminUserRole;
  exp: number;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sessionSecret(): string {
  return process.env.ADMIN_API_TOKEN?.trim() || "crossline-admin-secret";
}

export function createSessionToken(session: Omit<AdminSession, "exp">): string {
  const payload: AdminSession = { ...session, exp: Date.now() + SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string): AdminSession | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  if (sig.length !== expected.length) return null;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AdminSession;
    if (!session.exp || session.exp < Date.now()) return null;
    if (!session.userId || !session.role) return null;
    return session;
  } catch {
    return null;
  }
}
