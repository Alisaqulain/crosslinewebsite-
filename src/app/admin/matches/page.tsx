"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import type { StadiumMatch, StadiumMatchStatus } from "@/lib/types";
import { Loader2, Plus, Save } from "lucide-react";

const emptyMatch = (): StadiumMatch => ({
  id: `M-${Date.now().toString(36).toUpperCase()}`,
  title: "",
  teamA: "",
  teamB: "",
  date: new Date().toISOString().split("T")[0],
  time: "18:00",
  ground: "Main Ground",
  status: "upcoming",
  notes: "",
});

export default function AdminMatchesPage() {
  const { toast } = useToast();
  const [matches, setMatches] = useState<StadiumMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<StadiumMatch | null>(null);

  const load = () => {
    fetchAdminStore().then(({ store }) => {
      setMatches(store.matches);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await patchAdmin("matches", matches);
      toast("Matches saved", "success");
      setEditing(null);
    } catch {
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const addMatch = () => {
    const m = emptyMatch();
    setMatches([m, ...matches]);
    setEditing(m);
  };

  const updateEditing = (patch: Partial<StadiumMatch>) => {
    if (!editing) return;
    const updated = { ...editing, ...patch };
    setEditing(updated);
    setMatches(matches.map((m) => (m.id === updated.id ? updated : m)));
  };

  if (loading) {
    return (
      <AdminShell title="Match Management">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Match Management">
      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={addMatch} variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          Add Match
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All
        </Button>
      </div>

      {editing && (
        <Card className="mb-6 space-y-4">
          <h3 className="font-semibold text-[var(--navy)]">Edit Match</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Match Title</Label>
              <Input value={editing.title} onChange={(e) => updateEditing({ title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Team A</Label>
              <Input value={editing.teamA} onChange={(e) => updateEditing({ teamA: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Team B</Label>
              <Input value={editing.teamB} onChange={(e) => updateEditing({ teamB: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={editing.date} onChange={(e) => updateEditing({ date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={editing.time} onChange={(e) => updateEditing({ time: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Ground / Slot</Label>
              <Input value={editing.ground} onChange={(e) => updateEditing({ ground: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editing.status}
                onChange={(e) => updateEditing({ status: e.target.value as StadiumMatchStatus })}
                className="mt-1"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={editing.notes ?? ""} onChange={(e) => updateEditing({ notes: e.target.value })} rows={2} className="mt-1" />
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
            Done editing
          </Button>
        </Card>
      )}

      <Card className="p-0 md:p-6">
        <ResponsiveTable
          data={matches}
          rowKey={(m) => m.id}
          emptyMessage="No matches yet"
          columns={[
            { key: "title", header: "Title", render: (m) => m.title },
            {
              key: "teams",
              header: "Teams",
              render: (m) => `${m.teamA} vs ${m.teamB}`,
            },
            {
              key: "date",
              header: "Date / Time",
              render: (m) => `${formatDate(m.date)} · ${m.time}`,
            },
            { key: "ground", header: "Ground", render: (m) => m.ground },
            {
              key: "status",
              header: "Status",
              render: (m) => <span className="capitalize">{m.status}</span>,
            },
            {
              key: "edit",
              header: "",
              render: (m) => (
                <Button size="sm" variant="ghost" onClick={() => setEditing(m)}>
                  Edit
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </AdminShell>
  );
}
