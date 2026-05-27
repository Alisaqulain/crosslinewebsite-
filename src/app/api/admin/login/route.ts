import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, validateAdminLogin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    if (!validateAdminLogin(username, password)) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      token: getAdminToken(),
      username: username.trim(),
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
