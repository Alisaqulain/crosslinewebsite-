"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import type { StadiumOwner } from "@/lib/types";
import { Loader2, Plus, Trash2, Users } from "lucide-react";

export default function AdminOwnersPage() {
  const { toast } = useToast();
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchAdminStore().then(({ store }) => {
      setOwners(store.owners ?? []);
      setLoading(false);
    });
  }, []);

  const save = async (data: StadiumOwner[]) => {
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
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `owner-${Date.now()}`;
    if (owners.some((o) => o.id === id || o.name.toLowerCase() === trimmed.toLowerCase())) {
      toast("This owner already exists", "error");
      return;
    }
    save([...owners, { id, name: trimmed }]);
    setName("");
  };

  const removeOwner = (id: string) => {
    if (!confirm("Remove this owner from the list? Past records keep the name in history.")) return;
    save(owners.filter((o) => o.id !== id));
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
    <AdminShell title="Stadium Owners / Partners">
      <p className="text-sm text-slate-600 mb-6 max-w-2xl">
        Add partners here (e.g. Ali, Zubair). Then choose who paid an expense or who received
        booking money. Dashboard shows income and expenses per owner.
      </p>

      <Card className="mb-8">
        <h3 className="font-semibold text-[var(--navy)] mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-[#F7931E]" />
          Add owner
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ali"
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

      <Card>
        <h3 className="font-semibold text-[var(--navy)] mb-4">Owner list ({owners.length})</h3>
        {owners.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No owners yet — add Ali, Zubair, etc.</p>
        ) : (
          <ul className="space-y-2">
            {owners.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between p-3 rounded-xl admin-subtle"
              >
                <div>
                  <p className="font-semibold text-[var(--navy)]">{o.name}</p>
                  <p className="text-xs text-slate-400">id: {o.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeOwner(o.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  aria-label={`Remove ${o.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AdminShell>
  );
}
