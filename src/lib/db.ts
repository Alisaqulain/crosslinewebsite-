import { promises as fs } from "fs";
import path from "path";
import type { AppStore } from "./types";
import { defaultStore } from "./seed";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

async function ensureStore(): Promise<void> {
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(defaultStore, null, 2), "utf-8");
  }
}

export async function readStore(): Promise<AppStore> {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Partial<AppStore>;
  return {
    ...defaultStore,
    ...parsed,
    siteContent: { ...defaultStore.siteContent, ...parsed.siteContent },
    liveStream: { ...defaultStore.liveStream, ...parsed.liveStream },
    academy: { ...defaultStore.academy, ...parsed.academy },
    tournaments: parsed.tournaments ?? defaultStore.tournaments,
  };
}

export async function writeStore(store: AppStore): Promise<void> {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
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
