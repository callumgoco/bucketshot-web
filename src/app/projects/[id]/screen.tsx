"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { useApp } from "@/components/AppState";
import { Cover, EmptyState, PhotoCard } from "@/components/ui";

export default function ProjectPage() {
  return <Suspense><ProjectInner /></Suspense>;
}

function ProjectInner() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  if (!app.ready) return <p className="text-[var(--bs-text-secondary)]">Loading…</p>;
  const project = app.catalog.projects.find((item) => item.id === id);
  if (!project) return <EmptyState title="Series not found" message="This project is not in the catalog." />;
  const photographer = app.catalog.photographers.find((item) => item.id === project.photographerId);
  const photos = project.photographIds.map((photoId) => app.catalog.photographs.find((item) => item.id === photoId)).filter(Boolean);
  const cover = photos[0]?.image.url;
  return (
    <article>
      <Cover src={cover} alt={project.title} className="h-64 w-full rounded-[16px]" />
      <p className="mt-4 text-sm uppercase tracking-[1.4px]">{project.year}</p>
      <h1 className="text-4xl font-semibold">{project.title}</h1>
      {photographer ? <Link href={`/photographers/${photographer.id}`}>{photographer.displayName}</Link> : null}
      <p className="mt-3 max-w-2xl text-[var(--bs-text-secondary)]">{project.summary}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">{photos.map((photo) => photo ? <PhotoCard key={photo.id} href={`/photographs/${photo.id}`} title={photo.title} image={photo.image.url} /> : null)}</div>
    </article>
  );
}

export function GearList({ query = "" }: { query?: string }) {
  const app = useApp();
  const q = query.toLowerCase();
  const photos = app.catalog.photographs.filter((item) => `${item.camera} ${item.lens} ${item.focalLength}`.toLowerCase().includes(q));
  return (
    <div>
      <h1 className="text-3xl font-semibold">Gear</h1>
      <p className="text-[var(--bs-text-secondary)]">{query}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">{photos.map((photo) => <PhotoCard key={photo.id} href={`/photographs/${photo.id}`} title={photo.title} image={photo.image.url} />)}</div>
    </div>
  );
}
