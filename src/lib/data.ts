import type { TimeSlot } from "./types";
import { galleryMedia } from "./media";

export const ADVANCE_PERCENTAGE = 25;

export const stadiumInfo = {
  name: "Crossline Cricket Stadium & Sports Academy",
  tagline: "Where Champions Are Made",
  address:
    "Near Railway Crossing, Adjacent NH 58, Sandhawali, Muzaffarnagar, Uttar Pradesh, India",
  addressShort: "Sandhawali, Muzaffarnagar, UP — Adjacent NH 58",
  email: "info@crosslinecricketstadium.in",
  website: "https://crosslinecricketstadium.in",
  hours: "6:00 AM – 11:00 PM (Daily)",
  capacity: "Full Ground · 22 Players",
};

export const stadiumContacts = [
  { name: "Zuhair Abbas", phone: "7500000110", tel: "+917500000110" },
  { name: "Nafse Ali", phone: "8908110786", tel: "+918908110786" },
  { name: "Bobby", phone: "9997001786", tel: "+919997001786" },
  { name: "Salman", phone: "7248487575", tel: "+917248487575" },
  { name: "Naeem", phone: "9058737373", tel: "+919058737373" },
] as const;

export const primaryPhone = stadiumContacts[0];

export const timeSlots: TimeSlot[] = [
  { id: "morning", label: "Morning Session", start: "06:00", end: "10:00", price: 4500, available: true },
  { id: "day", label: "Day Session", start: "10:00", end: "14:00", price: 5500, available: true },
  { id: "afternoon", label: "Afternoon Session", start: "14:00", end: "18:00", price: 6000, available: true },
  { id: "evening", label: "Evening Session", start: "18:00", end: "22:00", price: 7500, available: true },
  { id: "night", label: "Night Session (Floodlights)", start: "22:00", end: "23:30", price: 9000, available: false },
];

export const galleryImages = galleryMedia;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/booking", label: "Book Slot" },
  { href: "/live", label: "Live Match" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
