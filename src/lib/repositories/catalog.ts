import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BucketShotOpportunity,
  CatalogSnapshot,
  Collection,
  Comment,
  Destination,
  Photograph,
  PhotographyLocation,
  PhotographyTip,
  PhotographerProfile,
  PhotoProject,
  SavedBucketShotStatus,
  SavedItems,
  Trip,
  TripDay,
  TripStop,
} from "@/lib/domain/types";
import { emptySavedItems } from "@/lib/domain/types";
import { decodeSavedStatus, encodeModeration, encodeSavedStatus, mapBucketShot, mapComment, mapDestination, mapLocation, mapPhotograph, mapProfile, mapTip, slugify } from "@/lib/dto/mappers";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function client() {
  return getSupabaseBrowserClient();
}

export async function loadCatalog(): Promise<CatalogSnapshot> {
  const supabase = client();
  const [destinations, locations, shots, photos, profiles, tips, projects] = await Promise.all([
    supabase.from("destinations").select("*").order("name"),
    supabase.from("locations_readable").select("*"),
    supabase.from("bucket_shots_readable").select("*"),
    supabase.from("photographs_readable").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*"),
    supabase.from("photography_tips").select("*").order("sort_order"),
    supabase.from("projects").select("*, project_photographs(photograph_id, sort_order)"),
  ]);

  const tipRows = (tips.data ?? []).map((row) => mapTip(row as Record<string, unknown>));
  const tipsByLocation = new Map<string, PhotographyTip[]>();
  for (const tip of tipRows) {
    if (!tip.locationId) continue;
    const list = tipsByLocation.get(tip.locationId) ?? [];
    list.push(tip);
    tipsByLocation.set(tip.locationId, list);
  }

  return {
    destinations: (destinations.data ?? []).map((row) => mapDestination(row as Record<string, unknown>)),
    locations: (locations.data ?? []).map((row) => {
      const mapped = mapLocation(row as Record<string, unknown>, tipsByLocation.get(String((row as { id: string }).id)) ?? []);
      return mapped;
    }),
    bucketShots: (shots.data ?? []).map((row) => mapBucketShot(row as Record<string, unknown>)),
    photographs: await signPhotographImages((photos.data ?? []).map((row) => mapPhotograph(row as Record<string, unknown>))),
    photographers: (profiles.data ?? []).map((row) => mapProfile(row as Record<string, unknown>)),
    projects: (projects.data ?? []).map((row) => mapProject(row as Record<string, unknown>)),
    tips: tipRows,
  };
}

/** Stored photograph URLs are 7-day signed links and expire. `image_path` is the durable reference. */
async function signPhotographImages(photos: Photograph[]): Promise<Photograph[]> {
  const paths = [...new Set(photos.map((photo) => photo.imagePath).filter((path): path is string => Boolean(path)))];
  if (!paths.length) return photos;
  const { data, error } = await client().storage.from("photographs").createSignedUrls(paths, 60 * 60 * 24 * 7);
  if (error || !data) return photos;
  const signed = new Map(data.filter((item) => item.signedUrl).map((item) => [item.path, item.signedUrl]));
  return photos.map((photo) => {
    const url = photo.imagePath ? signed.get(photo.imagePath) : null;
    return url ? { ...photo, image: { ...photo.image, url: url } } : photo;
  });
}

function mapProject(row: Record<string, unknown>): PhotoProject {
  const membership = Array.isArray(row.project_photographs) ? row.project_photographs : [];
  const photographIds = [...membership]
    .sort((a, b) => Number((a as { sort_order?: number }).sort_order ?? 0) - Number((b as { sort_order?: number }).sort_order ?? 0))
    .map((item) => String((item as { photograph_id: string }).photograph_id));
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    summary: String(row.summary ?? ""),
    photographerId: String(row.user_id ?? row.photographer_id ?? ""),
    photographIds,
    year: row.year == null ? null : Number(row.year),
    coverPhotographId: (row.cover_photograph_id as string) ?? photographIds[0] ?? null,
  };
}

export async function loadSavedItems(userId: string | null): Promise<SavedItems> {
  if (!userId) return emptySavedItems();
  const supabase = client();
  const [locations, shots, bookmarks] = await Promise.all([
    supabase.from("saved_locations").select("location_id").eq("user_id", userId),
    supabase.from("saved_bucket_shots").select("bucket_shot_id, status").eq("user_id", userId),
    supabase.from("bookmarks").select("photo_id").eq("user_id", userId),
  ]);
  const statuses: Record<string, SavedBucketShotStatus> = {};
  for (const row of shots.data ?? []) {
    statuses[String(row.bucket_shot_id)] = decodeSavedStatus(row.status as string);
  }
  return {
    locationIds: (locations.data ?? []).map((row) => String(row.location_id)),
    bucketShotIds: (shots.data ?? []).map((row) => String(row.bucket_shot_id)),
    photographIds: (bookmarks.data ?? []).map((row) => String(row.photo_id)),
    bucketShotStatuses: statuses,
  };
}

