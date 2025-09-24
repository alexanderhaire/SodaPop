export interface SpotlightItem {
  id: string;
  name: string;
  record: string;
  symbol?: string;
  image?: string;
  mintAddress?: string;
  tokenAccount?: string;
  signature?: string;
  initialSupply?: string;
  mintedAt?: string;
}

const STORAGE_KEY = "sodapop.spotlight.launches";
export const SPOTLIGHT_UPDATE_EVENT = "spotlight-items:update";
const MAX_STORED_ITEMS = 25;

const getWindow = () => (typeof window === "undefined" ? null : window);

const parseStoredItems = (raw: string | null): SpotlightItem[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry) => entry && typeof entry.id === "string");
  } catch (err) {
    console.warn("Failed to parse stored spotlight roster", err);
    return [];
  }
};

export const getStoredSpotlightItems = (): SpotlightItem[] => {
  const w = getWindow();
  if (!w) {
    return [];
  }

  return parseStoredItems(w.localStorage.getItem(STORAGE_KEY));
};

const persistSpotlightItems = (items: SpotlightItem[]) => {
  const w = getWindow();
  if (!w) {
    return;
  }

  try {
    w.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to persist spotlight roster", err);
    return;
  }

  w.dispatchEvent(new CustomEvent(SPOTLIGHT_UPDATE_EVENT));
};

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-{2,}/g, "-");
};

const generateFallbackId = (name: string, symbol?: string) => {
  const base = slugify(symbol ? `${name}-${symbol}` : name) || "launch";
  return `${base}-${Date.now()}`;
};

export type SpotlightItemInput = Omit<SpotlightItem, "id"> & {
  id?: string;
  mintedAt?: string;
};

export const addSpotlightItem = (
  candidate: SpotlightItemInput
): SpotlightItem | null => {
  const w = getWindow();
  if (!w) {
    return null;
  }

  const mintedAt = candidate.mintedAt ?? new Date().toISOString();
  const id = candidate.id ??
    candidate.mintAddress ??
    generateFallbackId(candidate.name, candidate.symbol);

  const newEntry: SpotlightItem = {
    ...candidate,
    id,
    mintedAt,
  };

  const existing = getStoredSpotlightItems();
  const filtered = existing.filter((item) => item.id !== newEntry.id);
  const next = [newEntry, ...filtered].slice(0, MAX_STORED_ITEMS);

  persistSpotlightItems(next);
  return newEntry;
};

export const subscribeToSpotlightUpdates = (
  listener: () => void
): (() => void) => {
  const w = getWindow();
  if (!w) {
    return () => undefined;
  }

  w.addEventListener(SPOTLIGHT_UPDATE_EVENT, listener);
  const storageListener = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };
  w.addEventListener("storage", storageListener);

  return () => {
    w.removeEventListener(SPOTLIGHT_UPDATE_EVENT, listener);
    w.removeEventListener("storage", storageListener);
  };
};

export const findSpotlightItemById = (id: string): SpotlightItem | undefined => {
  return getStoredSpotlightItems().find((item) => item.id === id);
};
