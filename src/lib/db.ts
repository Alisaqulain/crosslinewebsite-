import { promises as fs } from "fs";
import path from "path";
import type { AppStore } from "./types";
import { defaultStore } from "./seed";

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
    liveStream: { ...defaultStore.liveStream, ...parsed.liveStream },
    academy: { ...defaultStore.academy, ...parsed.academy },
    tournaments: parsed.tournaments ?? defaultStore.tournaments,
    gallery: parsed.gallery ?? defaultStore.gallery,
    bookings: parsed.bookings ?? defaultStore.bookings,
    ballPurchases: parsed.ballPurchases ?? defaultStore.ballPurchases,
    ballUsage: parsed.ballUsage ?? defaultStore.ballUsage,
    contactMessages: parsed.contactMessages ?? defaultStore.contactMessages,
    slots: parsed.slots ?? defaultStore.slots,
    blockedDates: parsed.blockedDates ?? defaultStore.blockedDates,
    liveScore: parsed.liveScore
      ? { ...defaultStore.liveScore, ...parsed.liveScore }
      : defaultStore.liveScore,
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

async function seedTmpFromLocalOrDefault(): Promise<AppStore> {
  const fromLocal = await readFileIfExists(LOCAL_STORE);
  const store = fromLocal ?? defaultStore;
  try {
    await fs.mkdir(path.dirname(TMP_STORE), { recursive: true });
    await fs.writeFile(TMP_STORE, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    /* /tmp may be unavailable in edge cases */
  }
  return store;
}

/** Read store — never writes to project dir (Vercel filesystem is read-only). */
export async function readStore(): Promise<AppStore> {
  if (isServerless()) {
    const fromTmp = await readFileIfExists(TMP_STORE);
    if (fromTmp) return fromTmp;
    return seedTmpFromLocalOrDefault();
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

export async function writeStore(store: AppStore): Promise<void> {
  const target = storePath();
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("writeStore failed:", err);
    throw err;
  }
}

export async function updateStore(updater: (store: AppStore) => AppStore): Promise<AppStore> {
  const store = await readStore();
  const next = updater(store);
  await writeStore(next);
  return next;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}
