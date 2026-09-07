"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import * as maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const maplibregl = (("Map" in maplibre ? maplibre : (maplibre as { default: typeof maplibre }).default) as typeof import("maplibre-gl"));
import { useApp } from "@/components/AppState";
import { categoryLabels, type AccessDifficulty, type PhotographyCategory } from "@/lib/domain/types";
import { clusterLocations, regionContains } from "@/lib/services/clustering";

function rasterStyle(dark: boolean) {
  return {
    version: 8 as const,
    sources: {
      carto: {
        type: "raster" as const,
        tiles: [`https://basemaps.cartocdn.com/${dark ? "dark_all" : "light_all"}/{z}/{x}/{y}@2x.png`],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      },
    },
    layers: [{ id: "carto", type: "raster" as const, source: "carto" }],
  };
}

export default function MapPage() {
  const app = useApp();
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [zoom, setZoom] = useState(5.4);
  const [selected, setSelected] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState<PhotographyCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<AccessDifficulty | "all">("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [denied, setDenied] = useState(false);

  const filtered = useMemo(() => app.catalog.locations.filter((location) => {
    if (category !== "all" && !location.categories.includes(category)) return false;
    if (difficulty !== "all" && location.accessDifficulty !== difficulty) return false;
    if (freeOnly && !location.freeEntry) return false;
    return true;
  }), [app.catalog.locations, category, difficulty, freeOnly]);

  const pins = useMemo(() => clusterLocations(filtered, zoom), [filtered, zoom]);
  const selectedLocation = filtered.find((item) => item.id === selected);

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    const dark = document.documentElement.dataset.theme === "dark" || (document.documentElement.dataset.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const map = new maplibregl.Map({
      container: mapNode.current,
      style: rasterStyle(dark),
      center: [-3.5, 55.2],
      zoom: 5.4,
    });
    map.on("load", () => map.resize());
    map.on("zoomend", () => setZoom(map.getZoom()));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers: Marker[] = [];
    for (const pin of pins) {
      const el = document.createElement("button");
      el.className = "grid h-9 min-w-9 place-items-center rounded-full bg-[var(--bs-inverse)] px-2 text-xs text-[var(--bs-bg)]";
      el.textContent = pin.kind === "cluster" ? String(pin.count) : pin.name.slice(0, 1);
      el.onclick = () => {
        if (pin.kind === "cluster") {
          map.flyTo({ center: [pin.longitude, pin.latitude], zoom: Math.min(zoom + 2, 12) });
        } else {
          setSelected(pin.id);
        }
      };
      markers.push(new maplibregl.Marker({ element: el }).setLngLat([pin.longitude, pin.latitude]).addTo(map));
    }
    return () => markers.forEach((marker) => marker.remove());
  }, [pins, zoom]);

  function locate() {
    navigator.geolocation.getCurrentPosition(
      (position) => mapRef.current?.flyTo({ center: [position.coords.longitude, position.coords.latitude], zoom: 10 }),
      () => setDenied(true),
    );
  }

  return (
    <div className="-mx-5 -mt-6 h-[calc(100vh-1px)] md:-mx-0">
      <div ref={mapNode} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4 md:left-64">
        <div className="pointer-events-auto flex w-full max-w-xl gap-2">
          <Link href="/search" className="h-12 flex-1 rounded-full bg-[var(--bs-surface)] px-5 leading-[48px] shadow">Search this area</Link>
          <button onClick={locate} className="h-12 rounded-full bg-[var(--bs-surface)] px-4">Locate</button>
          <button onClick={() => setListOpen(true)} className="h-12 rounded-full bg-[var(--bs-surface)] px-4">List</button>
          <button onClick={() => setFiltersOpen(true)} className="h-12 rounded-full bg-[var(--bs-surface)] px-4">Filter</button>
        </div>
      </div>
      {denied ? <p className="absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-full bg-[var(--bs-surface)] px-4 py-2 text-sm">Location is off. The map still works.</p> : null}
      {selectedLocation ? (
        <div className="absolute inset-x-4 bottom-24 z-10 rounded-[16px] bg-[var(--bs-surface)] p-4 shadow md:bottom-8 md:left-72 md:right-8">
          <div className="flex justify-between gap-3">
            <Link href={`/locations/${selectedLocation.id}`}>
              <h2 className="text-lg font-semibold">{selectedLocation.name}</h2>
              <p className="text-sm text-[var(--bs-text-secondary)]">{selectedLocation.region}</p>
            </Link>
            <button onClick={() => void app.toggleLocation(selectedLocation.id)}>{app.saved.locationIds.includes(selectedLocation.id) ? "Saved" : "Save"}</button>
          </div>
          <button onClick={() => setSelected(null)} className="mt-2 text-sm text-[var(--bs-text-tertiary)]">Dismiss</button>
        </div>
      ) : null}
      {listOpen ? (
        <Sheet title="Locations" onClose={() => setListOpen(false)}>
          {filtered.filter((location) => location.coordinate && regionContains(location, currentBounds(mapRef.current))).slice(0, 40).map((location) => (
            <button key={location.id} className="block w-full border-b border-[var(--bs-hairline)] py-3 text-left" onClick={() => { setSelected(location.id); mapRef.current?.flyTo({ center: [location.coordinate!.longitude, location.coordinate!.latitude], zoom: 11 }); setListOpen(false); }}>
              <strong>{location.name}</strong>
              <p className="text-sm text-[var(--bs-text-secondary)]">{location.region}</p>
            </button>
          ))}
        </Sheet>
      ) : null}
      {filtersOpen ? (
        <Sheet title="Map filters" onClose={() => setFiltersOpen(false)}>
          <select className="w-full rounded-xl bg-[var(--bs-raised)] p-3" value={category} onChange={(event) => setCategory(event.target.value as PhotographyCategory | "all")}>
            <option value="all">All categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select className="mt-3 w-full rounded-xl bg-[var(--bs-raised)] p-3" value={difficulty} onChange={(event) => setDifficulty(event.target.value as AccessDifficulty | "all")}>
            <option value="all">Any access</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="strenuous">Strenuous</option>
            <option value="expert">Expert</option>
          </select>
          <label className="mt-3 flex items-center gap-2"><input type="checkbox" checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)} /> Free entry</label>
        </Sheet>
      ) : null}
    </div>
  );
}

function currentBounds(map: MapLibreMap | null) {
  const bounds = map?.getBounds();
  if (!bounds) return { west: -10, south: 49, east: 2, north: 61 };
  return { west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth() };
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 max-h-[70vh] overflow-auto rounded-t-[20px] bg-[var(--bs-bg)] p-5">
      <div className="mb-3 flex justify-between"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose}>Close</button></div>
      {children}
    </div>
  );
}
