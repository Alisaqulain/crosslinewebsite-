export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";
export type MatchType = "practice" | "friendly" | "tournament" | "corporate" | "academy";
/** Ball quality id — admin can add more in Ball Stock settings */
export type BallQuality = string;

export interface BallQualityOption {
  id: string;
  label: string;
}

export const DEFAULT_BALL_QUALITIES: BallQualityOption[] = [
  { id: "low", label: "Low Quality" },
  { id: "medium", label: "Medium Quality" },
  { id: "high", label: "High Quality" },
];
export type StadiumMatchStatus = "upcoming" | "completed" | "cancelled";
export type TransactionType = "income" | "expense";
export type TransactionCategory =
  | "booking"
  | "diesel"
  | "ball_purchase"
  | "maintenance"
  | "other";
export type ShiftCategory = "day" | "night";
/** When the session appears on the booking page */
export type SessionValidity = "lifetime" | "date_range";

export interface TimeSlot {
  id: string;
  /** @deprecated Use validity + validFrom/validTo. Kept for older data. */
  date: string;
  label: string;
  start: string;
  end: string;
  price: number;
  available: boolean;
  validity?: SessionValidity;
  validFrom?: string;
  validTo?: string;
}

/** Slot as shown on the public booking page */
export type BookingSlotView = TimeSlot & {
  bookable: boolean;
  statusLabel?: string;
  underReview?: boolean;
};

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  slotId: string;
  slotLabel: string;
  slotPrice: number;
  teamName: string;
  numberOfPlayers: number;
  matchType: MatchType;
  specialRequest?: string;
  status: BookingStatus;
  createdAt: string;
  /** Set when approved with balls assigned */
  ballQuality?: BallQuality;
  ballsUsed?: number;
  /** Walk-in / phone booking (not from website) */
  walkIn?: boolean;
  /** Cash/advance received (₹). Udhari = slotPrice − amountReceived */
  amountReceived?: number;
}

export interface BallPurchase {
  id: string;
  quality: BallQuality;
  quantity: number;
  purchasePrice: number;
  date: string;
  supplier: string;
  notes?: string;
}

export interface BallUsage {
  id: string;
  matchName: string;
  quality: BallQuality;
  quantity: number;
  date: string;
  notes?: string;
  /** Links usage to an approved booking */
  bookingId?: string;
}

export interface StadiumMatch {
  id: string;
  title: string;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
  ground: string;
  status: StadiumMatchStatus;
  notes?: string;
}

export interface DieselExpense {
  id: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  purpose: string;
  shift: ShiftCategory;
}

/** Ground purchases, equipment, maintenance, etc. */
export interface OtherExpense {
  id: string;
  date: string;
  title: string;
  amount: number;
  category: string;
  shift: ShiftCategory;
  note?: string;
}

export interface FinanceEntry {
  id: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  shift: ShiftCategory;
  amount: number;
  note: string;
}

export interface Tournament {
  id: string;
  title: string;
  date: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  registrationOpen: boolean;
}

export interface AcademyProgram {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced" | "all";
}

export interface AcademyContent {
  headline: string;
  description: string;
  programs: AcademyProgram[];
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
  aboutTitle: string;
  aboutDescription: string;
  aboutPoints: string[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactHours: string;
  testimonials: {
    name: string;
    role: string;
    text: string;
    rating: number;
    type?: "player" | "team" | "academy";
  }[];
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
  ballQualities: BallQualityOption[];
  ballPurchases: BallPurchase[];
  ballUsage: BallUsage[];
  matches: StadiumMatch[];
  dieselExpenses: DieselExpense[];
  otherExpenses: OtherExpense[];
  financeEntries: FinanceEntry[];
  gallery: GalleryItem[];
  siteContent: SiteContent;
  contactMessages: ContactMessage[];
  tournaments: Tournament[];
  academy: AcademyContent;
}

export type GalleryImage = GalleryItem;

/** @deprecated Use getQualityLabel(store, id) */
export const BALL_QUALITY_LABELS: Record<string, string> = {
  low: "Low Quality",
  medium: "Medium Quality",
  high: "High Quality",
};
