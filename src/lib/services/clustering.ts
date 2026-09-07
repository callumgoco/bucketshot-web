import type { PhotographyLocation } from "@/lib/domain/types";

export type MapPin =
  | { kind: "location"; id: string; latitude: number; longitude: number; name: string; count: number }
  | { kind: "cluster"; id: string; latitude: number; longitude: number; name: string; count: number; locationIds: string[] };

export function clusterLocations(locations: PhotographyLocation[], zoom: number): MapPin[] {
  const placed = locations.filter((item) => item.coordinate);
  if (zoom >= 9) {
    return placed.map((item) => ({
      kind: "location" as const,
      id: item.id,
      latitude: item.coordinate!.latitude,
      longitude: item.coordinate!.longitude,
      name: item.name,
      count: 1,
    }));
  }
  const groups = new Map<string, PhotographyLocation[]>();
  for (const location of placed) {
    const key = location.destinationId ?? location.region ?? location.id;
    const list = groups.get(key) ?? [];
    list.push(location);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([id, items]) => {
    const latitude = items.reduce((sum, item) => sum + item.coordinate!.latitude, 0) / items.length;
    const longitude = items.reduce((sum, item) => sum + item.coordinate!.longitude, 0) / items.length;
    return {
      kind: "cluster" as const,
      id,
      latitude,
      longitude,
      name: items[0]?.region || "Area",
      count: items.length,
      locationIds: items.map((item) => item.id),
    };
  });
}

export function regionContains(location: PhotographyLocation, bounds: { west: number; south: number; east: number; north: number }) {
  if (!location.coordinate) return false;
  const { latitude, longitude } = location.coordinate;
  return longitude >= bounds.west && longitude <= bounds.east && latitude >= bounds.south && latitude <= bounds.north;
}
