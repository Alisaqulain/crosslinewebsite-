import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { deleteGalleryImage, saveGalleryImage } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const { url, filename } = await saveGalleryImage(file);
    return NextResponse.json({ url, filename });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();

  const src = req.nextUrl.searchParams.get("src");
  if (!src) {
    return NextResponse.json({ error: "src parameter required" }, { status: 400 });
  }

  try {
    await deleteGalleryImage(src);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
