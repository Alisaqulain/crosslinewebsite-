import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import {
  findAdminUser,
  findAdminUserByOwnerId,
  ownerForUser,
  sanitizeAdminUsers,
  validateNewPassword,
  validateNewUsername,
} from "@/lib/admin-users";
import { hashPassword } from "@/lib/password";
import { generateId } from "@/lib/id";
import {
  forbidden,
  getAdminSession,
  isMainOwner,
  unauthorized,
} from "@/lib/auth";
import type { AdminUser } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return unauthorized();
  if (!isMainOwner(session)) return forbidden("Only main owner can manage logins");

  const store = await readStore();
  return NextResponse.json({
    users: sanitizeAdminUsers(store.adminUsers ?? []),
    owners: store.owners ?? [],
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return unauthorized();
  if (!isMainOwner(session)) return forbidden("Only main owner can create co-owner logins");

  try {
    const { username, password, ownerId } = await req.json();
    const userError = validateNewUsername(String(username ?? ""));
    if (userError) return NextResponse.json({ error: userError }, { status: 400 });
    const passError = validateNewPassword(String(password ?? ""));
    if (passError) return NextResponse.json({ error: passError }, { status: 400 });
    if (!ownerId) return NextResponse.json({ error: "Select an owner" }, { status: 400 });

    const store = await readStore();
    const owner = ownerForUser(store, String(ownerId));
    if (!owner) return NextResponse.json({ error: "Owner not found" }, { status: 400 });
    if (findAdminUser(store, username)) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }
    if (findAdminUserByOwnerId(store, owner.id)) {
      return NextResponse.json({ error: "This owner already has a login" }, { status: 400 });
    }

    const user: AdminUser = {
      id: generateId("AU"),
      username: String(username).trim(),
      passwordHash: await hashPassword(String(password)),
      ownerId: owner.id,
      role: "co-owner",
      createdAt: new Date().toISOString(),
      createdBy: session.userId,
    };

    const updated = await updateStore((s) => ({
      ...s,
      adminUsers: [...(s.adminUsers ?? []), user],
    }));

    return NextResponse.json({
      ok: true,
      user: sanitizeAdminUsers(updated.adminUsers ?? []).find((u) => u.id === user.id),
    });
  } catch (err) {
    console.error("Create admin user failed:", err);
    return NextResponse.json({ error: "Failed to create login" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return unauthorized();

  try {
    const { userId, password, newUsername } = await req.json();
    if (!userId) return NextResponse.json({ error: "User id required" }, { status: 400 });

    const store = await readStore();
    const target = (store.adminUsers ?? []).find((u) => u.id === userId);
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isSelf = session.userId === target.id;
    if (!isMainOwner(session) && !isSelf) {
      return forbidden("You can only change your own password");
    }
    if (target.role === "main" && !isMainOwner(session)) {
      return forbidden("Cannot change main owner account");
    }

    const passError = password ? validateNewPassword(String(password)) : null;
    if (passError) return NextResponse.json({ error: passError }, { status: 400 });

    if (newUsername && !isMainOwner(session)) {
      return forbidden("Only main owner can change usernames");
    }
    if (newUsername) {
      const userError = validateNewUsername(String(newUsername));
      if (userError) return NextResponse.json({ error: userError }, { status: 400 });
      const taken = findAdminUser(store, newUsername);
      if (taken && taken.id !== target.id) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }

    if (!password && !newUsername) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const nextHash = password ? await hashPassword(String(password)) : undefined;

    const updated = await updateStore((s) => ({
      ...s,
      adminUsers: (s.adminUsers ?? []).map((u) => {
        if (u.id !== target.id) return u;
        return {
          ...u,
          username: newUsername ? String(newUsername).trim() : u.username,
          ...(nextHash ? { passwordHash: nextHash } : {}),
        };
      }),
    }));

    const nextUser = (updated.adminUsers ?? []).find((u) => u.id === target.id);

    return NextResponse.json({
      ok: true,
      user: nextUser ? sanitizeAdminUsers([nextUser])[0] : null,
    });
  } catch (err) {
    console.error("Update admin user failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return unauthorized();
  if (!isMainOwner(session)) return forbidden("Only main owner can remove logins");

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const store = await readStore();
  const target = (store.adminUsers ?? []).find((u) => u.id === userId);
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role === "main") {
    return NextResponse.json({ error: "Cannot remove main owner login" }, { status: 400 });
  }

  await updateStore((s) => ({
    ...s,
    adminUsers: (s.adminUsers ?? []).filter((u) => u.id !== userId),
  }));

  return NextResponse.json({ ok: true });
}