export async function toggleSavedLocation(userId: string, locationId: string, currentlySaved: boolean) {
  const supabase = client();
  if (currentlySaved) {
    await supabase.from("saved_locations").delete().eq("user_id", userId).eq("location_id", locationId);
    return false;
  }
  await supabase.from("saved_locations").insert({ user_id: userId, location_id: locationId });
  return true;
}

export async function toggleSavedShot(userId: string, shotId: string, currentlySaved: boolean) {
  const supabase = client();
  if (currentlySaved) {
    await supabase.from("saved_bucket_shots").delete().eq("user_id", userId).eq("bucket_shot_id", shotId);
    return false;
  }
  await supabase.from("saved_bucket_shots").insert({ user_id: userId, bucket_shot_id: shotId, status: "want_to_shoot" });
  return true;
}

export async function setShotStatus(userId: string, shotId: string, status: SavedBucketShotStatus) {
  const supabase = client();
  await supabase.from("saved_bucket_shots").update({ status: encodeSavedStatus(status) }).eq("user_id", userId).eq("bucket_shot_id", shotId);
}

export async function toggleBookmark(userId: string, photoId: string, currentlySaved: boolean) {
  const supabase = client();
  if (currentlySaved) {
    await supabase.from("bookmarks").delete().eq("user_id", userId).eq("photo_id", photoId);
  } else {
    await supabase.from("bookmarks").insert({ user_id: userId, photo_id: photoId });
  }
}

export async function toggleAppreciation(userId: string, photoId: string, enabled: boolean) {
  const supabase = client();
  if (enabled) await supabase.from("appreciations").insert({ user_id: userId, photo_id: photoId });
  else await supabase.from("appreciations").delete().eq("user_id", userId).eq("photo_id", photoId);
}

export async function loadAppreciations(userId: string) {
  const supabase = client();
  const { data } = await supabase.from("appreciations").select("photo_id").eq("user_id", userId);
  return (data ?? []).map((row) => String(row.photo_id));
}

export async function toggleFollow(userId: string, photographerId: string, enabled: boolean) {
  const supabase = client();
  if (enabled) await supabase.from("follows").insert({ follower_id: userId, following_id: photographerId });
  else await supabase.from("follows").delete().eq("follower_id", userId).eq("following_id", photographerId);
}

export async function loadFollows(userId: string) {
  const supabase = client();
  const { data } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
  return (data ?? []).map((row) => String(row.following_id));
}

export async function loadComments(): Promise<Comment[]> {
  const supabase = client();
  const { data } = await supabase
    .from("comments")
    .select("id, photo_id, user_id, body, critique_categories, created_at, profiles!user_id(display_name)")
    .order("created_at", { ascending: true });
  return (data ?? []).map((row) => mapComment(row as unknown as Record<string, unknown>));
}

export async function addComment(userId: string, photoId: string, body: string, critiqueCategories: string[] = []) {
  const supabase = client();
  const { error } = await supabase.from("comments").insert({
    user_id: userId,
    photo_id: photoId,
    body,
    critique_categories: critiqueCategories,
  });
  if (error) throw error;
}

export async function loadTrips(userId: string): Promise<Trip[]> {
  const supabase = client();
  const [trips, days, stops, destinations] = await Promise.all([
    supabase.from("trips").select("*").eq("user_id", userId),
    supabase.from("trip_days").select("*"),
    supabase.from("trip_stops").select("*"),
    supabase.from("trip_destinations").select("*"),
  ]);
  return (trips.data ?? []).map((row) => {
    const tripDays = (days.data ?? [])
      .filter((day) => day.trip_id === row.id)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
      .map((day) => ({
        id: String(day.id),
        tripId: String(day.trip_id),
        date: day.date,
        title: String(day.title ?? ""),
        notes: String(day.notes ?? ""),
        sortOrder: Number(day.sort_order ?? 0),
        stops: (stops.data ?? [])
          .filter((stop) => stop.trip_day_id === day.id)
          .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
          .map(mapStop),
      }));
    return {
      id: String(row.id),
      userId,
      title: String(row.title ?? ""),
      destination: String(row.destination ?? ""),
      summary: String(row.summary ?? ""),
      startDate: row.start_date,
      endDate: row.end_date,
      notes: String(row.notes ?? ""),
      heroImageUrl: row.hero_image_url,
      gear: Array.isArray(row.gear) ? row.gear.map(mapGear) : [],
      days: tripDays,
      destinationIds: (destinations.data ?? []).filter((item) => item.trip_id === row.id).map((item) => String(item.destination_id)),
      isSample: false,
      createdAt: row.created_at,
    };
  });
}

