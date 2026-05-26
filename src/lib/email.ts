import { promises as fs } from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), "data", "email-log.json");

interface EmailLog {
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

async function logEmail(entry: EmailLog) {
  try {
    let logs: EmailLog[] = [];
    try {
      const raw = await fs.readFile(LOG_PATH, "utf-8");
      logs = JSON.parse(raw) as EmailLog[];
    } catch {
      /* empty */
    }
    logs.unshift(entry);
    await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
    await fs.writeFile(LOG_PATH, JSON.stringify(logs.slice(0, 100), null, 2));
  } catch (e) {
    console.error("Email log failed:", e);
  }
}

/** Logs email locally. Configure SMTP via external service or Resend API in production. */
export async function sendEmail(to: string, subject: string, body: string) {
  const entry: EmailLog = { to, subject, body, sentAt: new Date().toISOString() };
  await logEmail(entry);
  console.info(`[Email] To: ${to} | ${subject}`);
  return entry;
}

export function bookingReceivedEmail(name: string, bookingId: string, date: string, slot: string) {
  return {
    subject: "Booking Request Received — Crossline Cricket Stadium",
    body: `Dear ${name},

Thank you for booking with Crossline Cricket Stadium!

Your booking request (${bookingId}) has been received and is pending admin approval.

Date: ${date}
Slot: ${slot}

You will receive a confirmation email once your booking is approved.

— Crossline Cricket Stadium
crosslinecricketstadium.in`,
  };
}

export function bookingApprovedEmail(name: string, bookingId: string, date: string, slot: string) {
  return {
    subject: "Booking Confirmed — Crossline Cricket Stadium",
    body: `Dear ${name},

Great news! Your booking (${bookingId}) has been APPROVED.

Date: ${date}
Slot: ${slot}

Please arrive 15 minutes before your session. Remaining payment can be made at the stadium.

See you at the ground!

— Crossline Cricket Stadium`,
  };
}

export function bookingRejectedEmail(name: string, bookingId: string) {
  return {
    subject: "Booking Update — Crossline Cricket Stadium",
    body: `Dear ${name},

We regret to inform you that your booking request (${bookingId}) could not be confirmed at this time.

Please contact us or try another date/slot.

— Crossline Cricket Stadium`,
  };
}
