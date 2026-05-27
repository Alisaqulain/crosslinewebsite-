"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { deleteAdminImage, fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { isUploadedGalleryPath } from "@/lib/uploads-shared";
import type { GalleryItem } from "@/lib/types";
import { Image, Loader2, Plus, Trash2 } from "lucide-react";
import ImageNext from "next/image";

export default function AdminGalleryPage() {
  const { toast } = useToast();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [form, setForm] = useState({ alt: "", category: "Ground" });
  const [uploadKey, setUploadKey] = useState(0);

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

  const addImage = async () => {
    if (!uploadedUrl) {
      toast("Please upload an image first", "error");
      return;
    }
    const item: GalleryItem = {
      id: `G-${Date.now().toString(36)}`,
      type: "image",
      src: uploadedUrl,
      alt: form.alt || "Stadium photo",
      category: form.category,
    };
    await save([item, ...gallery]);
    setUploadedUrl("");
    setForm({ alt: "", category: "Ground" });
    setUploadKey((k) => k + 1);
  };

  const removeImage = async (item: GalleryItem) => {
    if (isUploadedGalleryPath(item.src)) {
      try {
        await deleteAdminImage(item.src);
      } catch {
        /* continue removing from gallery even if file delete fails */
      }
    }
    await save(gallery.filter((g) => g.id !== item.id));
  };

  if (loading) {
    return (
      <AdminShell title="Gallery">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-red)]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Gallery Management">
      <Card className="mb-6">
        <h3 className="font-semibold text-[var(--navy)] mb-4 flex items-center gap-2">
          <Image className="h-5 w-5 text-[var(--brand-red)]" />
          Upload Gallery Image
        </h3>
        <div className="grid lg:grid-cols-2 gap-6">
          <ImageUploadField
            key={uploadKey}
            label="Select Image from Device"
            onUploaded={(url) => {
              setUploadedUrl(url);
              toast("Image uploaded", "success");
            }}
          />
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Ground, Academy, Tournament..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Title / Description</Label>
              <Input
                value={form.alt}
                onChange={(e) => setForm({ ...form, alt: e.target.value })}
                placeholder="Evening session under floodlights"
                className="mt-1"
              />
            </div>
            <Button className="w-full sm:w-auto min-h-[48px]" onClick={addImage} disabled={saving || !uploadedUrl}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add to Gallery
            </Button>
            {!uploadedUrl && (
              <p className="text-xs text-[var(--text-muted)]">Upload an image above, then click Add to Gallery.</p>
            )}
          </div>
        </div>
      </Card>

      <p className="text-sm text-[var(--text-muted)] mb-4">{gallery.length} image(s) in gallery</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.map((item) => (
          <Card key={item.id} className="!p-0 overflow-hidden group">
            <div className="relative h-44">
              <ImageNext src={item.src} alt={item.alt} fill className="object-cover" unoptimized />
            </div>
            <div className="p-4 flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--navy)] truncate">{item.alt}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.category}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeImage(item)} disabled={saving}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
