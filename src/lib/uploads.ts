import { promises as fs } from "fs";
import path from "path";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export function galleryUploadDir(): string {
  if (isServerless()) {
    return path.join("/tmp", "crossline-uploads", "gallery");
  }
  return path.join(process.cwd(), "public", "uploads", "gallery");
}

export function galleryPublicUrl(filename: string): string {
  if (isServerless()) {
    return `/api/uploads/gallery/${filename}`;
  }
  return `/uploads/gallery/${filename}`;
}

import { filenameFromGallerySrc as sharedFilenameFromGallerySrc } from "./uploads-shared";

export { isUploadedGalleryPath, filenameFromGallerySrc } from "./uploads-shared";

export async function saveGalleryImage(
  file: File
): Promise<{ url: string; filename: string }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, WebP, and GIF images are allowed");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const filename = `gallery-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const dir = galleryUploadDir();
  await fs.mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return { url: galleryPublicUrl(filename), filename };
}

export async function deleteGalleryImage(src: string): Promise<void> {
  const filename = sharedFilenameFromGallerySrc(src);
  if (!filename) return;

  const filePath = path.join(galleryUploadDir(), filename);
  try {
    await fs.unlink(filePath);
  } catch {
    /* file may not exist */
  }
}

export async function readGalleryFile(filename: string): Promise<Buffer | null> {
  const safe = path.basename(filename);
  const filePath = path.join(galleryUploadDir(), safe);
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

export function contentTypeForFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}
