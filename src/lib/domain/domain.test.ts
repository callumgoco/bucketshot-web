import { describe, expect, it } from "vitest";
import { decodeModeration, decodeSavedStatus, encodeModeration, encodeSavedStatus, mapPhotograph } from "@/lib/dto/mappers";
import { displayCoordinate } from "@/lib/services/coordinatePrivacy";
import { searchCatalog } from "@/lib/services/search";
import { clusterLocations, regionContains } from "@/lib/services/clustering";
import { lightTimes, formatClock, lightTimesArePlausible } from "@/lib/services/conditions";
import { timeZoneForCoordinate } from "@/lib/services/timezone";
import { dayCount } from "@/lib/services/trips";
import type { CatalogSnapshot, PhotographyLocation } from "@/lib/domain/types";

describe("mappers", () => {
  it("converts moderation and saved-shot statuses", () => {
    expect(decodeModeration("pending_review")).toBe("pendingReview");
    expect(encodeModeration("pendingReview")).toBe("pending_review");
    expect(decodeSavedStatus("want_to_shoot")).toBe("wantToShoot");
    expect(encodeSavedStatus("wantToShoot")).toBe("want_to_shoot");
  });

  it("keeps photograph privacy as coordinate disclosure and visibility as audience", () => {
    const photo = mapPhotograph({
      id: "p1",
      user_id: "u1",
      title: "Harbour",
      privacy: "approximate",
      visibility: "community",
      status: "published",
    });
    expect(photo.locationDisclosure).toBe("approximate");
    expect(photo.visibility).toBe("community");
  });
});

describe("coordinate privacy", () => {
  it("redacts non-owners the same way as the iOS client", () => {
    expect(displayCoordinate(55.12345, "exact", false)).toBe(55.12345);
    expect(displayCoordinate(55.12345, "approximate", false)).toBe(55.12);
    expect(displayCoordinate(55.12345, "private", false)).toBeNull();
    expect(displayCoordinate(55.12345, "private", true)).toBe(55.12345);
  });
});

describe("search and clustering", () => {
  const location: PhotographyLocation = {
    id: "loc-1",
    createdBy: null,
    destinationId: "dest-1",
    name: "Old Man of Storr",
    slug: null,
    summary: "A Skye landmark",
    description: "",
    coordinate: { latitude: 57.5, longitude: -6.18 },
    region: "Isle of Skye",
    country: "Scotland",
    categories: ["landscape"],
    tags: ["sunrise"],
    accessDifficulty: "easy",
    freeEntry: true,
    walkingTimeMinutes: 40,
    distanceKilometers: 2,
    accessNotes: "",
    parkingNotes: "",
    publicTransportNotes: "",
    hazards: "",
    isRoadside: false,
    preferredLight: ["sunrise"],
    preferredSeasons: ["autumn"],
    conditionsNotes: "",
    privacy: "public",
    coordinatePrecision: "exact",
    status: "published",
    isCurated: true,
    coverImage: { url: null, altText: "Storr" },
    gallery: [],
    tips: [],
  };
  const catalog: CatalogSnapshot = {
    destinations: [],
    locations: [location],
    bucketShots: [],
    photographs: [],
    photographers: [],
    projects: [],
    tips: [],
  };

  it("matches a place name and free-access filter", () => {
    expect(searchCatalog(catalog, "storr").locations).toHaveLength(1);
    expect(searchCatalog(catalog, "", ["freeAccess", "easyAccess"]).locations).toHaveLength(1);
    expect(searchCatalog(catalog, "", ["wildlife"]).locations).toHaveLength(0);
  });

  it("clusters distant locations at country zoom and keeps pins when zoomed in", () => {
    expect(clusterLocations([location], 5)[0]?.kind).toBe("cluster");
    expect(clusterLocations([location], 10)[0]?.kind).toBe("location");
    expect(regionContains(location, { west: -7, south: 57, east: -6, north: 58 })).toBe(true);
  });
});

describe("conditions and trips", () => {
  it("calculates sunrise and sunset for a summer day in Scotland", () => {
    const times = lightTimes({ latitude: 56.8, longitude: -5.1 }, new Date("2026-06-21T12:00:00Z"));
    expect(times.sunrise).not.toBeNull();
    expect(times.sunset && times.sunrise && times.sunset > times.sunrise).toBe(true);
  });

  it("formats light times in the location timezone, not the viewer timezone", () => {
    const coordinate = { latitude: 57.3, longitude: -6.2 };
    const timeZone = timeZoneForCoordinate(coordinate);
    const times = lightTimes(coordinate, new Date("2026-09-08T12:00:00Z"));
    expect(lightTimesArePlausible(times, timeZone)).toBe(true);
    const sunrise = formatClock(times.sunrise, timeZone);
    const sunset = formatClock(times.sunset, timeZone);
    const riseHour = Number(sunrise.split(":")[0]);
    const setHour = Number(sunset.split(":")[0]);
    expect(riseHour).toBeGreaterThanOrEqual(4);
    expect(riseHour).toBeLessThanOrEqual(9);
    expect(setHour).toBeGreaterThanOrEqual(16);
    expect(setHour).toBeLessThanOrEqual(22);
    expect(formatClock(times.sunrise, "America/Los_Angeles")).not.toBe(sunrise);
  });

  it("counts inclusive trip days", () => {
    expect(dayCount("2026-09-01", "2026-09-03")).toBe(3);
    expect(dayCount(null, null)).toBe(1);
  });
});
