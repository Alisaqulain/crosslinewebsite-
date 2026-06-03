import mongoose, { Schema } from "mongoose";
import type { AppStore } from "../types";

export const STORE_DOC_ID = "main";

const StoreSchema = new Schema<AppStore & { _id: string }>(
  {
    _id: { type: String, required: true, default: STORE_DOC_ID },
    bookings: { type: Schema.Types.Mixed, default: [] },
    slots: { type: Schema.Types.Mixed, default: [] },
    blockedDates: { type: [String], default: [] },
    ballPurchases: { type: Schema.Types.Mixed, default: [] },
    ballUsage: { type: Schema.Types.Mixed, default: [] },
    matches: { type: Schema.Types.Mixed, default: [] },
    dieselExpenses: { type: Schema.Types.Mixed, default: [] },
    financeEntries: { type: Schema.Types.Mixed, default: [] },
    gallery: { type: Schema.Types.Mixed, default: [] },
    siteContent: { type: Schema.Types.Mixed, default: {} },
    contactMessages: { type: Schema.Types.Mixed, default: [] },
    tournaments: { type: Schema.Types.Mixed, default: [] },
    academy: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

if (mongoose.models.CrosslineStore) {
  delete mongoose.models.CrosslineStore;
}

export const StoreModel = mongoose.model<AppStore & { _id: string }>(
  "CrosslineStore",
  StoreSchema
);
