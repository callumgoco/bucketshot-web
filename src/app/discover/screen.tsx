"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/AppState";
import { Chip, Cover, EmptyState, PhotoCard, SectionHeader, ShotCard } from "@/components/ui";
import { categoryLabels, type PhotographyCategory } from "@/lib/domain/types";
import { edinburghLocationIds, photographerName, shotCount } from "@/lib/services/search";

export default function DiscoverPage() {
  const app = useApp();
  const [category, setCategory] = useState<PhotographyCategory | "all">("all");
  const [heroIndex, setHeroIndex] = useState(0);

  const sections = useMemo(() => buildSections(app.catalog, app.interests, category), [app.catalog, app.interests, category]);

  useEffect(() => {
    if (!app.ambience.enabled || sections.heroes.length < 2) return;
    const timer = window.setInterval(() => setHeroIndex((index) => (index + 1) % sections.heroes.length), app.ambience.interval * 1000);
    return () => window.clearInterval(timer);
  }, [app.ambience, sections.heroes.length]);

  if (!app.ready) return <p className="text-[var(--bs-text-secondary)]">Loading the UK catalog…</p>;
  if (app.error) return <EmptyState title="Could not load BucketShot" message={app.error} action={<button onClick={() => void app.refresh()}>Retry</button>} />;

  const hero = sections.heroes[heroIndex];

  return (
    <div className="space-y-2">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--bs-text-tertiary)]">United Kingdom</p>
          <h1 className="text-[22px] font-semibold">Discover</h1>
        </div>
        <div className="flex items-center gap-2">
          {app.session ? <Link href="/profile" className="text-sm">Activity</Link> : <button onClick={() => app.setAuthReason("signIn")} className="rounded-full bg-[var(--bs-accent)] px-4 py-2 text-sm font-semibold text-[var(--bs-inverse)]">Sign in</button>}
          <select value={category} onChange={(event) => setCategory(event.target.value as PhotographyCategory | "all")} className="rounded-full bg-[var(--bs-raised)] px-3 py-2 text-sm" aria-label="Category">
            <option value="all">All</option>
            {Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
      </header>

      {hero ? (
        <section>
          <SectionHeader title="Featured Photography" />
          <Link href={`/photographs/${hero.id}`} className="relative block overflow-hidden rounded-[16px]">
            <Cover src={hero.image.url} alt={hero.title} className="h-[420px] w-full" />
            <div className="bs-scrim absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-sm">{photographerName(app.catalog, hero)}</p>
              <h2 className="text-3xl font-semibold">{hero.title}</h2>
            </div>
          </Link>
        </section>
      ) : null}

      {category === "all" && sections.projects.length ? (
        <section>
          <SectionHeader title="Series" />
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {sections.projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="min-w-[240px] rounded-[16px] bg-[var(--bs-surface)] p-4">
                <p className="text-xs uppercase tracking-[1.4px] text-[var(--bs-text-tertiary)]">{project.year ?? "Series"}</p>
                <h3 className="mt-2 text-lg font-semibold">{project.title}</h3>
                <p className="mt-2 text-sm text-[var(--bs-text-secondary)]">{project.photographIds.length} photographs</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Worth Photographing This Weekend" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {sections.weekend.map((shot) => {
            const location = app.catalog.locations.find((item) => item.id === shot.locationId);
            return (
              <ShotCard key={shot.id} href={`/shots/${shot.id}`} title={shot.title} meta={location?.name ?? ""} image={shot.coverImage.url ?? location?.coverImage.url} />
            );
          })}
        </div>
      </section>

      {category === "all" ? (
        <section>
          <SectionHeader title="Explore the UK" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {app.catalog.destinations.map((destination) => (
              <Link key={destination.id} href={`/destinations/${destination.id}`} className="relative overflow-hidden rounded-[16px]">
                <Cover src={destination.coverImage.url} alt={destination.name} className="h-44 w-full" />
                <div className="bs-scrim absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-xs uppercase">{destination.region}</p>
                  <h3 className="text-xl font-semibold">{destination.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Bucket Shots Near You" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {sections.nearby.map((shot) => {
            const location = app.catalog.locations.find((item) => item.id === shot.locationId);
            return <ShotCard key={shot.id} href={`/shots/${shot.id}`} title={shot.title} meta="Edinburgh" image={shot.coverImage.url ?? location?.coverImage.url} />;
          })}
        </div>
      </section>

      <section>
        <SectionHeader title="Landscape Photography" />
        <div className="grid gap-3 md:grid-cols-2">
          {sections.landscape.map((photo) => <PhotoCard key={photo.id} href={`/photographs/${photo.id}`} title={photo.title} image={photo.image.url} subtitle={photographerName(app.catalog, photo)} />)}
        </div>
      </section>

      <section>
        <SectionHeader title="Recently Added Locations" />
        <div className="space-y-3">
          {sections.recent.map((location) => (
            <div key={location.id} className="flex items-center gap-3 rounded-[16px] bg-[var(--bs-surface)] p-3">
              <Cover src={location.coverImage.url} alt="" className="h-16 w-16 rounded-[12px]" />
              <Link href={`/locations/${location.id}`} className="flex-1">
                <h3 className="font-semibold">{location.name}</h3>
                <p className="text-sm text-[var(--bs-text-secondary)]">{shotCount(app.catalog, location)} Bucket Shots</p>
              </Link>
              <button onClick={() => void app.toggleLocation(location.id)} className="text-sm text-[var(--bs-accent)]">{app.saved.locationIds.includes(location.id) ? "Saved" : "Save"}</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="From the Community" />
        <div className="grid grid-cols-2 gap-3">
          {sections.community.map((photo) => <PhotoCard key={photo.id} href={`/photographs/${photo.id}`} title={photo.title} image={photo.image.url} />)}
        </div>
      </section>
      <p className="pt-8 text-center text-sm text-[var(--bs-text-tertiary)]">You&apos;re all caught up</p>
    </div>
  );
}

function scoreShot(catalog: ReturnType<typeof useApp>["catalog"], shot: { locationId: string; bestLight: string[] }, interests: PhotographyCategory[]) {
  const location = catalog.locations.find((item) => item.id === shotLocation(shot));
  const categoryHit = location?.categories.some((item) => interests.includes(item)) ? 2 : 0;
  const lightHit = shot.bestLight.includes("sunrise") || shot.bestLight.includes("sunset") ? 1 : 0;
  return categoryHit + lightHit;
}

function shotLocation(shot: { locationId: string }) {
  return shot.locationId;
}

function buildSections(catalog: ReturnType<typeof useApp>["catalog"], interests: PhotographyCategory[], category: PhotographyCategory | "all") {
  const matches = (locationId: string | null) => {
    if (category === "all" || !locationId) return true;
    return catalog.locations.find((item) => item.id === locationId)?.categories.includes(category) ?? false;
  };
  const photos = catalog.photographs.filter((photo) => matches(photo.locationId));
  const edinburgh = edinburghLocationIds(catalog);
  return {
    heroes: photos.slice(0, 6),
    projects: catalog.projects.slice(0, 3),
    weekend: catalog.bucketShots
      .filter((shot) => matches(shot.locationId))
      .sort((left, right) => scoreShot(catalog, right, interests) - scoreShot(catalog, left, interests))
      .slice(0, 4),
    nearby: catalog.bucketShots.filter((shot) => edinburgh.has(shot.locationId)).slice(0, 6),
    landscape: photos.filter((photo) => catalog.locations.find((item) => item.id === photo.locationId)?.categories.includes("landscape")).slice(0, 5),
    recent: [...catalog.locations].reverse().slice(0, 6),
    community: photos.slice(0, 8),
  };
}
