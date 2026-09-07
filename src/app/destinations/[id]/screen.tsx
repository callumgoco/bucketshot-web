"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppState";
import { Cover, EmptyState, PhotoCard, ShotCard } from "@/components/ui";

export default function DestinationPage() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  if (!app.ready) return <p className="text-[var(--bs-text-secondary)]">Loading…</p>;
  const destination = app.catalog.destinations.find((item) => item.id === id);
  if (!destination) return <EmptyState title="Destination not found" message="This region is not in the catalog." />;
  const locations = app.catalog.locations.filter((item) => item.destinationId === destination.id);
  const locationIds = new Set(locations.map((item) => item.id));
  const shots = app.catalog.bucketShots.filter((item) => locationIds.has(item.locationId)).slice(0, 6);
  const photos = app.catalog.photographs.filter((item) => item.locationId && locationIds.has(item.locationId)).slice(0, 6);
  return (
    <article>
      <Cover src={destination.coverImage.url} alt={destination.name} className="h-72 w-full rounded-[16px]" />
      <p className="mt-4 text-sm uppercase tracking-[1.4px] text-[var(--bs-text-tertiary)]">{destination.region}</p>
      <h1 className="text-4xl font-semibold">{destination.name}</h1>
      <p className="mt-3 max-w-2xl text-[var(--bs-text-secondary)]">{destination.description || destination.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">{destination.bestSeasons.map((season) => <span key={season} className="rounded-full bg-[var(--bs-raised)] px-3 py-1 text-sm capitalize">{season}</span>)}</div>
      <h2 className="mt-8 text-xl font-semibold">Locations</h2>
      <div className="mt-3 space-y-3">
        {locations.map((location) => (
          <div key={location.id} className="flex items-center justify-between rounded-[16px] bg-[var(--bs-surface)] p-3">
            <Link href={`/locations/${location.id}`}><strong>{location.name}</strong><p className="text-sm text-[var(--bs-text-secondary)]">{location.summary}</p></Link>
            <button onClick={() => void app.toggleLocation(location.id)}>{app.saved.locationIds.includes(location.id) ? "Saved" : "Save"}</button>
          </div>
        ))}
      </div>
      <h2 className="mt-8 text-xl font-semibold">Bucket Shots</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto">{shots.map((shot) => <ShotCard key={shot.id} href={`/shots/${shot.id}`} title={shot.title} meta={locations.find((item) => item.id === shot.locationId)?.name ?? ""} image={shot.coverImage.url} />)}</div>
      <h2 className="mt-8 text-xl font-semibold">Photographs</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">{photos.map((photo) => <PhotoCard key={photo.id} href={`/photographs/${photo.id}`} title={photo.title} image={photo.image.url} />)}</div>
    </article>
  );
}
