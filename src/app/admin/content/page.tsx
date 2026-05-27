"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import type { SiteContent } from "@/lib/types";
import { Loader2, Save } from "lucide-react";

export default function AdminContentPage() {
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminStore().then(({ store }) => {
      setContent(store.siteContent);
      setLoading(false);
    });
  }, []);

  const saveContent = async () => {
    if (!content) return;
    setSaving(true);
    try {
      await patchAdmin("siteContent", content);
      toast("About & testimonials saved", "success");
    } catch {
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <AdminShell title="Website Content">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Website Content">
      <div className="space-y-8 max-w-3xl">
        <Card className="space-y-4">
          <h2 className="font-semibold text-[var(--navy)]">About Section</h2>
          <div>
            <Label>Title</Label>
            <Input value={content.aboutTitle} onChange={(e) => setContent({ ...content, aboutTitle: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={content.aboutDescription} onChange={(e) => setContent({ ...content, aboutDescription: e.target.value })} />
          </div>
          <div>
            <Label>Bullet points (one per line)</Label>
            <Textarea
              rows={4}
              value={content.aboutPoints.join("\n")}
              onChange={(e) => setContent({ ...content, aboutPoints: e.target.value.split("\n").filter(Boolean) })}
            />
          </div>
          <Button onClick={saveContent} disabled={saving}><Save className="h-4 w-4" /> Save About</Button>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-[var(--navy)]">Testimonials</h2>
          {content.testimonials.map((t, i) => (
            <div key={i} className="p-4 rounded-xl admin-subtle space-y-2">
              <Input value={t.name} onChange={(e) => {
                const testimonials = [...content.testimonials];
                testimonials[i] = { ...t, name: e.target.value };
                setContent({ ...content, testimonials });
              }} placeholder="Name" />
              <Input value={t.role} onChange={(e) => {
                const testimonials = [...content.testimonials];
                testimonials[i] = { ...t, role: e.target.value };
                setContent({ ...content, testimonials });
              }} placeholder="Role" />
              <Textarea rows={2} value={t.text} onChange={(e) => {
                const testimonials = [...content.testimonials];
                testimonials[i] = { ...t, text: e.target.value };
                setContent({ ...content, testimonials });
              }} />
            </div>
          ))}
          <Button variant="outline" onClick={saveContent} disabled={saving}>Save Testimonials</Button>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-[var(--navy)]">Contact Details</h2>
          <div>
            <Label>Email</Label>
            <Input value={content.contactEmail} onChange={(e) => setContent({ ...content, contactEmail: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={content.contactPhone} onChange={(e) => setContent({ ...content, contactPhone: e.target.value })} />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea rows={2} value={content.contactAddress} onChange={(e) => setContent({ ...content, contactAddress: e.target.value })} />
          </div>
          <div>
            <Label>Hours</Label>
            <Input value={content.contactHours} onChange={(e) => setContent({ ...content, contactHours: e.target.value })} />
          </div>
          <Button onClick={saveContent} disabled={saving}><Save className="h-4 w-4" /> Save Contact</Button>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-[var(--navy)]">Gallery</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Upload and manage images from the{" "}
            <a href="/admin/gallery" className="font-semibold text-[var(--brand-red)] hover:underline">
              Gallery module
            </a>
            .
          </p>
        </Card>
      </div>
    </AdminShell>
  );
}
