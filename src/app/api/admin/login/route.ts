import { NextRequest, NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import {
  authenticateAdminUser,
  bootstrapMainAdminUser,
  findAdminUser,
  ownerForUser,
} from "@/lib/admin-users";
import {
  issueSessionToken,
  validateAdminLogin,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    let store = await readStore();
    let user = await authenticateAdminUser(store, username, password);

    if (!user && validateAdminLogin(username, password)) {
      const mainUser = await bootstrapMainAdminUser(store, password);
      store = await updateStore((s) => ({
        ...s,
        adminUsers: [...(s.adminUsers ?? []).filter((u) => u.id !== mainUser.id), mainUser],
      }));
      user = findAdminUser(store, mainUser.username) ?? mainUser;
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const owner = ownerForUser(store, user.ownerId);

    return NextResponse.json({
      ok: true,
      token: issueSessionToken(store, user),
      username: user.username,
      ownerId: user.ownerId,
      ownerName: owner?.name ?? user.username,
      role: user.role,
      userId: user.id,
    });
  } catch (err) {
    console.error("Login failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed" },
      { status: 500 }
    );
  }
}
