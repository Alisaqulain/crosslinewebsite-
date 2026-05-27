import { NextRequest, NextResponse } from "next/server";
import { contentTypeForFilename, readGalleryFile } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filename = segments?.[segments.length - 1];

  if (!filename || segments[0] !== "gallery") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await readGalleryFile(filename);
  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentTypeForFilename(filename),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
