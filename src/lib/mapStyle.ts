import type { StyleSpecification } from "maplibre-gl";

/** Basemap style for MapLibre. Uses Carto when `NEXT_PUBLIC_CARTO_API_KEY` is set, otherwise OpenStreetMap. */
export function mapBasemapStyle(dark = false): StyleSpecification | string {
  const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY?.trim();
  if (cartoKey) {
    const style = dark ? "dark-matter-gl-style" : "positron-gl-style";
    return `https://basemaps.cartocdn.com/gl/${style}/style.json?key=${cartoKey}`;
  }
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap contributors",
      },
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }],
  };
}
