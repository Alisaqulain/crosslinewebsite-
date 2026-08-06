"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminStore,
  fetchAdminUsers,
  patchAdmin,
  updateAdminUser,
} from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { getClientAdminSession } from "@/lib/admin-session-client";
import type { AdminUser, StadiumOwner } from "@/lib/types";
import { KeyRound, Loader2, Plus, Trash2, Users } from "lucide-react";

type SafeAdminUser = Omit<AdminUser, "passwordHash">;

export default function AdminOwnersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const session = getClientAdminSession();
  const isMain = session?.isMain ?? true;

  useEffect(() => {
    if (session && !session.isMain) {
      router.replace("/admin");
    }
  }, [session, router]);

  if (session && !session.isMain) {
    return null;
  }

  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [users, setUsers] = useState<SafeAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [newLogin, setNewLogin] = useState({ username: "", password: "" });
  const [resetPass, setResetPass] = useState<Record<string, string>>({});

  const load = async () => {
    const { store } = await fetchAdminStore();
    setOwners(store.owners ?? []);
    const fromStore = (store.adminUsers ?? []).map(
      ({ passwordHash: _unused, ...u }: AdminUser) => u
    );
    setUsers(fromStore as SafeAdminUser[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const userByOwnerId = useMemo(() => {
    const map = new Map<string, SafeAdminUser>();
    users.forEach((u) => map.set(u.ownerId, u));
    return map;
  }, [users]);

  const saveOwners = async (data: StadiumOwner[]) => {
    try {
      const { store } = await patchAdmin("owners", data);
      setOwners(store.owners ?? data);
      toast("Owners saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    }
  };

  const addOwner = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Enter owner name", "error");
      return;
    }
    const id =
      trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
      `owner-${Date.now()}`;
    if (owners.some((o) => o.id === id || o.name.toLowerCase() === trimmed.toLowerCase())) {
      toast("This owner already exists", "error");
      return;
    }
    saveOwners([...owners, { id, name: trimmed }]);
    setName("");
  };

  const removeOwner = async (id: string) => {
    if (userByOwnerId.has(id)) {
      toast("Remove login first before removing this owner", "error");
      return;
    }
    if (!confirm("Remove this owner from the list? Past records keep the name in history.")) return;
    saveOwners(owners.filter((o) => o.id !== id));
  };

  const submitCreateLogin = async (ownerId: string) => {
    try {
      await createAdminUser({
        ownerId,
        username: newLogin.username,
        password: newLogin.password,
      });
      toast("Co-owner login created", "success");
      setCreatingFor(null);
      setNewLogin({ username: "", password: "" });
      const data = await fetchAdminUsers();
      setUsers(data.users as SafeAdminUser[]);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const submitResetPassword = async (userId: string) => {
    const password = resetPass[userId]?.trim();
    if (!password) {
      toast("Enter new password", "error");
      return;
    }
    try {
      await updateAdminUser({ userId, password });
      toast("Password updated", "success");
      setResetPass((prev) => ({ ...prev, [userId]: "" }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const removeLogin = async (userId: string, ownerName: string) => {
    if (!confirm(`Remove login for ${ownerName}?`)) return;
    try {
      await deleteAdminUser(userId);
      toast("Login removed", "success");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  if (loading) {
    return (
      <AdminShell title="Owners">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Stadium Owners & Logins">
      <p className="text-sm text-slate-600 mb-6 max-w-2xl">
        {isMain ? (
          <>
            Add partners here, then create a <strong>username and password</strong> for each co-owner.
            When Nafse or Boby log in, they see the full admin panel — only you can create or reset logins.
          </>
        ) : (
          <>
            View stadium owners and partners here. Only the main owner can create login accounts or reset
            passwords.
          </>
        )}
      </p>

      {isMain && (
      <Card className="mb-8">
        <h3 className="font-semibold text-[var(--navy)] mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-[#F7931E]" />
          Add owner / partner
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nafse Ali"
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && addOwner()}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={addOwner}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </Card>
      )}

      <Card>
        <h3 className="font-semibold text-[var(--navy)] mb-4">
          Owner list ({owners.length}) — logins
        </h3>
        {owners.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No owners yet</p>
        ) : (
          <ul className="space-y-3">
            {owners.map((o) => {
              const login = userByOwnerId.get(o.id);
              const isMainOwner = login?.role === "main";
              return (
                <li key={o.id} className="p-4 rounded-xl admin-subtle space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--navy)]">
                        {o.name}
                        {isMainOwner && (
                          <span className="ml-2 text-[10px] font-bold uppercase text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            Main owner
                          </span>
                        )}
                        {login?.role === "co-owner" && (
                          <span className="ml-2 text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Co-owner
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">id: {o.id}</p>
                      {login && (
                        <p className="text-xs text-slate-600 mt-1">
                          Login username: <strong>{login.username}</strong>
                        </p>
                      )}
                    </div>
                    {!isMainOwner && isMain && (
                      <button
                        type="button"
                        onClick={() => removeOwner(o.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        aria-label={`Remove ${o.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {!login && isMain && (
                    <div className="border-t border-[var(--border)] pt-3">
                      {creatingFor === o.id ? (
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <Label>Username</Label>
                            <Input
                              value={newLogin.username}
                              onChange={(e) =>
                                setNewLogin({ ...newLogin, username: e.target.value })
                              }
                              placeholder="e.g. nafse"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Password</Label>
                            <Input
                              type="password"
                              value={newLogin.password}
                              onChange={(e) =>
                                setNewLogin({ ...newLogin, password: e.target.value })
                              }
                              placeholder="Min 6 characters"
                              className="mt-1"
                            />
                          </div>
                          <div className="sm:col-span-2 flex gap-2">
                            <Button size="sm" onClick={() => submitCreateLogin(o.id)}>
                              <KeyRound className="h-4 w-4" /> Create login
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setCreatingFor(null);
                                setNewLogin({ username: "", password: "" });
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setCreatingFor(o.id)}>
                          <KeyRound className="h-4 w-4" /> Create login for {o.name}
                        </Button>
                      )}
                    </div>
                  )}

                  {login && isMain && (
                    <div className="border-t border-[var(--border)] pt-3 flex flex-wrap gap-2 items-end">
                      <div className="flex-1 min-w-[180px]">
                        <Label>New password</Label>
                        <Input
                          type="password"
                          value={resetPass[login.id] ?? ""}
                          onChange={(e) =>
                            setResetPass((prev) => ({ ...prev, [login.id]: e.target.value }))
                          }
                          placeholder="Reset password"
                          className="mt-1"
                        />
                      </div>
                      <Button size="sm" onClick={() => submitResetPassword(login.id)}>
                        Update password
                      </Button>
                      {login.role === "co-owner" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => removeLogin(login.id, o.name)}
                        >
                          Remove login
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </AdminShell>
  );
}
