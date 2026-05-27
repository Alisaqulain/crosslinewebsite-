import { NextRequest } from "next/server";

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

export function isAdminRequest(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  return token === getAdminToken();
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
