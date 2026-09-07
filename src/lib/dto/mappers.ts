import type {
  AccessDifficulty,
  AudiencePrivacy,
  BucketShotOpportunity,
  CoordinatePrecision,
  CritiqueCategory,
  Destination,
  LightCondition,
  ModerationStatus,
  PhotoProcess,
  Photograph,
  PhotographyCategory,
  PhotographyLocation,
  PhotographyTip,
  PhotographerProfile,
  SavedBucketShotStatus,
  Season,
  ShotOrientation,
} from "@/lib/domain/types";

const moderationFromDb: Record<string, ModerationStatus> = {
  draft: "draft",
  pending_review: "pendingReview",
  published: "published",
  rejected: "rejected",
  archived: "archived",
};

const moderationToDb: Record<ModerationStatus, string> = {
  draft: "draft",
  pendingReview: "pending_review",
  published: "published",
  rejected: "rejected",
  archived: "archived",
};

const savedFromDb: Record<string, SavedBucketShotStatus> = {
  want_to_shoot: "wantToShoot",
  planned: "planned",
  shot: "shot",
};

const savedToDb: Record<SavedBucketShotStatus, string> = {
  wantToShoot: "want_to_shoot",
  planned: "planned",
  shot: "shot",
};

const lightFromDb: Record<string, LightCondition> = {
  sunrise: "sunrise",
  goldenHour: "goldenHour",
  golden_hour: "goldenHour",
  blueHour: "blueHour",
  blue_hour: "blueHour",
  sunset: "sunset",
  midday: "midday",
  overcast: "overcast",
  fog: "fog",
  night: "night",
  aurora: "aurora",
};

export function decodeModeration(value: string | null | undefined): ModerationStatus {
  return moderationFromDb[value ?? ""] ?? "published";
}

export function encodeModeration(value: ModerationStatus) {
  return moderationToDb[value];
}

export function decodeSavedStatus(value: string | null | undefined): SavedBucketShotStatus {
  return savedFromDb[value ?? ""] ?? "wantToShoot";
}

export function encodeSavedStatus(value: SavedBucketShotStatus) {
  return savedToDb[value];
}

function asArray<T extends string>(value: unknown, allowed?: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is T => typeof item === "string" && (!allowed || allowed.includes(item as T)));
}

function decodeLights(value: unknown): LightCondition[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => lightFromDb[String(item)]).filter(Boolean) as LightCondition[];
}

function media(url: string | null | undefined, alt: string) {
  return { url: url ?? null, altText: alt };
}

export function mapDestination(row: Record<string, unknown>): Destination {
  return {
    id: String(row.id),
    createdBy: (row.created_by as string) ?? null,
    name: String(row.name ?? ""),
    slug: (row.slug as string) ?? null,
    region: String(row.region ?? ""),
    country: String(row.country ?? ""),
    summary: String(row.summary ?? ""),
    description: String(row.description ?? ""),
    coordinate: {
      latitude: Number(row.latitude ?? 0),
      longitude: Number(row.longitude ?? 0),
    },
    tags: asArray(row.tags),
    bestSeasons: asArray<Season>(row.best_seasons, ["spring", "summer", "autumn", "winter"]),
    coverImage: media(row.hero_image_url as string, String(row.name ?? "Destination")),
    gallery: asArray(row.gallery),
    privacy: ((row.privacy as AudiencePrivacy) ?? "public"),
    status: decodeModeration(row.status as string),
  };
}

