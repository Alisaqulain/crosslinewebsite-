export const APP_VERSION = "1.2.0";
export const APP_NAME = "Crossline Cricket Stadium";

export interface UpdateEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

/** Latest changes — newest first */
export const CHANGELOG: UpdateEntry[] = [
  {
    version: "1.2.0",
    date: "2026-05-27",
    title: "Payments, expenses & fixes",
    items: [
      "Other expenses page — ground purchases save correctly to database",
      "Dashboard shows cash received, udhari, day/night income & expenses",
      "Income uses money received (not full session price until paid)",
      "Ball purchase: price per ball × quantity = correct total",
      "Delete booking button for wrong entries",
      "Ball quality is free text (no dropdown)",
      "Udhari page — who owes how much",
      "Amount received on website & walk-in bookings",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-05-26",
    title: "Booking & admin workflow",
    items: [
      "Approve booking first; assign balls after match separately",
      "One booking per session (pending holds slot until admin decides)",
      "Admin-managed ball qualities (later changed to text input)",
      "Other expenses admin module",
      "Gallery image upload",
      "Bilingual booking emails (English + Hindi)",
      "Environment check page at /check",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-05-20",
    title: "Initial release",
    items: [
      "Public site: booking, academy, tournaments, gallery, contact",
      "Admin: bookings, slots, diesel, ball stock, finance, content",
      "MongoDB + email notifications",
      "Walk-in bookings and profit & loss dashboard",
    ],
  },
];

export function getLatestUpdate(): UpdateEntry {
  return CHANGELOG[0];
}
