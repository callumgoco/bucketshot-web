"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { Avatar, EmptyState, PhotoCard } from "@/components/ui";

export default function PhotographerPage() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const [tab, setTab] = useState<"work" | "projects" | "contributions" | "about">("work");
  if (!app.ready) return <p className="text-[var(--bs-text-secondary)]">Loading…</p>;
  const person = app.catalog.photographers.find((item) => item.id === id) ?? (app.profile?.id === id ? app.profile : null);
  if (!person) return <EmptyState title="Photographer not found" message="This profile is not available." />;
  const photos = app.catalog.photographs.filter((item) => item.userId === person.id);
  const projects = app.catalog.projects.filter((item) => item.photographerId === person.id);
  const locations = new Set(photos.map((item) => item.locationId).filter(Boolean));
  return (
    <article>
      <div className="flex items-center gap-4">
        <Avatar name={person.displayName} src={person.avatarUrl} size={72} />
        <div>
          <h1 className="text-3xl font-semibold">{person.displayName}</h1>
          <p className="text-[var(--bs-text-secondary)]">@{person.username}</p>
        </div>
        {app.session?.user.id !== person.id ? <button onClick={() => void app.toggleFollowUser(person.id)} className="ml-auto rounded-full bg-[var(--bs-accent)] px-4 py-2 text-[var(--bs-inverse)]">{app.followed.includes(person.id) ? "Following" : "Follow"}</button> : null}
      </div>
      <div className="mt-6 flex gap-4 border-b border-[var(--bs-hairline)]">
        {(["work", "projects", "contributions", "about"] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`pb-2 capitalize ${tab === item ? "border-b-2 border-[var(--bs-accent)]" : ""}`}>{item}</button>)}
      </div>
      {tab === "work" ? <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">{photos.map((photo) => <PhotoCard key={photo.id} href={`/photographs/${photo.id}`} title={photo.title} image={photo.image.url} />)}</div> : null}
      {tab === "projects" ? <div className="mt-4 space-y-3">{projects.map((project) => <Link key={project.id} href={`/projects/${project.id}`} className="block rounded-[16px] bg-[var(--bs-surface)] p-4">{project.title}</Link>)}</div> : null}
      {tab === "contributions" ? <p className="mt-4">{photos.length} photographs · {locations.size} locations</p> : null}
      {tab === "about" ? <div className="mt-4 space-y-2"><p>{person.bio}</p><p>{person.homeRegion}</p><p>{person.gearNotes}</p>{person.websiteUrl ? <a href={person.websiteUrl}>{person.websiteUrl}</a> : null}</div> : null}
    </article>
  );
}
