import { NextRequest } from "next/server";

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN ?? "crossline-admin-secret";

export function isAdminRequest(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  return token === ADMIN_TOKEN;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