function mapStop(row: Record<string, unknown>): TripStop {
  return {
    id: String(row.id),
    tripDayId: String(row.trip_day_id),
    locationId: (row.location_id as string) ?? null,
    bucketShotId: (row.bucket_shot_id as string) ?? null,
    kind: row.kind === "bucket_shot" ? "bucketShot" : "location",
    time: (row.time as string) ?? null,
    notes: String(row.notes ?? ""),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function mapGear(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    isChecked: Boolean(row.is_checked ?? row.isChecked),
    isCustom: Boolean(row.is_custom ?? row.isCustom),
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
  };
}

export async function saveTrip(trip: Trip) {
  const supabase = client();
  const { error } = await supabase.from("trips").upsert({
    id: trip.id,
    user_id: trip.userId,
    title: trip.title,
    destination: trip.destination,
    summary: trip.summary,
    start_date: trip.startDate,
    end_date: trip.endDate,
    notes: trip.notes,
    hero_image_url: trip.heroImageUrl,
    gear: trip.gear.map((item) => ({
      id: item.id,
      title: item.title,
      is_checked: item.isChecked,
      is_custom: item.isCustom,
      sort_order: item.sortOrder,
    })),
  });
  if (error) throw error;
  await supabase.from("trip_destinations").delete().eq("trip_id", trip.id);
  if (trip.destinationIds.length) {
    await supabase.from("trip_destinations").insert(trip.destinationIds.map((destinationId) => ({ trip_id: trip.id, destination_id: destinationId })));
  }
  const existingDays = await supabase.from("trip_days").select("id").eq("trip_id", trip.id);
  const dayIds = (existingDays.data ?? []).map((row) => row.id);
  if (dayIds.length) await supabase.from("trip_stops").delete().in("trip_day_id", dayIds);
  await supabase.from("trip_days").delete().eq("trip_id", trip.id);
  if (trip.days.length) {
    await supabase.from("trip_days").insert(
      trip.days.map((day, index) => ({
        id: day.id,
        trip_id: trip.id,
        date: day.date,
        title: day.title,
        notes: day.notes,
        sort_order: index,
      })),
    );
    const stops = trip.days.flatMap((day) =>
      day.stops.map((stop, index) => ({
        id: stop.id,
        trip_day_id: day.id,
        location_id: stop.locationId,
        bucket_shot_id: stop.bucketShotId,
        kind: stop.kind === "bucketShot" ? "bucket_shot" : "location",
        time: stop.time,
        notes: stop.notes,
        sort_order: index,
      })),
    );
    if (stops.length) await supabase.from("trip_stops").insert(stops);
  }
}

export async function deleteTrip(id: string) {
  const supabase = client();
  await supabase.from("trips").delete().eq("id", id);
}

export async function loadCollections(userId: string): Promise<Collection[]> {
  const supabase = client();
  const [collections, locations, shots] = await Promise.all([
    supabase.from("collections").select("*").eq("user_id", userId),
    supabase.from("collection_locations").select("*"),
    supabase.from("collection_bucket_shots").select("*"),
  ]);
  return (collections.data ?? []).map((row) => ({
    id: String(row.id),
    userId,
    title: String(row.title ?? ""),
    summary: String(row.summary ?? ""),
    heroImageUrl: row.hero_image_url,
    locationIds: (locations.data ?? []).filter((item) => item.collection_id === row.id).map((item) => String(item.location_id)),
    bucketShotIds: (shots.data ?? []).filter((item) => item.collection_id === row.id).map((item) => String(item.bucket_shot_id)),
    isSample: false,
    createdAt: row.created_at,
  }));
}

export async function saveCollection(collection: Collection) {
  const supabase = client();
  const { error } = await supabase.from("collections").upsert({
    id: collection.id,
    user_id: collection.userId,
    title: collection.title,
    summary: collection.summary,
    hero_image_url: collection.heroImageUrl,
  });
  if (error) throw error;
  await supabase.from("collection_locations").delete().eq("collection_id", collection.id);
  await supabase.from("collection_bucket_shots").delete().eq("collection_id", collection.id);
  if (collection.locationIds.length) {
    await supabase.from("collection_locations").insert(collection.locationIds.map((locationId, index) => ({ collection_id: collection.id, location_id: locationId, sort_order: index })));
  }
  if (collection.bucketShotIds.length) {
    await supabase.from("collection_bucket_shots").insert(collection.bucketShotIds.map((shotId, index) => ({ collection_id: collection.id, bucket_shot_id: shotId, sort_order: index })));
  }
}

export async function deleteCollection(id: string) {
  const supabase = client();
  await supabase.from("collections").delete().eq("id", id);
}

export async function uploadMedia(bucket: "avatars" | "photographs" | "location-images", path: string, file: Blob, contentType: string) {
  const supabase = client();
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType, upsert: true });
  if (error) throw error;
  if (bucket === "avatars") {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
  const { data, error: signError } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signError) throw signError;
  return data.signedUrl;
}

