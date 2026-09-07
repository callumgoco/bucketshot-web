"use client";

import { useEffect, useRef } from "react";
import type { Marker } from "maplibre-gl";
import * as maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const maplibregl = (("Map" in maplibre ? maplibre : (maplibre as { default: typeof maplibre }).default) as typeof import("maplibre-gl"));
import type { CatalogSnapshot, Trip } from "@/lib/domain/types";

export function TripMap({ trip, catalog }: { trip: Trip; catalog: CatalogSnapshot }) {
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!node.current) return;
    const map = new maplibregl.Map({
      container: node.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: "raster",
            tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap &copy; CARTO",
          },
        },
        layers: [{ id: "carto", type: "raster", source: "carto" }],
      },
      center: [-4, 56],
      zoom: 6,
    });
    const markers: Marker[] = [];
    trip.days.flatMap((day) => day.stops).forEach((stop, index) => {
      const location = catalog.locations.find((item) => item.id === stop.locationId);
      if (!location?.coordinate) return;
      const el = document.createElement("div");
      el.className = "grid h-8 w-8 place-items-center rounded-full bg-[#e8a84a] text-sm font-semibold";
      el.textContent = String(index + 1);
      markers.push(new maplibregl.Marker({ element: el }).setLngLat([location.coordinate.longitude, location.coordinate.latitude]).addTo(map));
    });
    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [catalog.locations, trip]);
  return <div ref={node} className="mt-4 h-[420px] overflow-hidden rounded-[16px]" />;
}
