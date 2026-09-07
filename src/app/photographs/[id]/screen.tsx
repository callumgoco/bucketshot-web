"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { Cover, EmptyState, SpecList } from "@/components/ui";
import { critiqueCategories, critiqueLabels } from "@/lib/domain/types";

export default function PhotographPage() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  if (!app.ready) return <p className="text-[var(--bs-text-secondary)]">Loading…</p>;
  const photo = app.catalog.photographs.find((item) => item.id === id);
  const [body, setBody] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  if (!photo) return <EmptyState title="Photograph not found" message="This photograph is not available." />;
  const photographer = app.catalog.photographers.find((item) => item.id === photo.userId);
  const location = app.catalog.locations.find((item) => item.id === photo.locationId);
  const thread = app.comments.filter((item) => item.photoId === photo.id);
  const related = app.catalog.photographs.filter((item) => item.id !== photo.id && (item.bucketShotId === photo.bucketShotId || item.locationId === photo.locationId || item.userId === photo.userId));
  return (
    <article>
      <button onClick={() => router.push(`/photographs/${photo.id}/view`)} className="block w-full">
        <Cover src={photo.image.url} alt={photo.title} className="max-h-[70vh] w-full rounded-[16px] bg-black object-contain" />
      </button>
      <div className="mt-4 flex gap-3">
        <button onClick={() => void app.toggleAppreciate(photo.id)}>{app.appreciated.includes(photo.id) ? "Appreciated" : "Appreciate"}</button>
        <button onClick={() => void app.togglePhotoSave(photo.id)}>{app.saved.photographIds.includes(photo.id) ? "Bookmarked" : "Bookmark"}</button>
      </div>
      <h1 className="mt-4 text-4xl font-semibold">{photo.title}</h1>
      {photographer ? <Link href={`/photographers/${photographer.id}`} className="mt-2 block text-[var(--bs-text-secondary)]">{photographer.displayName}</Link> : null}
      {location ? <Link href={`/locations/${location.id}`} className="text-sm text-[var(--bs-accent)]">{location.name}</Link> : null}
      <p className="mt-4 max-w-2xl">{photo.description}</p>
      {photo.story ? <p className="mt-3 max-w-2xl text-[var(--bs-text-secondary)]">{photo.story}</p> : null}
      <h2 className="mt-8 text-xl font-semibold">How it was made</h2>
      <div className="mt-3"><SpecList rows={[["Camera", photo.camera], ["Lens", photo.lens], ["Focal length", photo.focalLength ? `${photo.focalLength}mm` : null], ["Aperture", photo.aperture ? `f/${photo.aperture}` : null], ["Shutter", photo.shutterSpeed], ["ISO", photo.iso ? String(photo.iso) : null]]} /></div>
      <div className="mt-3 flex gap-2 text-sm">{[photo.camera, photo.lens].filter(Boolean).map((item) => <Link key={item} href={`/gear?q=${encodeURIComponent(item!)}`} className="rounded-full bg-[var(--bs-raised)] px-3 py-1">{item}</Link>)}</div>
      <div className="mt-3 flex flex-wrap gap-2">{photo.tags.map((tag) => <span key={tag} className="rounded-full bg-[var(--bs-raised)] px-3 py-1 text-sm">{tag}</span>)}</div>
      <h2 className="mt-8 text-xl font-semibold">Discussion</h2>
      <div className="mt-3 space-y-3">{thread.map((item) => <div key={item.id} className="rounded-[12px] bg-[var(--bs-surface)] p-3"><strong>{item.authorName}</strong><p>{item.body}</p></div>)}</div>
      {photo.critiqueWelcome ? (
        <div className="mt-3 flex flex-wrap gap-2">{critiqueCategories.map((item) => <button key={item} onClick={() => setCategories((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} className={`rounded-full px-3 py-1 text-sm ${categories.includes(item) ? "bg-[var(--bs-accent)]" : "bg-[var(--bs-raised)]"}`}>{critiqueLabels[item]}</button>)}</div>
      ) : null}
      <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); void app.postComment(photo.id, body, categories); setBody(""); }}>
        <input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add a note" className="flex-1 rounded-full bg-[var(--bs-raised)] px-4 py-3" />
        <button className="rounded-full bg-[var(--bs-accent)] px-4 font-semibold text-[var(--bs-inverse)]">Post</button>
      </form>
      {related[0] ? <Link href={`/photographs/${related[0].id}/view`} className="mt-6 inline-block text-sm text-[var(--bs-accent)]">Open fullscreen</Link> : null}
    </article>
  );
}
