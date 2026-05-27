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

export interface EmailContent {
  subject: string;
  body: string;
  html: string;
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

function getEmailCredentials() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim().replace(/\s+/g, "");
  if (!user || !pass) return null;
  return { user, pass };
}

export function getEmailPassLength(): number {
  return process.env.EMAIL_PASS?.trim().replace(/\s+/g, "").length ?? 0;
}

function createTransporter() {
  const creds = getEmailCredentials();
  if (!creds) return null;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT?.trim() || 587);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: creds,
    tls: { minVersion: "TLSv1.2" },
  });
}

function friendlySmtpError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "SMTP verification failed";
  if (msg.includes("BadCredentials") || msg.includes("535") || msg.includes("Username and Password not accepted")) {
    return "Gmail rejected login — use a 16-character App Password (not your normal Gmail password). Enable 2-Step Verification first, then create one at myaccount.google.com/apppasswords";
  }
  return msg;
}

export async function verifyEmailConnection(): Promise<{ ok: boolean; message: string }> {
  const transporter = createTransporter();
  if (!transporter) {
    return { ok: false, message: "EMAIL_USER or EMAIL_PASS is not set" };
  }
  try {
    await transporter.verify();
    return { ok: true, message: "Gmail SMTP connection verified" };
  } catch (err) {
    return {
      ok: false,
      message: friendlySmtpError(err),
    };
  }
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

function bilingualHtml(enTitle: string, enBody: string, hiTitle: string, hiBody: string): string {
  const linesToHtml = (text: string) =>
    text
      .split("\n")
      .map((line) => (line.trim() ? `<p style="margin:0 0 8px;line-height:1.6">${line}</p>` : ""))
      .join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;color:#0a1a3a;max-width:600px;margin:0 auto;padding:20px">
  <div style="border-bottom:3px solid #e31837;padding-bottom:12px;margin-bottom:20px">
    <strong style="font-size:18px;color:#0a1a3a">Crossline Cricket Stadium</strong>
    <span style="color:#1f8a3c"> &amp; Sports Academy</span>
  </div>
  <div style="margin-bottom:28px">
    <h2 style="color:#e31837;font-size:16px;margin:0 0 12px">${enTitle}</h2>
    ${linesToHtml(enBody)}
  </div>
  <hr style="border:none;border-top:2px solid #1f8a3c;margin:24px 0" />
  <div>
    <h2 style="color:#1f8a3c;font-size:16px;margin:0 0 12px">${hiTitle}</h2>
    ${linesToHtml(hiBody)}
  </div>
  <p style="margin-top:28px;font-size:12px;color:#5a6b82">crosslinecricketstadium.in</p>
</body>
</html>`;
}

function buildBilingual(en: { title: string; lines: string[] }, hi: { title: string; lines: string[] }, subject: string): EmailContent {
  const enBody = en.lines.join("\n");
  const hiBody = hi.lines.join("\n");
  const body = `${en.title}\n${enBody}\n\n${"─".repeat(40)}\n\n${hi.title}\n${hiBody}`;
  const html = bilingualHtml(en.title, enBody, hi.title, hiBody);
  return { subject, body, html };
}

export async function sendEmail(to: string, content: EmailContent) {
  const entry: EmailLog = {
    to,
    subject: content.subject,
    body: content.body,
    sentAt: new Date().toISOString(),
  };
  await logEmail(entry);

  const transporter = createTransporter();
  if (transporter) {
    const from = process.env.ADMIN_EMAIL ?? process.env.EMAIL_USER;
    await transporter.sendMail({
      from: `Crossline Cricket Stadium <${from}>`,
      to,
      subject: content.subject,
      text: content.body,
      html: content.html,
    });
    console.info(`[Email sent] To: ${to} | ${content.subject}`);
  } else {
    console.info(`[Email logged — configure EMAIL_USER & EMAIL_PASS] To: ${to} | ${content.subject}`);
  }

  return entry;
}

export function bookingReceivedEmail(
  name: string,
  bookingId: string,
  date: string,
  slot: string
): EmailContent {
  return buildBilingual(
    {
      title: "Booking Request Received",
      lines: [
        `Dear ${name},`,
        "",
        "Thank you for choosing Crossline Cricket Stadium!",
        "",
        `Your booking request (${bookingId}) has been received and is pending admin approval.`,
        "",
        `Date: ${date}`,
        `Slot: ${slot}`,
        "",
        "You will receive a confirmation email once your booking is approved.",
        "",
        "— Crossline Cricket Stadium Team",
      ],
    },
    {
      title: "बुकिंग अनुरोध प्राप्त हुआ",
      lines: [
        `प्रिय ${name},`,
        "",
        "क्रॉसलाइन क्रिकेट स्टेडियम चुनने के लिए धन्यवाद!",
        "",
        `आपका बुकिंग अनुरोध (${bookingId}) प्राप्त हो गया है और एडमिन की स्वीकृति के लिए लंबित है।`,
        "",
        `तिथि: ${date}`,
        `स्लॉट: ${slot}`,
        "",
        "एडमिन की स्वीकृति के बाद आपको पुष्टि ईमेल भेजा जाएगा।",
        "",
        "— क्रॉसलाइन क्रिकेट स्टेडियम टीम",
      ],
    },
    "Booking Request Received | बुकिंग अनुरोध प्राप्त — Crossline Cricket Stadium"
  );
}

export function bookingApprovedEmail(
  name: string,
  bookingId: string,
  date: string,
  slot: string,
  price: number
): EmailContent {
  const priceStr = `₹${price.toLocaleString("en-IN")}`;
  return buildBilingual(
    {
      title: "Booking Confirmed!",
      lines: [
        `Dear ${name},`,
        "",
        "Great news! Your booking has been APPROVED.",
        "",
        `Booking ID: ${bookingId}`,
        `Date: ${date}`,
        `Slot: ${slot}`,
        `Slot Price: ${priceStr}`,
        "",
        "Please arrive 15 minutes before your session.",
        "For queries, contact us at the stadium.",
        "",
        "See you at the ground!",
        "",
        "— Crossline Cricket Stadium Team",
      ],
    },
    {
      title: "बुकिंग की पुष्टि!",
      lines: [
        `प्रिय ${name},`,
        "",
        "खुशखबरी! आपकी बुकिंग स्वीकृत हो गई है।",
        "",
        `बुकिंग आईडी: ${bookingId}`,
        `तिथि: ${date}`,
        `स्लॉट: ${slot}`,
        `स्लॉट की कीमत: ${priceStr}`,
        "",
        "कृपया अपने सेशन से 15 मिनट पहले पहुँचें।",
        "किसी भी प्रश्न के लिए स्टेडियम पर संपर्क करें।",
        "",
        "मैदान पर मिलते हैं!",
        "",
        "— क्रॉसलाइन क्रिकेट स्टेडियम टीम",
      ],
    },
    "Booking Confirmed | बुकिंग की पुष्टि — Crossline Cricket Stadium"
  );
}

export function bookingRejectedEmail(
  name: string,
  bookingId: string,
  date: string,
  slot: string
): EmailContent {
  return buildBilingual(
    {
      title: "Booking Update",
      lines: [
        `Dear ${name},`,
        "",
        `We regret to inform you that your booking request (${bookingId}) for ${date} (${slot}) could not be confirmed at this time.`,
        "",
        "The slot is now available for other bookings.",
        "Please contact us or try another date/slot on our website.",
        "",
        "— Crossline Cricket Stadium Team",
      ],
    },
    {
      title: "बुकिंग अपडेट",
      lines: [
        `प्रिय ${name},`,
        "",
        `हमें खेद है कि ${date} (${slot}) के लिए आपका बुकिंग अनुरोध (${bookingId}) इस समय स्वीकृत नहीं किया जा सका।`,
        "",
        "यह स्लॉट अब अन्य बुकिंग के लिए उपलब्ध है।",
        "कृपया हमसे संपर्क करें या वेबसाइट पर कोई अन्य तिथि/स्लॉट आज़माएँ।",
        "",
        "— क्रॉसलाइन क्रिकेट स्टेडियम टीम",
      ],
    },
    "Booking Update | बुकिंग अपडेट — Crossline Cricket Stadium"
  );
}
