import type { AdminUserRole } from "./types";

export interface ClientAdminSession {
  username: string;
  ownerId: string;
  ownerName: string;
  role: AdminUserRole;
  userId: string;
  isMain: boolean;
}

const KEYS = {
  authed: "crossline_admin",
  token: "crossline_admin_token",
  user: "crossline_admin_user",
  ownerId: "crossline_admin_owner_id",
  ownerName: "crossline_admin_owner_name",
  role: "crossline_admin_role",
  userId: "crossline_admin_user_id",
} as const;

export function saveClientAdminSession(data: {
  token: string;
  username: string;
  ownerId: string;
  ownerName: string;
  role: AdminUserRole;
  userId: string;
}) {
  sessionStorage.setItem(KEYS.authed, "true");
  sessionStorage.setItem(KEYS.token, data.token);
  sessionStorage.setItem(KEYS.user, data.username);
  sessionStorage.setItem(KEYS.ownerId, data.ownerId);
  sessionStorage.setItem(KEYS.ownerName, data.ownerName);
  sessionStorage.setItem(KEYS.role, data.role);
  sessionStorage.setItem(KEYS.userId, data.userId);
}

export function getClientAdminSession(): ClientAdminSession | null {
  if (typeof window === "undefined") return null;
  if (sessionStorage.getItem(KEYS.authed) !== "true") return null;
  const role = (sessionStorage.getItem(KEYS.role) as AdminUserRole | null) ?? "main";
  return {
    username: sessionStorage.getItem(KEYS.user) ?? "",
    ownerId: sessionStorage.getItem(KEYS.ownerId) ?? "",
    ownerName: sessionStorage.getItem(KEYS.ownerName) ?? "",
    role,
    userId: sessionStorage.getItem(KEYS.userId) ?? "",
    isMain: role === "main",
  };
}

export function clearClientAdminSession() {
  Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k));
}

export function lockedOwnerIdForSession(session: ClientAdminSession | null): string | undefined {
  if (!session || session.isMain) return undefined;
  return session.ownerId || undefined;
}
