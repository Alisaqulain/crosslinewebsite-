import type { AppStore } from "./types";
import { galleryMedia, youtube } from "./media";

export const defaultStore: AppStore = {
  advancePercentage: 25,
  blockedDates: ["2026-05-30", "2026-06-01"],
  slots: [
    { id: "morning", label: "Morning Session", start: "06:00", end: "10:00", price: 4500, available: true },
    { id: "day", label: "Day Session", start: "10:00", end: "14:00", price: 5500, available: true },
    { id: "afternoon", label: "Afternoon Session", start: "14:00", end: "18:00", price: 6000, available: true },
    { id: "evening", label: "Evening Session", start: "18:00", end: "22:00", price: 7500, available: true },
    { id: "night", label: "Night Session (Floodlights)", start: "22:00", end: "23:30", price: 9000, available: false },
  ],
  bookings: [],
  ballPurchases: [
    { id: "BP1", supplier: "Sports Gear India", ballType: "Kookaburra Red", quantity: 24, purchasePrice: 4800, date: "2026-05-20", notes: "Season stock" },
    { id: "BP2", supplier: "Local Sports Mart", ballType: "SG White", quantity: 20, purchasePrice: 3200, date: "2026-05-18" },
  ],
  ballUsage: [
    { id: "BU1", ballType: "Kookaburra Red", quantity: 12, date: "2026-05-22", notes: "Weekend matches" },
    { id: "BU2", ballType: "Tennis Ball (Practice)", quantity: 30, date: "2026-05-25", notes: "Academy sessions" },
  ],
  liveStream: {
    id: "1",
    title: "Crossline Premier League — Live",
    youtubeUrl: youtube.liveMain,
    isLive: true,
    enabled: true,
    scheduledAt: "2026-05-26T18:00:00",
  },
  liveScore: {
    teamA: "Crossline XI",
    teamB: "Sandhawali Warriors",
    battingTeam: "A",
    runs: 142,
    wickets: 3,
    overs: 18,
    balls: 4,
    batsman1: "Rahul Sharma",
    batsman2: "Amit Patel",
    bowler: "Vikram Singh",
    target: 186,
    matchStatus: "live",
    recentBalls: ["1", "4", "0", "6", "W", "2", "1", "4"],
    updatedAt: new Date().toISOString(),
  },
  gallery: galleryMedia,
  siteContent: {
    heroHeadline: "Book Your Cricket Slot Online",
    heroSubheadline:
      "Premium cricket ground in Muzaffarnagar. Book sessions online, pay advance securely, and play under floodlights.",
    heroBadge: "crosslinecricketstadium.in",
    stadiumHighlights: [
      { title: "Premium Turf", description: "Well-maintained cricket pitch with professional-grade outfield.", icon: "turf" },
      { title: "Floodlit Nights", description: "Play till 11 PM with stadium-grade floodlighting.", icon: "lights" },
      { title: "Practice Nets", description: "Dedicated nets for academy and team practice.", icon: "nets" },
      { title: "Parking & Amenities", description: "Spacious parking, changing rooms, and refreshment area.", icon: "amenities" },
    ],
    testimonials: [
      { name: "Rahul Sharma", role: "Local League Captain", text: "Best ground in Muzaffarnagar. Online booking is smooth and the pitch quality is excellent.", rating: 5 },
      { name: "Priya Patel", role: "Corporate Event Organizer", text: "We hosted our annual corporate cup here. Professional staff and seamless advance payment process.", rating: 5 },
      { name: "Amit Singh", role: "Academy Coach", text: "Our academy trains here weekly. Floodlit evening slots are a game-changer for young players.", rating: 5 },
    ],
  },
  contactMessages: [],
};
