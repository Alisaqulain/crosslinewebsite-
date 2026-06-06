import { promises as fs } from "fs";
import path from "path";
import type { AppStore } from "./types";
import { defaultStore } from "./seed";
import { connectMongo, isMongoConfigured } from "./mongodb";
import { STORE_DOC_ID, StoreModel } from "./models/StoreDocument";

const LOCAL_STORE = path.join(process.cwd(), "data", "store.json");
const TMP_STORE = path.join("/tmp", "crossline-store.json");

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function storePath(): string {
  return isServerless() ? TMP_STORE : LOCAL_STORE;
}

function mergeStore(parsed: Partial<AppStore>): AppStore {
  return {
    ...defaultStore,
    ...parsed,
    siteContent: { ...defaultStore.siteContent, ...parsed.siteContent },
    academy: { ...defaultStore.academy, ...parsed.academy },
    tournaments: parsed.tournaments ?? defaultStore.tournaments,
    gallery: parsed.gallery ?? defaultStore.gallery,
    owners: parsed.owners ?? defaultStore.owners,
    bookings: parsed.bookings ?? defaultStore.bookings,
    ballQualities: parsed.ballQualities ?? defaultStore.ballQualities,
    ballPurchases: parsed.ballPurchases ?? defaultStore.ballPurchases,
    ballUsage: parsed.ballUsage ?? defaultStore.ballUsage,
    matches: parsed.matches ?? defaultStore.matches,
    dieselExpenses: parsed.dieselExpenses ?? defaultStore.dieselExpenses,
    otherExpenses: parsed.otherExpenses ?? defaultStore.otherExpenses,
    otherIncomes: parsed.otherIncomes ?? defaultStore.otherIncomes,
    financeEntries: parsed.financeEntries ?? defaultStore.financeEntries,
    contactMessages: parsed.contactMessages ?? defaultStore.contactMessages,
    slots: Array.isArray(parsed.slots) ? parsed.slots : defaultStore.slots,
    blockedDates: Array.isArray(parsed.blockedDates)
      ? parsed.blockedDates
      : defaultStore.blockedDates,
  };
}

async function readFileIfExists(filePath: string): Promise<AppStore | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return mergeStore(JSON.parse(raw) as Partial<AppStore>);
  } catch {
    return null;
  }
}

async function readFromFile(): Promise<AppStore> {
  if (isServerless()) {
    const fromTmp = await readFileIfExists(TMP_STORE);
    if (fromTmp) return fromTmp;
    const fromLocal = await readFileIfExists(LOCAL_STORE);
    const store = fromLocal ?? defaultStore;
    try {
      await fs.mkdir(path.dirname(TMP_STORE), { recursive: true });
      await fs.writeFile(TMP_STORE, JSON.stringify(store, null, 2), "utf-8");
    } catch {
      /* ignore */
    }
    return store;
  }

  const fromLocal = await readFileIfExists(LOCAL_STORE);
  if (fromLocal) return fromLocal;

  try {
    await fs.mkdir(path.dirname(LOCAL_STORE), { recursive: true });
    await fs.writeFile(LOCAL_STORE, JSON.stringify(defaultStore, null, 2), "utf-8");
    return defaultStore;
  } catch {
    return defaultStore;
  }
}

async function writeToFile(store: AppStore): Promise<void> {
  const target = storePath();
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(store, null, 2), "utf-8");
}

async function readFromMongo(): Promise<AppStore> {
  await connectMongo();
  const doc = await StoreModel.findOne({ _id: STORE_DOC_ID }).lean();
  if (!doc) {
    const fromFile = await readFromFile();
    await StoreModel.findOneAndReplace(
      { _id: STORE_DOC_ID },
      { _id: STORE_DOC_ID, ...fromFile },
      { upsert: true }
    );
    return fromFile;
  }
  const { _id: _unused, __v: _v, createdAt: _c, updatedAt: _u, ...store } = doc as AppStore & {
    _id?: string;
    __v?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  return mergeStore(store);
}

async function writeToMongo(store: AppStore): Promise<void> {
  await connectMongo();
  const payload = { _id: STORE_DOC_ID, ...store };
  await StoreModel.findOneAndReplace({ _id: STORE_DOC_ID }, payload, {
    upsert: true,
    runValidators: false,
  });
}

export async function readStore(): Promise<AppStore> {
  if (isMongoConfigured()) {
    try {
      return await readFromMongo();
    } catch (err) {
      console.error("MongoDB read failed, falling back to file:", err);
    }
  }
  return readFromFile();
}

export async function writeStore(store: AppStore): Promise<void> {
  if (isMongoConfigured()) {
    try {
      await writeToMongo(store);
      return;
    } catch (err) {
      console.error("MongoDB write failed, falling back to file:", err);
      await writeToFile(store);
      return;
    }
  }
  await writeToFile(store);
}

export async function updateStore(updater: (store: AppStore) => AppStore): Promise<AppStore> {
  const store = await readStore();
  const next = updater(store);
  await writeStore(next);
  return next;
}

export { generateId } from "./id";