export function mapTip(row: Record<string, unknown>): PhotographyTip & { locationId: string | null; bucketShotId: string | null } {
  return {
    id: String(row.id),
    locationId: (row.location_id as string) ?? null,
    bucketShotId: (row.bucket_shot_id as string) ?? null,
    title: String(row.title ?? ""),
    detail: String(row.detail ?? ""),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function mapLocation(row: Record<string, unknown>, tips: PhotographyTip[] = []): PhotographyLocation {
  const lat = row.latitude == null ? null : Number(row.latitude);
  const lng = row.longitude == null ? null : Number(row.longitude);
  return {
    id: String(row.id),
    createdBy: (row.created_by as string) ?? null,
    destinationId: (row.destination_id as string) ?? null,
    name: String(row.name ?? ""),
    slug: (row.slug as string) ?? null,
    summary: String(row.summary ?? ""),
    description: String(row.description ?? ""),
    coordinate: lat == null || lng == null ? null : { latitude: lat, longitude: lng, altitudeMeters: row.altitude_meters == null ? null : Number(row.altitude_meters) },
    region: String(row.region ?? ""),
    country: String(row.country ?? ""),
    categories: asArray<PhotographyCategory>(row.categories),
    tags: asArray(row.tags),
    accessDifficulty: ((row.access_difficulty as AccessDifficulty) ?? "easy"),
    freeEntry: row.free_entry !== false,
    walkingTimeMinutes: row.walking_time_minutes == null ? null : Number(row.walking_time_minutes),
    distanceKilometers: row.distance_kilometers == null ? null : Number(row.distance_kilometers),
    accessNotes: String(row.access_notes ?? ""),
    parkingNotes: String(row.parking_notes ?? ""),
    publicTransportNotes: String(row.public_transport_notes ?? ""),
    hazards: String(row.hazards ?? ""),
    isRoadside: Boolean(row.is_roadside),
    preferredLight: decodeLights(row.preferred_light),
    preferredSeasons: asArray<Season>(row.preferred_seasons, ["spring", "summer", "autumn", "winter"]),
    conditionsNotes: String(row.conditions_notes ?? ""),
    privacy: ((row.privacy as AudiencePrivacy) ?? "public"),
    coordinatePrecision: ((row.coordinate_precision as CoordinatePrecision) ?? "exact"),
    status: decodeModeration(row.status as string),
    isCurated: Boolean(row.is_curated),
    coverImage: media(row.hero_image_url as string, String(row.name ?? "Location")),
    gallery: asArray(row.gallery),
    tips,
  };
}

export function mapBucketShot(row: Record<string, unknown>): BucketShotOpportunity {
  const camLat = row.camera_latitude == null ? null : Number(row.camera_latitude);
  const camLng = row.camera_longitude == null ? null : Number(row.camera_longitude);
  const tarLat = row.target_latitude == null ? null : Number(row.target_latitude);
  const tarLng = row.target_longitude == null ? null : Number(row.target_longitude);
  return {
    id: String(row.id),
    locationId: String(row.location_id),
    createdBy: (row.created_by as string) ?? null,
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    compositionNotes: String(row.composition_notes ?? ""),
    camera: camLat == null || camLng == null ? null : { latitude: camLat, longitude: camLng },
    subject: tarLat == null || tarLng == null ? null : { latitude: tarLat, longitude: tarLng },
    heading: row.heading == null ? null : Number(row.heading),
    focalMin: row.recommended_focal_length_min == null ? null : Number(row.recommended_focal_length_min),
    focalMax: row.recommended_focal_length_max == null ? null : Number(row.recommended_focal_length_max),
    suggestedAperture: (row.suggested_aperture as string) ?? null,
    suggestedShutterSpeed: (row.suggested_shutter_speed as string) ?? null,
    suggestedIso: row.suggested_iso == null ? null : Number(row.suggested_iso),
    orientation: (row.orientation as ShotOrientation) ?? null,
    tripodRecommended: Boolean(row.tripod_recommended),
    filterNotes: String(row.filter_notes ?? ""),
    bestLight: decodeLights(row.best_light),
    seasonNotes: asArray<Season>(row.season_notes, ["spring", "summer", "autumn", "winter"]),
    weatherNotes: String(row.weather_notes ?? ""),
    tags: asArray(row.tags),
    privacy: ((row.privacy as AudiencePrivacy) ?? "public"),
    coordinatePrecision: ((row.coordinate_precision as CoordinatePrecision) ?? "exact"),
    status: decodeModeration(row.status as string),
    coverImage: media(row.hero_image_url as string, String(row.title ?? "Bucket Shot")),
  };
}

function decodeProcess(value: unknown): PhotoProcess {
  const row = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    usedLightroom: Boolean(row.usedLightroom ?? row.used_lightroom),
    usedPhotoshop: Boolean(row.usedPhotoshop ?? row.used_photoshop),
    exposureBlend: Boolean(row.exposureBlend ?? row.exposure_blend),
    panorama: Boolean(row.panorama),
    focusStack: Boolean(row.focusStack ?? row.focus_stack),
  };
}

export function mapPhotograph(row: Record<string, unknown>): Photograph {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    locationId: (row.location_id as string) ?? null,
    bucketShotId: (row.bucket_shot_id as string) ?? null,
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    story: String(row.story ?? ""),
    processNotes: String(row.process_notes ?? ""),
    challenges: String(row.challenges ?? ""),
    image: media((row.image_url as string) ?? (row.thumbnail_url as string), String(row.title ?? "Photograph")),
    imagePath: (row.image_path as string) ?? null,
    thumbnailUrl: (row.thumbnail_url as string) ?? null,
    captureDate: (row.capture_date as string) ?? null,
    camera: (row.camera as string) ?? null,
    lens: (row.lens as string) ?? null,
    focalLength: row.focal_length == null ? null : Number(row.focal_length),
    aperture: row.aperture == null ? null : Number(row.aperture),
    shutterSpeed: (row.shutter_speed as string) ?? null,
    iso: row.iso == null ? null : Number(row.iso),
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    locationDisclosure: ((row.privacy as CoordinatePrecision) ?? "exact"),
    visibility: ((row.visibility as AudiencePrivacy) ?? "public"),
    status: decodeModeration(row.status as string),
    critiqueWelcome: Boolean(row.critique_welcome),
    process: decodeProcess(row.process),
    tags: asArray(row.tags),
    createdAt: (row.created_at as string) ?? null,
  };
}

export function mapProfile(row: Record<string, unknown>): PhotographerProfile {
  return {
    id: String(row.id),
    username: String(row.username ?? ""),
    displayName: String(row.display_name ?? ""),
    bio: String(row.bio ?? ""),
    avatarUrl: (row.avatar_url as string) ?? null,
    homeRegion: String(row.home_region ?? ""),
    websiteUrl: (row.website_url as string) ?? null,
    specialties: asArray<PhotographyCategory>(row.photography_specialties),
    gearNotes: String(row.gear_notes ?? ""),
    createdAt: (row.created_at as string) ?? null,
  };
}

export function mapComment(row: Record<string, unknown>): { id: string; photoId: string; userId: string; body: string; critiqueCategories: CritiqueCategory[]; createdAt: string | null; authorName: string } {
  const profiles = row.profiles as { display_name?: string } | { display_name?: string }[] | null;
  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  return {
    id: String(row.id),
    photoId: String(row.photo_id),
    userId: String(row.user_id),
    body: String(row.body ?? ""),
    critiqueCategories: asArray<CritiqueCategory>(row.critique_categories),
    createdAt: (row.created_at as string) ?? null,
    authorName: profile?.display_name ?? "Photographer",
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
