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

export interface StadiumOwner {
  id: string;
  name: string;
}

export type AdminUserRole = "main" | "co-owner";

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  /** Links to StadiumOwner.id — entries auto-use this owner */
  ownerId: string;
  role: AdminUserRole;
  createdAt: string;
  createdBy?: string;
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
  slotPrice: number;
  teamName?: string;
  numberOfPlayers?: number;
  matchType: MatchType;
  specialRequest?: string;
  status: BookingStatus;
  createdAt: string;
  /** Set when approved with balls assigned */
  ballQuality?: BallQuality;
  ballsUsed?: number;
  /** Walk-in / phone booking (not from website) */
  walkIn?: boolean;
  /** Cash/advance received (₹) */
  amountReceived?: number;
  /** Admin-set pending balance (₹). Empty = 0 — never auto-calculated from price − received */
  udhariAmount?: number;
  /** Partner / owner who received this payment */
  receivedByOwnerId?: string;
}

export interface BallPurchase {
  id: string;
  quality: BallQuality;
  quantity: number;
  purchasePrice: number;
  date: string;
  supplier: string;
  /** Partner / owner who paid for this purchase */
  ownerId?: string;
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
  /** Links usage to a ball sale in other income */
  otherIncomeId?: string;
}

export interface StadiumMatch {
  id: string;
  customerName: string;
  phone?: string;
  date: string;
  slotId: string;
  slotLabel: string;
  slotPrice: number;
  amountReceived?: number;
  /** Admin-set pending balance (₹) — for discounts/deals */
  udhariAmount?: number;
  receivedByOwnerId?: string;
  matchType: MatchType;
  notes?: string;
  status: StadiumMatchStatus;
}

export interface DieselExpense {
  id: string;
  date: string;
  /** Diesel cost in rupees (₹) */
  amount: number;
  purpose: string;
  /** Night match only — always "night" for new entries */
  shift: ShiftCategory;
  /** Who paid / recorded this expense */
  ownerId?: string;
  /** @deprecated legacy — use amount */
  liters?: number;
  pricePerLiter?: number;
  totalCost?: number;
}

export interface SavedMonthlyReport {
  id: string;
  from: string;
  to: string;
  label: string;
  createdAt: string;
  pdfGenerated: boolean;
  excelGenerated: boolean;
  /** @deprecated legacy month-only backups */
  year?: number;
  month?: number;
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
  ownerId?: string;
}

/** Extra income — sponsorship, rent, ball sale, misc (not booking) */
export interface OtherIncome {
  id: string;
  date: string;
  title: string;
  amount: number;
  category: string;
  shift: ShiftCategory;
  note?: string;
  ownerId?: string;
  /** When category is Ball sale */
  ballQuality?: string;
  ballsSold?: number;
  /** Sale price for one ball (total amount = pricePerBall × ballsSold) */
  pricePerBall?: number;
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
  owners: StadiumOwner[];
  adminUsers?: AdminUser[];
  bookings: Booking[];
  slots: TimeSlot[];
  blockedDates: string[];
  ballQualities: BallQualityOption[];
  ballPurchases: BallPurchase[];
  ballUsage: BallUsage[];
  matches: StadiumMatch[];
  dieselExpenses: DieselExpense[];
  /** Historical diesel before regular tracking (backfill) */
  oldDieselExpenses?: DieselExpense[];
  savedMonthlyReports: SavedMonthlyReport[];
  otherExpenses: OtherExpense[];
  otherIncomes: OtherIncome[];
  /** Historical expenses before regular tracking (backfill) */
  oldExpenses?: OtherExpense[];
  /** Historical income before regular tracking (backfill) */
  oldIncomes?: OtherIncome[];
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
