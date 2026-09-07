"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type {
  CatalogSnapshot,
  Collection,
  Comment,
  Photograph,
  PhotographyCategory,
  SavedBucketShotStatus,
  SavedItems,
  Trip,
} from "@/lib/domain/types";
import { emptyCatalog, emptySavedItems } from "@/lib/domain/types";
import { localStore, toggleId } from "@/lib/local/store";
import {
  addComment,
  deleteCollection,
  deleteTrip,
  loadAppreciations,
  loadCatalog,
  loadCollections,
  loadComments,
  loadFollows,
  loadSavedItems,
  loadTrips,
  saveCollection,
  saveProfile,
  saveTrip,
  setShotStatus,
  toggleAppreciation,
  toggleBookmark,
  toggleFollow,
  toggleSavedLocation,
  toggleSavedShot,
} from "@/lib/repositories/catalog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapProfile } from "@/lib/dto/mappers";
import type { PhotographerProfile } from "@/lib/domain/types";

type AuthReason = "save" | "create" | "comment" | "appreciate" | "follow" | "signIn" | null;

type AppState = {
  ready: boolean;
  catalog: CatalogSnapshot;
  error: string | null;
  refresh: () => Promise<void>;
  session: Session | null;
  profile: PhotographerProfile | null;
  saved: SavedItems;
  trips: Trip[];
  collections: Collection[];
  comments: Comment[];
  appreciated: string[];
  followed: string[];
  authReason: AuthReason;
  setAuthReason: (reason: AuthReason) => void;
  ensureAuth: (reason: AuthReason) => boolean;
  appearance: "system" | "light" | "dark";
  setAppearance: (value: "system" | "light" | "dark") => void;
  ambience: { enabled: boolean; interval: number };
  setAmbience: (value: { enabled: boolean; interval: number }) => void;
  interests: PhotographyCategory[];
  toggleLocation: (id: string) => Promise<void>;
  toggleShot: (id: string) => Promise<void>;
  setStatus: (id: string, status: SavedBucketShotStatus) => Promise<void>;
  togglePhotoSave: (id: string) => Promise<void>;
  toggleAppreciate: (id: string) => Promise<void>;
  toggleFollowUser: (id: string) => Promise<void>;
  postComment: (photoId: string, body: string, categories?: string[]) => Promise<void>;
  upsertTrip: (trip: Trip) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;
  upsertCollection: (collection: Collection) => Promise<void>;
  removeCollection: (id: string) => Promise<void>;
  updateProfile: (profile: PhotographerProfile) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AppState | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [catalog, setCatalog] = useState<CatalogSnapshot>(emptyCatalog());
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [saved, setSaved] = useState<SavedItems>(emptySavedItems());
  const [trips, setTrips] = useState<Trip[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [appreciated, setAppreciated] = useState<string[]>([]);
  const [followed, setFollowed] = useState<string[]>([]);
  const [authReason, setAuthReason] = useState<AuthReason>(null);
  const [appearance, setAppearanceState] = useState<"system" | "light" | "dark">("system");
  const [ambience, setAmbienceState] = useState({ enabled: true, interval: 10 });
  const interests: PhotographyCategory[] = ["landscape", "coastal"];

  const userId = session?.user.id ?? null;

  const refresh = useCallback(async () => {
    try {
      const next = await loadCatalog();
      setCatalog(next);
      setComments(await loadComments());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the catalog");
    }
  }, []);

  const loadUserContent = useCallback(async (id: string | null) => {
    if (!id) {
      setSaved(localStore.saved());
      setTrips(localStore.trips());
      setCollections(localStore.collections());
      setAppreciated(localStore.community().appreciatedPhotographIds);
      setFollowed(localStore.community().followedPhotographerIds);
      setProfile(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    setProfile(data ? mapProfile(data as Record<string, unknown>) : null);
    const [remoteSaved, remoteTrips, remoteCollections, remoteAppreciated, remoteFollows] = await Promise.all([
      loadSavedItems(id),
      loadTrips(id),
      loadCollections(id),
      loadAppreciations(id),
      loadFollows(id),
    ]);
    const localSaved = localStore.saved();
    const mergedSaved: SavedItems = {
      locationIds: [...new Set([...remoteSaved.locationIds, ...localSaved.locationIds])],
      bucketShotIds: [...new Set([...remoteSaved.bucketShotIds, ...localSaved.bucketShotIds])],
      photographIds: [...new Set([...remoteSaved.photographIds, ...localSaved.photographIds])],
      bucketShotStatuses: { ...localSaved.bucketShotStatuses, ...remoteSaved.bucketShotStatuses },
    };
    setSaved(mergedSaved);
    const localTrips = localStore.trips().filter((trip) => !trip.isSample);
    const uploadedTripIds = new Set(remoteTrips.map((trip) => trip.id));
    const pendingTrips = localTrips.filter((trip) => !uploadedTripIds.has(trip.id));
    for (const trip of pendingTrips) {
      await saveTrip({ ...trip, userId: id });
    }
    setTrips(pendingTrips.length ? await loadTrips(id) : remoteTrips);
    const localCollections = localStore.collections().filter((item) => !item.isSample);
    const uploadedCollectionIds = new Set(remoteCollections.map((item) => item.id));
    for (const collection of localCollections.filter((item) => !uploadedCollectionIds.has(item.id))) {
      await saveCollection({ ...collection, userId: id });
    }
    setCollections(localCollections.some((item) => !uploadedCollectionIds.has(item.id)) ? await loadCollections(id) : remoteCollections);
    setAppreciated(remoteAppreciated);
    setFollowed(remoteFollows);
  }, []);

  useEffect(() => {
    setAppearanceState(localStore.appearance());
    setAmbienceState(localStore.ambience());
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void refresh().then(() => loadUserContent(data.session?.user.id ?? null)).finally(() => setReady(true));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      void loadUserContent(next?.user.id ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [loadUserContent, refresh]);

  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
  }, [appearance]);

  const ensureAuth = useCallback((reason: AuthReason) => {
    if (userId) return true;
    setAuthReason(reason);
    return false;
  }, [userId]);

  const value = useMemo<AppState>(() => ({
    ready,
    catalog,
    error,
    refresh,
    session,
    profile,
    saved,
    trips,
    collections,
    comments,
    appreciated,
    followed,
    authReason,
    setAuthReason,
    ensureAuth,
    appearance,
    setAppearance: (next) => {
      setAppearanceState(next);
      localStore.saveAppearance(next);
    },
    ambience,
    setAmbience: (next) => {
      setAmbienceState(next);
      localStore.saveAmbience(next);
    },
    interests,
    toggleLocation: async (id) => {
      const currently = saved.locationIds.includes(id);
      if (userId) {
        if (!ensureAuth("save")) return;
        await toggleSavedLocation(userId, id, currently);
      }
      const next = { ...saved, locationIds: toggleId(saved.locationIds, id) };
      setSaved(next);
      localStore.saveSaved(next);
    },
    toggleShot: async (id) => {
      const currently = saved.bucketShotIds.includes(id);
      if (userId) await toggleSavedShot(userId, id, currently);
      const nextIds = toggleId(saved.bucketShotIds, id);
      const statuses = { ...saved.bucketShotStatuses };
      if (currently) delete statuses[id];
      else statuses[id] = "wantToShoot";
      const next = { ...saved, bucketShotIds: nextIds, bucketShotStatuses: statuses };
      setSaved(next);
      localStore.saveSaved(next);
    },
    setStatus: async (id, status) => {
      if (userId) await setShotStatus(userId, id, status);
      const next = { ...saved, bucketShotStatuses: { ...saved.bucketShotStatuses, [id]: status } };
      setSaved(next);
      localStore.saveSaved(next);
    },
    togglePhotoSave: async (id) => {
      if (!ensureAuth("save")) return;
      if (!userId) return;
      const currently = saved.photographIds.includes(id);
      await toggleBookmark(userId, id, currently);
      const next = { ...saved, photographIds: toggleId(saved.photographIds, id) };
      setSaved(next);
    },
    toggleAppreciate: async (id) => {
      if (!ensureAuth("appreciate")) return;
      if (!userId) return;
      const enabled = !appreciated.includes(id);
      await toggleAppreciation(userId, id, enabled);
      setAppreciated(toggleId(appreciated, id));
    },
    toggleFollowUser: async (id) => {
      if (!ensureAuth("follow")) return;
      if (!userId) return;
      const enabled = !followed.includes(id);
      await toggleFollow(userId, id, enabled);
      setFollowed(toggleId(followed, id));
    },
    postComment: async (photoId, body, categories = []) => {
      if (!ensureAuth("comment")) return;
      if (!userId) return;
      await addComment(userId, photoId, body, categories);
      setComments(await loadComments());
    },
    upsertTrip: async (trip) => {
      const nextTrip = { ...trip, userId: userId ?? trip.userId };
      if (userId) await saveTrip(nextTrip);
      const next = [nextTrip, ...trips.filter((item) => item.id !== trip.id)];
      setTrips(next);
      localStore.saveTrips(next);
    },
    removeTrip: async (id) => {
      if (userId) await deleteTrip(id);
      const next = trips.filter((item) => item.id !== id);
      setTrips(next);
      localStore.saveTrips(next);
    },
    upsertCollection: async (collection) => {
      if (!ensureAuth("create")) return;
      const nextCollection = { ...collection, userId: userId ?? collection.userId };
      if (userId) await saveCollection(nextCollection);
      const next = [nextCollection, ...collections.filter((item) => item.id !== collection.id)];
      setCollections(next);
      localStore.saveCollections(next);
    },
    removeCollection: async (id) => {
      if (userId) await deleteCollection(id);
      const next = collections.filter((item) => item.id !== id);
      setCollections(next);
      localStore.saveCollections(next);
    },
    updateProfile: async (next) => {
      await saveProfile(next);
      setProfile(next);
    },
    signOut: async () => {
      await getSupabaseBrowserClient().auth.signOut();
    },
  }), [ambience, appearance, appreciated, authReason, catalog, collections, comments, ensureAuth, error, followed, interests, profile, ready, refresh, saved, session, trips, userId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useApp must be used inside AppProviders");
  return value;
}

export type { Photograph };
