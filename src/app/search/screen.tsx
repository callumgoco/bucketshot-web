"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/AppState";
import { Chip, EmptyState, LocationCard, PhotoCard, ShotCard } from "@/components/ui";
import { searchFilterLabels, searchFilters, type SearchFilter } from "@/lib/domain/types";
import { localStore } from "@/lib/local/store";
import { searchCatalog } from "@/lib/services/search";

export default function SearchPage() {
  const app = useApp();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [recents, setRecents] = useState<string[]>(() => localStore.recents());
  const results = useMemo(() => searchCatalog(app.catalog, query, filters), [app.catalog, query, filters]);

  function submit(value = query) {
    const next = value.trim();
    if (!next) return;
    const updated = [next, ...recents.filter((item) => item !== next)].slice(0, 8);
    setRecents(updated);
    localStore.saveRecents(updated);
  }

  return (
    <div>
      <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="flex gap-2">
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places, shots, photographers" className="h-12 flex-1 rounded-full bg-[var(--bs-raised)] px-5 outline-none" />
        <button className="rounded-full px-4">Search</button>
      </form>
      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {searchFilters.map((filter) => (
          <Chip key={filter} active={filters.includes(filter)} onClick={() => setFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter])}>
            {searchFilterLabels[filter]}
          </Chip>
        ))}
      </div>
      {!query && !filters.length ? (
        <div className="mt-8">
          <h2 className="mb-3 font-semibold">Recent</h2>
          <div className="flex flex-wrap gap-2">
            {(recents.length ? recents : ["Isle of Skye", "Sunrise", "Glencoe"]).map((item) => (
              <button key={item} onClick={() => { setQuery(item); submit(item); }} className="rounded-full bg-[var(--bs-raised)] px-3 py-2 text-sm">{item}</button>
            ))}
          </div>
        </div>
      ) : results.destinations.length + results.locations.length + results.bucketShots.length + results.photographs.length + results.photographers.length === 0 ? (
        <div className="mt-8"><EmptyState title="No matches" message="Try a place, light, or subject." /></div>
      ) : (
        <div className="mt-8 space-y-8">
          <Result title="Destinations" items={results.destinations.map((item) => ({ href: `/destinations/${item.id}`, title: item.name, meta: item.region, image: item.coverImage.url }))} />
          <div className="grid gap-3 md:grid-cols-2">
            {results.locations.map((item) => <LocationCard key={item.id} href={`/locations/${item.id}`} title={item.name} meta={item.region} image={item.coverImage.url} saved={app.saved.locationIds.includes(item.id)} onSave={() => void app.toggleLocation(item.id)} />)}
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {results.bucketShots.map((item) => <ShotCard key={item.id} href={`/shots/${item.id}`} title={item.title} meta={item.description} image={item.coverImage.url} />)}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {results.photographs.map((item) => <PhotoCard key={item.id} href={`/photographs/${item.id}`} title={item.title} image={item.image.url} />)}
          </div>
          {results.photographers.map((item) => <a key={item.id} href={`/photographers/${item.id}`} className="block">{item.displayName}</a>)}
        </div>
      )}
    </div>
  );
}

function Result({ title, items }: { title: string; items: Array<{ href: string; title: string; meta: string; image?: string | null }> }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => <LocationCard key={item.href} {...item} />)}
      </div>
    </section>
  );
}
