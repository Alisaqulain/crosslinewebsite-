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
      toast("Website content saved", "success");
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

  const addGalleryImage = () => {
    if (!newImage.src || !newImage.alt) return;
    setGallery([
      { id: `G-${Date.now()}`, type: "image", src: newImage.src, alt: newImage.alt, category: newImage.category },
      ...gallery,
    ]);
    setNewImage({ src: "", alt: "", category: "Stadium" });
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
    <AdminShell title="Website Content Management">
      <div className="space-y-8 max-w-3xl">
        <Card className="space-y-4">
          <h2 className="font-semibold text-white">Homepage Hero</h2>
          <div>
            <Label>Headline</Label>
            <Input value={content.heroHeadline} onChange={(e) => setContent({ ...content, heroHeadline: e.target.value })} />
          </div>
          <div>
            <Label>Subheadline</Label>
            <Textarea rows={2} value={content.heroSubheadline} onChange={(e) => setContent({ ...content, heroSubheadline: e.target.value })} />
          </div>
          <div>
            <Label>Badge Text</Label>
            <Input value={content.heroBadge} onChange={(e) => setContent({ ...content, heroBadge: e.target.value })} />
          </div>
          <Button onClick={saveContent} disabled={saving}>
            <Save className="h-4 w-4" /> Save Homepage Content
          </Button>
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
          <h2 className="font-semibold text-white">Gallery Images</h2>
          <div className="grid sm:grid-cols-3 gap-2">
            <Input placeholder="Image URL" value={newImage.src} onChange={(e) => setNewImage({ ...newImage, src: e.target.value })} />
            <Input placeholder="Alt text" value={newImage.alt} onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })} />
            <Input placeholder="Category" value={newImage.category} onChange={(e) => setNewImage({ ...newImage, category: e.target.value })} />
          </div>
          <Button variant="outline" onClick={addGalleryImage}>
            <Plus className="h-4 w-4" /> Add Image
          </Button>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {gallery.slice(0, 15).map((g) => (
              <div key={g.id} className="flex justify-between items-center p-2 rounded-lg bg-[#0b1219] text-sm">
                <span className="text-slate-300 truncate flex-1">{g.alt}</span>
                <button type="button" onClick={() => setGallery(gallery.filter((x) => x.id !== g.id))} className="text-red-400 ml-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <Button onClick={saveGallery} disabled={saving}>
            <Save className="h-4 w-4" /> Save Gallery ({gallery.length} items)
          </Button>
        </Card>
      </div>
    </AdminShell>
  );
}
