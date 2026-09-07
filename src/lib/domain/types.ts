export const photographyCategories = [
  "landscape",
  "wildlife",
  "astrophotography",
  "woodland",
  "coastal",
  "architecture",
  "street",
  "macro",
  "portrait",
  "sports",
  "product",
  "event",
  "travel",
  "food",
] as const;

export type PhotographyCategory = (typeof photographyCategories)[number];

export const categoryLabels: Record<PhotographyCategory, string> = {
  landscape: "Landscape",
  wildlife: "Wildlife",
  astrophotography: "Astrophotography",
  woodland: "Woodland",
  coastal: "Coastal",
  architecture: "Architecture",
  street: "Street",
  macro: "Macro",
  portrait: "Portraits",
  sports: "Sports",
  product: "Product",
  event: "Events",
  travel: "Travel",
  food: "Food",
};

export const lightConditions = [
  "sunrise",
  "goldenHour",
  "blueHour",
  "sunset",
  "midday",
  "overcast",
  "fog",
  "night",
  "aurora",
] as const;

export type LightCondition = (typeof lightConditions)[number];

export const lightLabels: Record<LightCondition, string> = {
  sunrise: "Sunrise",
  goldenHour: "Golden hour",
  blueHour: "Blue hour",
  sunset: "Sunset",
  midday: "Midday",
  overcast: "Overcast",
  fog: "Fog",
  night: "Night",
  aurora: "Aurora",
};

export const seasons = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof seasons)[number];

export const accessDifficulties = ["easy", "moderate", "strenuous", "expert"] as const;
export type AccessDifficulty = (typeof accessDifficulties)[number];

export const audienceValues = ["public", "community", "private"] as const;
export type AudiencePrivacy = (typeof audienceValues)[number];

export const coordinatePrecisions = ["exact", "approximate", "private"] as const;
export type CoordinatePrecision = (typeof coordinatePrecisions)[number];

export const moderationStatuses = ["draft", "pendingReview", "published", "rejected", "archived"] as const;
export type ModerationStatus = (typeof moderationStatuses)[number];

export const savedShotStatuses = ["wantToShoot", "planned", "shot"] as const;
export type SavedBucketShotStatus = (typeof savedShotStatuses)[number];

export const savedShotLabels: Record<SavedBucketShotStatus, string> = {
  wantToShoot: "Want to Shoot",
  planned: "Planned",
  shot: "Shot",
};

export const shotOrientations = ["landscape", "portrait", "either"] as const;
export type ShotOrientation = (typeof shotOrientations)[number];

export const critiqueCategories = ["composition", "editing", "colour", "technique", "storytelling"] as const;
export type CritiqueCategory = (typeof critiqueCategories)[number];

export const critiqueLabels: Record<CritiqueCategory, string> = {
  composition: "Composition",
  editing: "Editing",
  colour: "Colour",
  technique: "Technique",
  storytelling: "Storytelling",
};

export const searchFilters = [
  "landscape",
  "wildlife",
  "astro",
  "coastal",
  "mountains",
  "sunrise",
  "sunset",
  "freeAccess",
  "easyAccess",
] as const;
export type SearchFilter = (typeof searchFilters)[number];

export const searchFilterLabels: Record<SearchFilter, string> = {
  landscape: "Landscape",
  wildlife: "Wildlife",
  astro: "Astro",
  coastal: "Coastal",
  mountains: "Mountains",
  sunrise: "Sunrise",
  sunset: "Sunset",
  freeAccess: "Free access",
  easyAccess: "Easy access",
};

export type GeoCoordinate = {
  latitude: number;
  longitude: number;
  altitudeMeters?: number | null;
};

export type MediaAsset = {
  url: string | null;
  altText: string;
  width?: number | null;
  height?: number | null;
  localPreview?: string | null;
};

export type PhotographyTip = {
  id: string;
  title: string;
  detail: string;
  sortOrder: number;
};

export type Destination = {
  id: string;
  createdBy: string | null;
  name: string;
  slug: string | null;
  region: string;
  country: string;
  summary: string;
  description: string;
  coordinate: GeoCoordinate;
  tags: string[];
  bestSeasons: Season[];
  coverImage: MediaAsset;
  gallery: string[];
  privacy: AudiencePrivacy;
  status: ModerationStatus;
};

export type PhotographyLocation = {
  id: string;
  createdBy: string | null;
  destinationId: string | null;
  name: string;
  slug: string | null;
  summary: string;
  description: string;
  coordinate: GeoCoordinate | null;
  region: string;
  country: string;
  categories: PhotographyCategory[];
  tags: string[];
  accessDifficulty: AccessDifficulty;
  freeEntry: boolean;
  walkingTimeMinutes: number | null;
  distanceKilometers: number | null;
  accessNotes: string;
  parkingNotes: string;
  publicTransportNotes: string;
  hazards: string;
  isRoadside: boolean;
  preferredLight: LightCondition[];
  preferredSeasons: Season[];
  conditionsNotes: string;
  privacy: AudiencePrivacy;
  coordinatePrecision: CoordinatePrecision;
  status: ModerationStatus;
  isCurated: boolean;
  coverImage: MediaAsset;
  gallery: string[];
  tips: PhotographyTip[];
};

