export function isUploadedGalleryPath(src: string): boolean {
  return src.startsWith("/uploads/gallery/") || src.startsWith("/api/uploads/gallery/");
}

export function filenameFromGallerySrc(src: string): string | null {
  const match = src.match(/\/(?:api\/)?uploads\/gallery\/([^/?#]+)/);
  return match?.[1] ?? null;
}
