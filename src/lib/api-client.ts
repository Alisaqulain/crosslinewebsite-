const ADMIN_TOKEN = "crossline-admin-secret";

export function adminHeaders(): HeadersInit {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("crossline_admin_token") ?? ADMIN_TOKEN;
    return { "Content-Type": "application/json", "x-admin-token": token };
  }
  return { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN };
}

export async function fetchPublic() {
  const res = await fetch("/api/public", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

export async function createBooking(data: Record<string, unknown>) {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Booking failed");
  return json;
}

export async function fetchAdminStore() {
  const res = await fetch("/api/admin", { headers: adminHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function patchAdmin(section: string, data: unknown) {
  const res = await fetch("/api/admin", {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ section, data }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Update failed");
  return json;
}

export async function patchBooking(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Update failed");
  return json;
}

export async function fetchBookings(params?: { status?: string; date?: string }) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.date) q.set("date", params.date);
  const res = await fetch(`/api/bookings?${q}`, { headers: adminHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load bookings");
  return res.json();
}
