import { promises as fs } from "fs";
import path from "path";
import nodemailer from "nodemailer";

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

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendEmail(to: string, subject: string, body: string) {
  const entry: EmailLog = { to, subject, body, sentAt: new Date().toISOString() };
  await logEmail(entry);

  const transporter = createTransporter();
  if (transporter) {
    const from = process.env.ADMIN_EMAIL ?? process.env.EMAIL_USER;
    await transporter.sendMail({
      from: `Crossline Cricket Stadium <${from}>`,
      to,
      subject,
      text: body,
    });
    console.info(`[Email sent] To: ${to} | ${subject}`);
  } else {
    console.info(`[Email logged — configure EMAIL_USER & EMAIL_PASS] To: ${to} | ${subject}`);
  }

  return entry;
}

export function bookingReceivedEmail(
  name: string,
  bookingId: string,
  date: string,
  slot: string
) {
  return {
    subject: "Booking Request Received — Crossline Cricket Stadium",
    body: `Dear ${name},

Thank you for your interest in Crossline Cricket Stadium!

Your booking request (${bookingId}) has been received and is pending admin approval.

Date: ${date}
Slot: ${slot}

You will receive a confirmation email once your booking is approved.

— Crossline Cricket Stadium
crosslinecricketstadium.in`,
  };
}

export function bookingApprovedEmail(
  name: string,
  bookingId: string,
  date: string,
  slot: string,
  price: number
) {
  return {
    subject: "Booking Confirmed — Crossline Cricket Stadium",
    body: `Dear ${name},

Great news! Your booking (${bookingId}) has been APPROVED.

Date: ${date}
Slot: ${slot}
Slot Price: ₹${price.toLocaleString("en-IN")}

Please arrive 15 minutes before your session. For any queries, contact us at the stadium.

See you at the ground!

— Crossline Cricket Stadium`,
  };
}

export function bookingRejectedEmail(
  name: string,
  bookingId: string,
  date: string,
  slot: string
) {
  return {
    subject: "Booking Update — Crossline Cricket Stadium",
    body: `Dear ${name},

We regret to inform you that your booking request (${bookingId}) for ${date} (${slot}) could not be confirmed at this time.

The slot is now available for other bookings. Please contact us or try another date/slot on our website.

— Crossline Cricket Stadium`,
  };
}
