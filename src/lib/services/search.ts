import type { CatalogSnapshot, PhotographyLocation, Photograph, PhotographerProfile, SearchFilter } from "@/lib/domain/types";

function haystack(...parts: Array<string | null | undefined | string[]>) {
  return parts
    .flatMap((part) => (Array.isArray(part) ? part : [part ?? ""]))
    .join(" ")
    .toLowerCase();
}

function matchesQuery(text: string, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return needle.split(/\s+/).every((token) => text.includes(token));
}

function locationPasses(location: PhotographyLocation, filters: SearchFilter[]) {
  return filters.every((filter) => {
    if (filter === "landscape") return location.categories.includes("landscape");
    if (filter === "wildlife") return location.categories.includes("wildlife");
    if (filter === "astro") return location.categories.includes("astrophotography") || location.preferredLight.includes("night");
    if (filter === "coastal") return location.categories.includes("coastal");
    if (filter === "mountains") return location.categories.includes("landscape") && /mountain|ben |glen|cairn|peak/i.test(`${location.name} ${location.tags.join(" ")}`);
    if (filter === "sunrise") return location.preferredLight.includes("sunrise") || location.preferredLight.includes("goldenHour");
    if (filter === "sunset") return location.preferredLight.includes("sunset") || location.preferredLight.includes("goldenHour");
    if (filter === "freeAccess") return location.freeEntry;
    if (filter === "easyAccess") return location.accessDifficulty === "easy";
    return true;
  });
}

export function searchCatalog(catalog: CatalogSnapshot, query: string, filters: SearchFilter[] = []) {
  const destinations = catalog.destinations.filter((item) =>
    matchesQuery(haystack(item.name, item.region, item.country, item.summary, item.tags), query),
  );
  const locations = catalog.locations.filter(
    (item) =>
      locationPasses(item, filters) &&
      matchesQuery(haystack(item.name, item.region, item.summary, item.categories, item.tags), query),
  );
  const locationIds = new Set(locations.map((item) => item.id));
  const bucketShots = catalog.bucketShots.filter((item) => {
    const location = catalog.locations.find((loc) => item.locationId === loc.id);
    const filterOk = !location || locationPasses(location, filters);
    return (
      filterOk &&
      (matchesQuery(haystack(item.title, item.description, item.tags, item.bestLight), query) ||
        (query.trim() && locationIds.has(item.locationId) && locations.some((loc) => loc.id === item.locationId && matchesQuery(loc.name.toLowerCase(), query))))
    );
  });
  const photographs = catalog.photographs.filter((item) =>
    matchesQuery(haystack(item.title, item.story, item.tags, item.camera), query),
  );
  const photographers = catalog.photographers.filter((item) =>
    matchesQuery(haystack(item.displayName, item.username, item.homeRegion, item.specialties), query),
  );
  return { destinations, locations, bucketShots, photographs, photographers };
}

export function edinburghLocationIds(catalog: CatalogSnapshot) {
  const edinburgh = catalog.destinations.find((item) => /edinburgh/i.test(item.name));
  return new Set(catalog.locations.filter((item) => item.destinationId === edinburgh?.id || /edinburgh/i.test(item.region)).map((item) => item.id));
}

export function photographerName(catalog: CatalogSnapshot, photo: Photograph) {
  return catalog.photographers.find((item) => item.id === photo.userId)?.displayName ?? "Photographer";
}

export function locationById(catalog: CatalogSnapshot, id: string | null | undefined) {
  if (!id) return undefined;
  return catalog.locations.find((item) => item.id === id);
}

export function shotCount(catalog: CatalogSnapshot, location: PhotographyLocation) {
  return catalog.bucketShots.filter((item) => item.locationId === location.id).length;
}

export type { PhotographerProfile };
