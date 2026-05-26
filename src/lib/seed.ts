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
  ],
  ballUsage: [
    { id: "BU1", ballType: "Kookaburra Red", quantity: 12, date: "2026-05-22", notes: "Weekend matches" },
  ],
  liveStream: {
    id: "1",
    title: "Crossline Premier League — Live",
    youtubeUrl: youtube.liveMain,
    isLive: true,
    enabled: true,
    scheduledAt: "2026-05-26T18:00:00",
    upcomingTitle: "Weekend T20 Challenge",
    upcomingDate: "2026-06-07T18:00:00",
    upcomingDescription: "Local teams battle under floodlights. Gates open 5 PM.",
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
    aboutTitle: "Muzaffarnagar's Premier Cricket Destination",
    aboutDescription:
      "Crossline Cricket Stadium & Sports Academy offers a professional cricket ground, structured coaching programs, and a complete match-day experience for players, teams, and tournament organizers.",
    aboutPoints: [
      "Professional cricket ground with quality turf",
      "Sports academy with beginner to advanced coaching",
      "Live match streaming and on-ground scoreboard",
      "Tournament-ready venue with full facilities",
    ],
    testimonials: [
      { name: "Rahul Sharma", role: "Local League Captain", text: "Best ground in Muzaffarnagar. The pitch, floodlights, and staff make every match feel professional.", rating: 5, type: "player" },
      { name: "Priya Patel", role: "Corporate Cup Organizer", text: "We hosted our annual tournament here. Excellent facilities and smooth coordination for 8 teams.", rating: 5, type: "team" },
      { name: "Amit Singh", role: "Academy Parent", text: "My son trains in the evening batch. Coaches are dedicated and the practice nets are top quality.", rating: 5, type: "academy" },
    ],
  },
  tournaments: [
    {
      id: "T1",
      title: "Crossline Premier League 2026",
      date: "2026-06-15",
      description: "8-team T20 tournament with prizes for winners and best player awards.",
      status: "upcoming",
      registrationOpen: true,
    },
    {
      id: "T2",
      title: "Weekend Corporate Cup",
      date: "2026-07-05",
      description: "Corporate teams welcome. Full ground booking with scoring and refreshments.",
      status: "upcoming",
      registrationOpen: true,
    },
  ],
  academy: {
    headline: "Crossline Sports Academy",
    description:
      "Structured cricket coaching for all ages — from first-time players to competitive club cricketers. Train on our professional ground with certified coaches.",
    programs: [
      { id: "A1", title: "Beginner Batch", description: "Fundamentals of batting, bowling, and fielding for ages 8–14.", duration: "3 days/week", level: "beginner" },
      { id: "A2", title: "Intermediate Batch", description: "Technique refinement, match awareness, and net practice.", duration: "4 days/week", level: "intermediate" },
      { id: "A3", title: "Advanced / Club Prep", description: "High-intensity drills, scenario training, and tournament preparation.", duration: "5 days/week", level: "advanced" },
    ],
  },
  contactMessages: [],
};
