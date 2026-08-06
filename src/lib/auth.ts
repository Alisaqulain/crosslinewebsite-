import { NextRequest } from "next/server";
import { readStore } from "./db";
import { ownerForUser, sanitizeAdminUsers } from "./admin-users";
import { createSessionToken, verifySessionToken, type AdminSession } from "./session";
import type { AdminUser, AppStore } from "./types";

const DEFAULT_ADMIN_USERNAME = "admincrossline";
const DEFAULT_ADMIN_PASSWORD = "admin@110";

export function getAdminToken(): string {
  return process.env.ADMIN_API_TOKEN?.trim() || "crossline-admin-secret";
}

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME;
}

export function validateAdminLogin(username: string, password: string): boolean {
  const expectedUser = getAdminUsername();
  const expectedPass = process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
  return username.trim() === expectedUser && password === expectedPass;
}

function legacyMainSession(store: AppStore): AdminSession {
  const mainUser = (store.adminUsers ?? []).find((u) => u.role === "main");
  const owner =
    (mainUser && ownerForUser(store, mainUser.ownerId)) ??
    store.owners.find((o) => o.id === "zuhair-abbas") ??
    store.owners[0];

  return {
    userId: mainUser?.id ?? "legacy-main",
    username: mainUser?.username ?? getAdminUsername(),
    ownerId: owner?.id ?? "",
    ownerName: owner?.name ?? "Admin",
    role: "main",
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
}

export async function getAdminSession(req: NextRequest): Promise<AdminSession | null> {
  const token = req.headers.get("x-admin-token");
  if (!token) return null;

  const session = verifySessionToken(token);
  if (session) return session;

  if (token === getAdminToken()) {
    const store = await readStore();
    return legacyMainSession(store);
  }

  return null;
}

export function sessionForUser(store: AppStore, user: AdminUser): AdminSession {
  const owner = ownerForUser(store, user.ownerId);
  return {
    userId: user.id,
    username: user.username,
    ownerId: user.ownerId,
    ownerName: owner?.name ?? user.username,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
}

export function issueSessionToken(store: AppStore, user: AdminUser): string {
  return createSessionToken(sessionForUser(store, user));
}

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  return (await getAdminSession(req)) !== null;
}

export function isMainOwner(session: AdminSession | null): boolean {
  return session?.role === "main";
}

export function canPatchSection(session: AdminSession | null, _section: string): boolean {
  return session !== null;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(message = "Not allowed") {
  return Response.json({ error: message }, { status: 403 });
}

export function sanitizeStoreForClient(store: AppStore): AppStore {
  if (!store.adminUsers?.length) return store;
  return {
    ...store,
    adminUsers: sanitizeAdminUsers(store.adminUsers) as unknown as AppStore["adminUsers"],
  };
}
