import { NextRequest, NextResponse } from "next/server";
import { updateStore, generateId } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim() || !body.email?.trim() || !body.subject?.trim() || !body.message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const message = {
      id: generateId("CM"),
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim(),
      subject: body.subject.trim(),
      message: body.message.trim(),
      createdAt: new Date().toISOString(),
    };

    await updateStore((s) => ({
      ...s,
      contactMessages: [message, ...s.contactMessages],
    }));

    return NextResponse.json({ success: true, message: "Message sent successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
