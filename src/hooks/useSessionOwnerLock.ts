"use client";

import { useEffect, useState } from "react";
import {
  getClientAdminSession,
  lockedOwnerIdForSession,
} from "@/lib/admin-session-client";

export function useSessionOwnerLock() {
  const [lockedOwnerId, setLockedOwnerId] = useState<string | undefined>();
  const [lockedOwnerName, setLockedOwnerName] = useState("");

  useEffect(() => {
    const session = getClientAdminSession();
    setLockedOwnerId(lockedOwnerIdForSession(session));
    setLockedOwnerName(session?.ownerName ?? "");
  }, []);

  return { lockedOwnerId, lockedOwnerName };
}

export function defaultOwnerId(
  lockedOwnerId: string | undefined,
  formOwnerId: string,
  owners: { id: string }[]
): string {
  if (lockedOwnerId) return lockedOwnerId;
  if (formOwnerId) return formOwnerId;
  return owners[0]?.id ?? "";
}
