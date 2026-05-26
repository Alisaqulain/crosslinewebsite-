export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "received";
export type MatchStatus = "upcoming" | "live" | "innings_break" | "completed";
export type MatchType = "practice" | "friendly" | "tournament" | "corporate" | "academy";

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  price: number;
  available: boolean;
  advancePercentage?: number;
}

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  slotId: string;
  slotLabel: string;
  playersOrTeam: string;
  matchType: MatchType;
  specialRequest?: string;
  totalAmount: number;
  advancePaid: number;
  advancePercentage: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
}

export interface BallPurchase {
  id: string;
  supplier: string;
  ballType: string;
  quantity: number;
  purchasePrice: number;
  date: string;
  notes?: string;
}

export interface BallUsage {
  id: string;
  ballType: string;
  quantity: number;
  date: string;
  notes?: string;
}

export interface LiveStream {
  id: string;
  title: string;
  youtubeUrl: string;
  isLive: boolean;
  enabled: boolean;
  scheduledAt?: string;
}

export interface LiveScore {
  teamA: string;
  teamB: string;
  battingTeam: "A" | "B";
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  batsman1: string;
  batsman2: string;
  bowler: string;
  target?: number;
  matchStatus: MatchStatus;
  recentBalls: string[];
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  type: "image" | "video";
  src: string;
  alt: string;
  category: string;
  poster?: string;
}

export interface SiteContent {
  heroHeadline: string;
  heroSubheadline: string;
  heroBadge: string;
  stadiumHighlights: { title: string; description: string; icon: string }[];
  testimonials: { name: string; role: string; text: string; rating: number }[];
  homepageBanner?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface AppStore {
  bookings: Booking[];
  slots: TimeSlot[];
  blockedDates: string[];
  advancePercentage: number;
  ballPurchases: BallPurchase[];
  ballUsage: BallUsage[];
  liveStream: LiveStream;
  liveScore: LiveScore;
  gallery: GalleryItem[];
  siteContent: SiteContent;
  contactMessages: ContactMessage[];
}

export type GalleryImage = GalleryItem;

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  joinedAt: string;
}
