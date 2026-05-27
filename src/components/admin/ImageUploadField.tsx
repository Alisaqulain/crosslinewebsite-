"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { uploadAdminImage } from "@/lib/api-client";

interface Props {
  onUploaded: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUploadField({ onUploaded, label = "Upload Image", className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const { url } = await uploadAdminImage(file);
      onUploaded(url);
      URL.revokeObjectURL(objectUrl);
      setPreview(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onInputChange}
      />

      {preview ? (
        <div className="mt-2 relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-alt)]">
          <div className="relative h-44 w-full">
            <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={clearPreview}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
              aria-label="Remove preview"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          disabled={uploading}
          className={cn(
            "mt-2 w-full min-h-[140px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-6 transition-colors",
            dragOver
              ? "border-[var(--brand-red)] bg-[var(--brand-red)]/5"
              : "border-[var(--border)] bg-[var(--bg-alt)]/50 hover:border-[var(--cricket-green)] hover:bg-[var(--cricket-green)]/5"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-red)]" />
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <ImagePlus className="h-6 w-6 text-[var(--brand-red)]" />
              </div>
              <span className="text-sm font-semibold text-[var(--navy)]">Click or drag image here</span>
              <span className="text-xs text-[var(--text-muted)]">JPG, PNG, WebP, GIF · Max 5 MB</span>
            </>
          )}
        </button>
      )}

      {!preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          Choose File
        </Button>
      )}

      {error && <p className="mt-2 text-sm text-[var(--brand-red)]">{error}</p>}
    </div>
  );
}
