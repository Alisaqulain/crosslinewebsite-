"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import type { GalleryItem, SiteContent } from "@/lib/types";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

export default function AdminContentPage() {
  const { toast } = useToast();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImage, setNewImage] = useState({ src: "", alt: "", category: "Stadium" });

  useEffect(() => {
    fetchAdminStore().then(({ store }) => {
      setContent(store.siteContent);
      setGallery(store.gallery);
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

  const saveGallery = async () => {
    setSaving(true);
    try {
      await patchAdmin("gallery", gallery);
      toast("Gallery saved", "success");
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
          <h2 className="font-semibold text-white">About Section</h2>
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
          <h2 className="font-semibold text-white">Testimonials</h2>
          {content.testimonials.map((t, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#0b1219] space-y-2">
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
          <h2 className="font-semibold text-white">Contact Details</h2>
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
          <h2 className="font-semibold text-white">Gallery</h2>
          <p className="text-xs text-slate-500">For full gallery management, use the Gallery module.</p>
          <div className="grid sm:grid-cols-3 gap-2">
            <Input placeholder="Image URL" value={newImage.src} onChange={(e) => setNewImage({ ...newImage, src: e.target.value })} />
            <Input placeholder="Alt" value={newImage.alt} onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })} />
            <Input placeholder="Category" value={newImage.category} onChange={(e) => setNewImage({ ...newImage, category: e.target.value })} />
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            if (!newImage.src || !newImage.alt) return;
            setGallery([{ id: `G-${Date.now()}`, type: "image", ...newImage }, ...gallery]);
            setNewImage({ src: "", alt: "", category: "Stadium" });
          }}>
            <Plus className="h-4 w-4" /> Add
          </Button>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {gallery.slice(0, 20).map((g) => (
              <div key={g.id} className="flex justify-between text-sm text-slate-300 p-2 bg-[#0b1219] rounded-lg">
                <span className="truncate">{g.alt}</span>
                <button type="button" onClick={() => setGallery(gallery.filter((x) => x.id !== g.id))} className="text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <Button onClick={saveGallery} disabled={saving}><Save className="h-4 w-4" /> Save Gallery</Button>
        </Card>
      </div>
    </AdminShell>
  );
}