export type BucketShotOpportunity = {
  id: string;
  locationId: string;
  createdBy: string | null;
  title: string;
  description: string;
  compositionNotes: string;
  camera: GeoCoordinate | null;
  subject: GeoCoordinate | null;
  heading: number | null;
  focalMin: number | null;
  focalMax: number | null;
  suggestedAperture: string | null;
  suggestedShutterSpeed: string | null;
  suggestedIso: number | null;
  orientation: ShotOrientation | null;
  tripodRecommended: boolean;
  filterNotes: string;
  bestLight: LightCondition[];
  seasonNotes: Season[];
  weatherNotes: string;
  tags: string[];
  privacy: AudiencePrivacy;
  coordinatePrecision: CoordinatePrecision;
  status: ModerationStatus;
  coverImage: MediaAsset;
};

export type PhotoProcess = {
  usedLightroom: boolean;
  usedPhotoshop: boolean;
  exposureBlend: boolean;
  panorama: boolean;
  focusStack: boolean;
};

export type Photograph = {
  id: string;
  userId: string;
  locationId: string | null;
  bucketShotId: string | null;
  title: string;
  description: string;
  story: string;
  processNotes: string;
  challenges: string;
  image: MediaAsset;
  imagePath: string | null;
  thumbnailUrl: string | null;
  captureDate: string | null;
  camera: string | null;
  lens: string | null;
  focalLength: number | null;
  aperture: number | null;
  shutterSpeed: string | null;
  iso: number | null;
  latitude: number | null;
  longitude: number | null;
  locationDisclosure: CoordinatePrecision;
  visibility: AudiencePrivacy;
  status: ModerationStatus;
  critiqueWelcome: boolean;
  process: PhotoProcess;
  tags: string[];
  createdAt: string | null;
};

export type PhotographerProfile = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  homeRegion: string;
  websiteUrl: string | null;
  specialties: PhotographyCategory[];
  gearNotes: string;
  createdAt: string | null;
};

export type PhotoProject = {
  id: string;
  title: string;
  summary: string;
  photographerId: string;
  photographIds: string[];
  year: number | null;
  coverPhotographId: string | null;
};

export type TripGearItem = {
  id: string;
  title: string;
  isChecked: boolean;
  isCustom: boolean;
  sortOrder: number;
};

export type TripStop = {
  id: string;
  tripDayId: string;
  locationId: string | null;
  bucketShotId: string | null;
  kind: "location" | "bucketShot";
  time: string | null;
  notes: string;
  sortOrder: number;
};

export type TripDay = {
  id: string;
  tripId: string;
  date: string | null;
  title: string;
  notes: string;
  sortOrder: number;
  stops: TripStop[];
};

export type Trip = {
  id: string;
  userId: string | null;
  title: string;
  destination: string;
  summary: string;
  startDate: string | null;
  endDate: string | null;
  notes: string;
  heroImageUrl: string | null;
  gear: TripGearItem[];
  days: TripDay[];
  destinationIds: string[];
  isSample: boolean;
  createdAt: string | null;
};

export type Collection = {
  id: string;
  userId: string | null;
  title: string;
  summary: string;
  heroImageUrl: string | null;
  locationIds: string[];
  bucketShotIds: string[];
  isSample: boolean;
  createdAt: string | null;
};

export type Comment = {
  id: string;
  photoId: string;
  userId: string;
  body: string;
  critiqueCategories: CritiqueCategory[];
  createdAt: string | null;
  authorName: string;
};

export type SavedItems = {
  locationIds: string[];
  bucketShotIds: string[];
  photographIds: string[];
  bucketShotStatuses: Record<string, SavedBucketShotStatus>;
};

export type CommunityState = {
  appreciatedPhotographIds: string[];
  followedPhotographerIds: string[];
};

export type CatalogSnapshot = {
  destinations: Destination[];
  locations: PhotographyLocation[];
  bucketShots: BucketShotOpportunity[];
  photographs: Photograph[];
  photographers: PhotographerProfile[];
  projects: PhotoProject[];
  tips: PhotographyTip[];
};

export const emptyCatalog = (): CatalogSnapshot => ({
  destinations: [],
  locations: [],
  bucketShots: [],
  photographs: [],
  photographers: [],
  projects: [],
  tips: [],
});

export const emptySavedItems = (): SavedItems => ({
  locationIds: [],
  bucketShotIds: [],
  photographIds: [],
  bucketShotStatuses: {},
});

export function geographicContext(location: PhotographyLocation) {
  return [location.region, location.country].filter(Boolean).join(", ");
}

export function glanceLine(location: PhotographyLocation) {
  const parts = [
    location.categories[0] ? categoryLabels[location.categories[0]] : null,
    location.preferredLight[0] ? lightLabels[location.preferredLight[0]] : null,
    location.accessDifficulty,
    location.walkingTimeMinutes ? `${location.walkingTimeMinutes} min walk` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function focalLabel(shot: BucketShotOpportunity) {
  if (shot.focalMin && shot.focalMax) return `${shot.focalMin}–${shot.focalMax}mm`;
  if (shot.focalMin) return `${shot.focalMin}mm`;
  return null;
}
