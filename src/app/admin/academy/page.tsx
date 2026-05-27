"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import type { AcademyContent } from "@/lib/types";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

export default function AdminAcademyPage() {
  const { toast } = useToast();
  const [academy, setAcademy] = useState<AcademyContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStore().then(({ store }) => {
      setAcademy(store.academy);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    if (!academy) return;
    try {
      await patchAdmin("academy", academy);
      toast("Academy content saved", "success");
    } catch {
      toast("Save failed", "error");
    }
  };

  if (loading || !academy) {
    return (
      <AdminShell title="Academy">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Sports Academy">
      <div className="max-w-2xl space-y-6">
        <Card className="space-y-4">
          <div><Label>Headline</Label><Input value={academy.headline} onChange={(e) => setAcademy({ ...academy, headline: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={3} value={academy.description} onChange={(e) => setAcademy({ ...academy, description: e.target.value })} /></div>
        </Card>
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-[var(--navy)]">Programs</h2>
          <Button size="sm" onClick={() => setAcademy({ ...academy, programs: [{ id: `A-${Date.now()}`, title: "New Program", description: "", duration: "", level: "beginner" }, ...academy.programs] })}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {academy.programs.map((p, i) => (
          <Card key={p.id} className="space-y-3">
            <div className="flex justify-end">
              <button type="button" onClick={() => setAcademy({ ...academy, programs: academy.programs.filter((x) => x.id !== p.id) })} className="text-red-400"><Trash2 className="h-4 w-4" /></button>
            </div>
            <Input value={p.title} onChange={(e) => { const programs = [...academy.programs]; programs[i] = { ...p, title: e.target.value }; setAcademy({ ...academy, programs }); }} placeholder="Title" />
            <Textarea rows={2} value={p.description} onChange={(e) => { const programs = [...academy.programs]; programs[i] = { ...p, description: e.target.value }; setAcademy({ ...academy, programs }); }} />
            <div className="grid grid-cols-2 gap-3">
              <Input value={p.duration} onChange={(e) => { const programs = [...academy.programs]; programs[i] = { ...p, duration: e.target.value }; setAcademy({ ...academy, programs }); }} placeholder="Duration" />
              <Select value={p.level} onChange={(e) => { const programs = [...academy.programs]; programs[i] = { ...p, level: e.target.value as typeof p.level }; setAcademy({ ...academy, programs }); }}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all">All Levels</option>
              </Select>
            </div>
          </Card>
        ))}
        <Button onClick={save}><Save className="h-4 w-4" /> Save Academy</Button>
      </div>
    </AdminShell>
  );
}
