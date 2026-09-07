import type {
  Collection,
  CommunityState,
  SavedBucketShotStatus,
  SavedItems,
  Trip,
} from "@/lib/domain/types";
import { emptySavedItems } from "@/lib/domain/types";

const KEYS = {
  saved: "bucketshot.saved-items",
  trips: "bucketshot.trips",
  collections: "bucketshot.collections",
  community: "bucketshot.community",
  appearance: "bucketshot.appearance",
  ambience: "bucketshot.home-ambience",
  recents: "bucketshot.recent-searches",
  localLocations: "bucketshot.local-locations",
  localShots: "bucketshot.local-bucket-shots",
  localPhotos: "bucketshot.local-photographs",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const localStore = {
  saved(): SavedItems {
    return { ...emptySavedItems(), ...read(KEYS.saved, emptySavedItems()) };
  },
  saveSaved(items: SavedItems) {
    write(KEYS.saved, items);
  },
  trips(): Trip[] {
    return read(KEYS.trips, []);
  },
  saveTrips(trips: Trip[]) {
    write(KEYS.trips, trips);
  },
  collections(): Collection[] {
    return read(KEYS.collections, []);
  },
  saveCollections(collections: Collection[]) {
    write(KEYS.collections, collections);
  },
  community(): CommunityState {
    return read(KEYS.community, { appreciatedPhotographIds: [], followedPhotographerIds: [] });
  },
  saveCommunity(state: CommunityState) {
    write(KEYS.community, state);
  },
  appearance(): "system" | "light" | "dark" {
    return read(KEYS.appearance, "system");
  },
  saveAppearance(value: "system" | "light" | "dark") {
    write(KEYS.appearance, value);
  },
  ambience(): { enabled: boolean; interval: number } {
    return read(KEYS.ambience, { enabled: true, interval: 10 });
  },
  saveAmbience(value: { enabled: boolean; interval: number }) {
    write(KEYS.ambience, value);
  },
  recents(): string[] {
    return read(KEYS.recents, []);
  },
  saveRecents(queries: string[]) {
    write(KEYS.recents, queries.slice(0, 8));
  },
  localRows<T>(key: "locations" | "shots" | "photos"): T[] {
    const map = { locations: KEYS.localLocations, shots: KEYS.localShots, photos: KEYS.localPhotos };
    return read(map[key], []);
  },
  saveLocalRows<T>(key: "locations" | "shots" | "photos", rows: T[]) {
    const map = { locations: KEYS.localLocations, shots: KEYS.localShots, photos: KEYS.localPhotos };
    write(map[key], rows);
  },
};

export function toggleId(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function nextSavedStatus(current: SavedBucketShotStatus | undefined): SavedBucketShotStatus {
  if (!current || current === "wantToShoot") return "planned";
  if (current === "planned") return "shot";
  return "wantToShoot";
}
