import type { AdminUser, AppStore, StadiumOwner } from "./types";
import { hashPassword, verifyPassword } from "./password";
import { getAdminUsername } from "./auth";
import { generateId } from "./id";

export function sanitizeAdminUsers(users: AdminUser[] = []): Omit<AdminUser, "passwordHash">[] {
  return users.map(({ passwordHash: _unused, ...user }) => user);
}

export function findAdminUser(store: AppStore, username: string): AdminUser | undefined {
  const key = username.trim().toLowerCase();
  return (store.adminUsers ?? []).find((u) => u.username.toLowerCase() === key);
}

export function findAdminUserByOwnerId(store: AppStore, ownerId: string): AdminUser | undefined {
  return (store.adminUsers ?? []).find((u) => u.ownerId === ownerId);
}

export function ownerForUser(store: AppStore, ownerId: string): StadiumOwner | undefined {
  return (store.owners ?? []).find((o) => o.id === ownerId);
}

export async function authenticateAdminUser(
  store: AppStore,
  username: string,
  password: string
): Promise<AdminUser | null> {
  const user = findAdminUser(store, username);
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  return ok ? user : null;
}

export async function bootstrapMainAdminUser(
  store: AppStore,
  password: string
): Promise<AdminUser> {
  const existing = (store.adminUsers ?? []).find((u) => u.role === "main");
  if (existing) return existing;

  const mainOwner =
    store.owners.find((o) => o.id === "zuhair-abbas") ??
    store.owners.find((o) => o.name.toLowerCase().includes("zuhair")) ??
    store.owners[0];

  if (!mainOwner) {
    throw new Error("Add stadium owners first, then log in again");
  }

  const user: AdminUser = {
    id: generateId("AU"),
    username: getAdminUsername(),
    passwordHash: await hashPassword(password),
    ownerId: mainOwner.id,
    role: "main",
    createdAt: new Date().toISOString(),
  };

  return user;
}

export function validateNewUsername(username: string): string | null {
  const trimmed = username.trim();
  if (trimmed.length < 3) return "Username must be at least 3 characters";
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    return "Username can only use letters, numbers, . _ -";
  }
  return null;
}

export function validateNewPassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}
