"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { EmptyState, fieldClass, PrimaryButton } from "@/components/ui";

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const collection = app.collections.find((item) => item.id === id);
  const [title, setTitle] = useState(collection?.title ?? "");
  const [picker, setPicker] = useState(false);
  if (!collection) return <EmptyState title="Collection not found" message="It may have been deleted." />;
  const shots = app.catalog.bucketShots.filter((item) => collection.bucketShotIds.includes(item.id));
  const locations = app.catalog.locations.filter((item) => collection.locationIds.includes(item.id));
  return (
    <article>
      <p className="text-xs uppercase tracking-[1.4px] text-[var(--bs-text-tertiary)]">Inspiration board</p>
      <h1 className="text-4xl font-semibold">{collection.title}</h1>
      <p className="text-[var(--bs-text-secondary)]">{collection.summary}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => setPicker(true)}>Add items</button>
        <button onClick={() => { const next = prompt("Rename", collection.title); if (next) void app.upsertCollection({ ...collection, title: next }); }}>Rename</button>
        <button onClick={() => { void app.removeCollection(collection.id); router.push("/bucket"); }}>Delete</button>
      </div>
      <h2 className="mt-8 font-semibold">Bucket Shots</h2>
      {shots.map((shot) => <a key={shot.id} href={`/shots/${shot.id}`} className="mt-2 block">{shot.title}</a>)}
      <h2 className="mt-6 font-semibold">Locations</h2>
      {locations.map((location) => <a key={location.id} href={`/locations/${location.id}`} className="mt-2 block">{location.name}</a>)}
      {picker ? (
        <div className="mt-6 space-y-2 rounded-[16px] bg-[var(--bs-surface)] p-4">
          <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} />
          {app.catalog.bucketShots.slice(0, 20).map((shot) => <label key={shot.id} className="flex gap-2"><input type="checkbox" checked={collection.bucketShotIds.includes(shot.id)} onChange={() => void app.upsertCollection({ ...collection, bucketShotIds: collection.bucketShotIds.includes(shot.id) ? collection.bucketShotIds.filter((item) => item !== shot.id) : [...collection.bucketShotIds, shot.id] })} />{shot.title}</label>)}
          <PrimaryButton onClick={() => setPicker(false)}>Done</PrimaryButton>
        </div>
      ) : null}
    </article>
  );
}
