import type { TimeSlot } from "./types";

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

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/booking", label: "Ground Booking" },
  { href: "/live", label: "Live Match" },
  { href: "/live-score", label: "Live Score" },
  { href: "/academy", label: "Sports Academy" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact Us" },
] as const;

export const footerLinks = [
  { href: "/about", label: "About Us" },
  { href: "/booking", label: "Ground Booking" },
  { href: "/live", label: "Live Match" },
  { href: "/live-score", label: "Live Score" },
  { href: "/academy", label: "Sports Academy" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact Us" },
] as const;

export const facilityItems = [
  { icon: "ground", title: "Professional Cricket Ground", description: "Premium turf wicket and outfield for league matches and practice games." },
  { icon: "nets", title: "Practice Nets", description: "Dedicated net lanes for academy sessions and team practice." },
  { icon: "lights", title: "Flood Lights", description: "Stadium-grade floodlights for evening and night sessions." },
  { icon: "seating", title: "Seating Area", description: "Comfortable viewing for families and tournament spectators." },
  { icon: "parking", title: "Parking Area", description: "Spacious parking for players, teams, and guests." },
  { icon: "changing", title: "Changing Rooms", description: "Clean changing rooms for teams before and after matches." },
  { icon: "water", title: "Drinking Water", description: "Drinking water available across the ground." },
  { icon: "washroom", title: "Washrooms", description: "Well-maintained washroom facilities on site." },
  { icon: "scoreboard", title: "Live Scoreboard", description: "Digital scoreboard updated during matches." },
  { icon: "tournament", title: "Tournament Setup", description: "Full tournament support — scheduling and match-day ops." },
] as const;
