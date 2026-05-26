"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Radio, Loader2 } from "lucide-react";

export default function AdminStreamPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminStore().then(({ store }) => {
      setTitle(store.liveStream.title);
      setUrl(store.liveStream.youtubeUrl);
      setIsLive(store.liveStream.isLive);
      setEnabled(store.liveStream.enabled);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await patchAdmin("liveStream", { title, youtubeUrl: url, isLive, enabled });
      toast("Live stream settings saved", "success");
    } catch {
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Live Video">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Live Video Management">
      <div className="max-w-2xl space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Radio className="h-8 w-8 text-[#ED1C24]" />
            <div>
              <h2 className="font-semibold text-white">YouTube Unlisted Live</h2>
              <p className="text-sm text-slate-400">Paste embed URL (youtube.com/embed/VIDEO_ID)</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Match Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="url">YouTube Embed URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 accent-[#ED1C24]" />
              <span className="text-sm text-white">Enable stream on website</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} className="h-4 w-4 accent-[#ED1C24]" />
              <span className="text-sm text-white">Show &quot;Live Now&quot; badge</span>
            </label>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Stream Settings
            </Button>
          </div>
        </Card>
        {enabled && url && (
          <Card className="p-0 overflow-hidden">
            <p className="p-3 text-sm text-slate-400 border-b border-white/10">Preview</p>
            <div className="aspect-video">
              <iframe src={url} title={title} className="w-full h-full" allowFullScreen />
            </div>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}
