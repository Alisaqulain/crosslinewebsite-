"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import type { Tournament } from "@/lib/types";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

export default function AdminTournamentsPage() {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStore().then(({ store }) => {
      setTournaments(store.tournaments);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    try {
      await patchAdmin("tournaments", tournaments);
      toast("Tournaments saved", "success");
    } catch {
      toast("Save failed", "error");
    }
  };

  const add = () => {
    setTournaments([
      {
        id: `T-${Date.now()}`,
        title: "New Tournament",
        date: new Date().toISOString().split("T")[0],
        description: "",
        status: "upcoming",
        registrationOpen: true,
      },
      ...tournaments,
    ]);
  };

  if (loading) {
    return (
      <AdminShell title="Tournaments">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Tournament Management">
      <div className="flex gap-3 mb-6">
        <Button size="sm" onClick={add}><Plus className="h-4 w-4" /> Add Tournament</Button>
        <Button size="sm" variant="secondary" onClick={save}><Save className="h-4 w-4" /> Save All</Button>
      </div>
      <div className="space-y-4 max-w-2xl">
        {tournaments.map((t, i) => (
          <Card key={t.id}>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Title</Label>
                <button type="button" onClick={() => setTournaments(tournaments.filter((x) => x.id !== t.id))} className="text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Input value={t.title} onChange={(e) => { const n = [...tournaments]; n[i] = { ...t, title: e.target.value }; setTournaments(n); }} />
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date</Label><Input type="date" value={t.date} onChange={(e) => { const n = [...tournaments]; n[i] = { ...t, date: e.target.value }; setTournaments(n); }} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={t.status} onChange={(e) => { const n = [...tournaments]; n[i] = { ...t, status: e.target.value as Tournament["status"] }; setTournaments(n); }}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </Select>
                </div>
              </div>
              <div><Label>Description</Label><Textarea rows={2} value={t.description} onChange={(e) => { const n = [...tournaments]; n[i] = { ...t, description: e.target.value }; setTournaments(n); }} /></div>
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={t.registrationOpen} onChange={(e) => { const n = [...tournaments]; n[i] = { ...t, registrationOpen: e.target.checked }; setTournaments(n); }} />
                Registration open
              </label>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