export async function saveProfile(profile: PhotographerProfile) {
  const supabase = client();
  const { error } = await supabase.from("profiles").upsert({
    id: profile.id,
    username: profile.username,
    display_name: profile.displayName,
    bio: profile.bio,
    avatar_url: profile.avatarUrl,
    home_region: profile.homeRegion,
    website_url: profile.websiteUrl,
    photography_specialties: profile.specialties,
    gear_notes: profile.gearNotes,
  });
  if (error) throw error;
}

export async function publishLocation(location: PhotographyLocation, userId: string) {
  const supabase = client();
  const { error } = await supabase.from("locations").upsert({
    id: location.id,
    created_by: userId,
    destination_id: location.destinationId,
    name: location.name,
    slug: slugify(`${location.name}-${location.id.slice(0, 8)}`),
    summary: location.summary,
    description: location.description,
    latitude: location.coordinate?.latitude,
    longitude: location.coordinate?.longitude,
    region: location.region,
    country: location.country,
    categories: location.categories,
    tags: location.tags,
    access_difficulty: location.accessDifficulty,
    free_entry: location.freeEntry,
    walking_time_minutes: location.walkingTimeMinutes,
    access_notes: location.accessNotes,
    parking_notes: location.parkingNotes,
    hazards: location.hazards,
    preferred_light: location.preferredLight,
    preferred_seasons: location.preferredSeasons,
    conditions_notes: location.conditionsNotes,
    privacy: location.privacy,
    coordinate_precision: "exact",
    status: encodeModeration("published"),
    hero_image_url: location.coverImage.url,
  });
  if (error) throw error;
}

export async function publishBucketShot(shot: BucketShotOpportunity, userId: string) {
  const supabase = client();
  const { error } = await supabase.from("bucket_shots").upsert({
    id: shot.id,
    location_id: shot.locationId,
    created_by: userId,
    title: shot.title,
    description: shot.description,
    composition_notes: shot.compositionNotes,
    camera_latitude: shot.camera?.latitude,
    camera_longitude: shot.camera?.longitude,
    target_latitude: shot.subject?.latitude,
    target_longitude: shot.subject?.longitude,
    recommended_focal_length_min: shot.focalMin,
    recommended_focal_length_max: shot.focalMax,
    suggested_aperture: shot.suggestedAperture,
    suggested_shutter_speed: shot.suggestedShutterSpeed,
    suggested_iso: shot.suggestedIso,
    orientation: shot.orientation,
    tripod_recommended: shot.tripodRecommended,
    filter_notes: shot.filterNotes,
    best_light: shot.bestLight,
    season_notes: shot.seasonNotes,
    weather_notes: shot.weatherNotes,
    tags: shot.tags,
    privacy: shot.privacy,
    coordinate_precision: "exact",
    status: encodeModeration("published"),
    hero_image_url: shot.coverImage.url,
  });
  if (error) throw error;
}

export async function publishPhotograph(photo: Photograph, userId: string) {
  const supabase = client();
  const { error } = await supabase.from("photographs").upsert({
    id: photo.id,
    user_id: userId,
    location_id: photo.locationId,
    bucket_shot_id: photo.bucketShotId,
    title: photo.title,
    description: photo.description,
    story: photo.story,
    image_url: photo.image.url,
    image_path: photo.imagePath ?? `${userId}/${photo.id}/original.jpg`,
    capture_date: photo.captureDate,
    camera: photo.camera,
    lens: photo.lens,
    focal_length: photo.focalLength,
    aperture: photo.aperture,
    shutter_speed: photo.shutterSpeed,
    iso: photo.iso,
    latitude: photo.latitude,
    longitude: photo.longitude,
    privacy: photo.locationDisclosure,
    visibility: photo.visibility,
    status: encodeModeration("published"),
    critique_welcome: photo.critiqueWelcome,
    process: photo.process,
    tags: photo.tags,
  });
  if (error) throw error;
}

export function newId() {
  return crypto.randomUUID();
}

export type { Destination, PhotographyLocation, BucketShotOpportunity, Photograph, PhotographerProfile, Trip, Collection, TripDay };
