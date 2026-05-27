"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import type { GalleryItem } from "@/lib/types";
import { Image, Loader2, Plus, Save, Trash2 } from "lucide-react";
import ImageNext from "next/image";

export default function AdminGalleryPage() {
  const { toast } = useToast();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ src: "", alt: "", category: "Ground" });

  useEffect(() => {
    fetchAdminStore().then(({ store }) => {
      setGallery(store.gallery);
      setLoading(false);
    });
  }, []);

  const save = async (data: GalleryItem[]) => {
    setSaving(true);
    try {
      await patchAdmin("gallery", data);
      setGallery(data);
      toast("Gallery saved", "success");
    } catch {
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    if (!form.src) return;
    const item: GalleryItem = {
      id: `G-${Date.now().toString(36)}`,
      type: "image",
      src: form.src,
      alt: form.alt || "Stadium photo",
      category: form.category,
    };
    save([item, ...gallery]);
    setForm({ src: "", alt: "", category: "Ground" });
  };

  if (loading) {
    return (
      <AdminShell title="Gallery">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Gallery Management">
      <Card className="mb-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Image className="h-5 w-5" />
          Add Image (URL)
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label>Image URL</Label>
            <Input value={form.src} onChange={(e) => setForm({ ...form, src: e.target.value })} placeholder="https://..." className="mt-1" />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label>Title / Alt</Label>
            <Input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} className="mt-1" />
          </div>
        </div>
        <Button className="mt-4" onClick={addImage} disabled={saving}>
          <Plus className="h-4 w-4" />
          Add to Gallery
        </Button>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.map((item) => (
          <Card key={item.id} className="!p-0 overflow-hidden">
            <div className="relative h-40">
              <ImageNext src={item.src} alt={item.alt} fill className="object-cover" unoptimized />
            </div>
            <div className="p-4 flex justify-between items-start gap-2">
              <div>
                <p className="text-sm font-medium text-white">{item.alt}</p>
                <p className="text-xs text-slate-500">{item.category}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => save(gallery.filter((g) => g.id !== item.id))}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
