"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppState";
import { Chip, EmptyState, fieldClass, ShotCard } from "@/components/ui";
import { savedShotLabels, savedShotStatuses, type SavedBucketShotStatus } from "@/lib/domain/types";
import { newId } from "@/lib/repositories/catalog";

export default function BucketPage() {
  const app = useApp();
  const [segment, setSegment] = useState<"shots" | "locations" | "collections">("shots");
  const [status, setStatus] = useState<SavedBucketShotStatus | "all">("all");
  const [title, setTitle] = useState("");
  const shots = useMemo(() => app.catalog.bucketShots.filter((item) => app.saved.bucketShotIds.includes(item.id) && (status === "all" || app.saved.bucketShotStatuses[item.id] === status)), [app, status]);
  const locations = app.catalog.locations.filter((item) => app.saved.locationIds.includes(item.id));

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px] font-semibold">Bucket</h1>
        <div className="flex gap-2">
          <Link href="/trips" className="rounded-full bg-[var(--bs-raised)] px-4 py-2 text-sm">Trips</Link>
          {segment === "collections" ? (
            <form onSubmit={(event) => { event.preventDefault(); if (!title.trim()) return; void app.upsertCollection({ id: newId(), userId: app.session?.user.id ?? null, title, summary: "", heroImageUrl: null, locationIds: [], bucketShotIds: [], isSample: false, createdAt: new Date().toISOString() }); setTitle(""); }} className="flex gap-2">
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New collection" className="rounded-full bg-[var(--bs-raised)] px-3" />
              <button className="rounded-full bg-[var(--bs-accent)] px-3 text-[var(--bs-inverse)]">+</button>
            </form>
          ) : null}
        </div>
      </header>
      <div className="flex gap-2">
        {(["shots", "locations", "collections"] as const).map((item) => <Chip key={item} active={segment === item} onClick={() => setSegment(item)}>{item === "shots" ? "Bucket Shots" : item[0].toUpperCase() + item.slice(1)}</Chip>)}
      </div>
      {segment === "shots" ? (
        <div className="mt-4">
          <div className="mb-4 flex gap-2 overflow-x-auto">{savedShotStatuses.map((item) => <Chip key={item} active={status === item} onClick={() => setStatus(status === item ? "all" : item)}>{savedShotLabels[item]}</Chip>)}</div>
          {shots.length ? <div className="grid gap-3 md:grid-cols-2">{shots.map((shot) => <div key={shot.id}><ShotCard href={`/shots/${shot.id}`} title={shot.title} meta={app.catalog.locations.find((item) => item.id === shot.locationId)?.name ?? ""} image={shot.coverImage.url} status={savedShotLabels[app.saved.bucketShotStatuses[shot.id]]} /><button className="mt-2 text-sm" onClick={() => void app.toggleShot(shot.id)}>Remove from Bucket</button></div>)}</div> : <EmptyState title="Nothing saved yet" message="Discover places and add a Bucket Shot." action={<Link href="/discover">Discover places</Link>} />}
        </div>
      ) : null}
      {segment === "locations" ? (
        <div className="mt-4 space-y-3">
          {locations.length ? locations.map((location) => <div key={location.id} className="flex justify-between rounded-[16px] bg-[var(--bs-surface)] p-4"><Link href={`/locations/${location.id}`}><strong>{location.name}</strong></Link><button onClick={() => void app.toggleLocation(location.id)}>Remove</button></div>) : <EmptyState title="No locations saved" message="Open the map and save a place." action={<Link href="/map">Open the map</Link>} />}
        </div>
      ) : null}
      {segment === "collections" ? (
        <div className="mt-4 space-y-3">
          {app.collections.length ? app.collections.map((collection) => <Link key={collection.id} href={`/collections/${collection.id}`} className="block rounded-[16px] bg-[var(--bs-surface)] p-4"><strong>{collection.title}</strong><p className="text-sm text-[var(--bs-text-secondary)]">{collection.bucketShotIds.length} shots · {collection.locationIds.length} locations</p></Link>) : <EmptyState title="No collections" message="Create an inspiration board." />}
        </div>
      ) : null}
    </div>
  );
}
