"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppState";
import { Cover, EmptyState, PhotoCard, SpecList } from "@/components/ui";
import { focalLabel, lightLabels, savedShotLabels, savedShotStatuses } from "@/lib/domain/types";
import { fetchWeather, formatClock, lightTimes, matchScore, type WeatherSnapshot } from "@/lib/services/conditions";

export default function ShotPage() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const shot = app.catalog.bucketShots.find((item) => item.id === id);
  const location = app.catalog.locations.find((item) => item.id === shot?.locationId);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  useEffect(() => {
    if (!location?.coordinate) return;
    void fetchWeather(location.coordinate).then(setWeather);
  }, [location]);
  if (!app.ready) return <p className="text-[var(--bs-text-secondary)]">Loading…</p>;
  if (!shot) return <EmptyState title="Bucket Shot not found" message="This composition is not in the catalog." />;
  const saved = app.saved.bucketShotIds.includes(shot.id);
  const status = app.saved.bucketShotStatuses[shot.id];
  const times = location?.coordinate ? lightTimes(location.coordinate) : null;
  const match = matchScore(shot.bestLight, weather);
  const versions = app.catalog.photographs.filter((item) => item.bucketShotId === shot.id);
  return (
    <article>
      <Cover src={shot.coverImage.url ?? location?.coverImage.url} alt={shot.title} className="h-80 w-full rounded-[16px]" />
      <p className="mt-4 text-sm text-[var(--bs-text-tertiary)]">{location ? <Link href={`/locations/${location.id}`}>{location.name}</Link> : "Location"}</p>
      <h1 className="text-4xl font-semibold">{shot.title}</h1>
      <p className="mt-3 max-w-2xl text-[var(--bs-text-secondary)]">{shot.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => void app.toggleShot(shot.id)} className="rounded-full bg-[var(--bs-accent)] px-4 py-2 font-semibold text-[var(--bs-inverse)]">{saved ? "In My Bucket" : "Add to My Bucket"}</button>
        {saved ? savedShotStatuses.map((item) => <button key={item} onClick={() => void app.setStatus(shot.id, item)} className={`rounded-full px-3 py-2 text-sm ${status === item ? "bg-[var(--bs-inverse)] text-[var(--bs-bg)]" : "bg-[var(--bs-raised)]"}`}>{savedShotLabels[item]}</button>) : null}
        <Link href={`/trips?addShot=${shot.id}`} className="rounded-full bg-[var(--bs-raised)] px-4 py-2">Add to trip</Link>
      </div>
      <h2 className="mt-8 text-xl font-semibold">When to shoot it</h2>
      <p className="mt-2">{shot.bestLight.map((item) => lightLabels[item]).join(", ")} · {shot.seasonNotes.join(", ")}</p>
      {times ? <p className="mt-2 text-sm text-[var(--bs-text-secondary)]">Today sunrise {formatClock(times.sunrise)} · sunset {formatClock(times.sunset)} · match {match.label}</p> : null}
      <h2 className="mt-8 text-xl font-semibold">How to capture it</h2>
      <div className="mt-3"><SpecList rows={[["Focal length", focalLabel(shot)], ["Aperture", shot.suggestedAperture], ["Shutter", shot.suggestedShutterSpeed], ["ISO", shot.suggestedIso ? String(shot.suggestedIso) : null], ["Orientation", shot.orientation], ["Tripod", shot.tripodRecommended ? "Recommended" : null], ["Filter", shot.filterNotes]]} /></div>
      {shot.camera && shot.subject ? (
        <div className="mt-6 rounded-[16px] bg-[var(--bs-surface)] p-4">
          <h2 className="font-semibold">Composition map</h2>
          <p className="mt-2 text-sm text-[var(--bs-text-secondary)]">Stand at {shot.camera.latitude.toFixed(4)}, {shot.camera.longitude.toFixed(4)} and face {shot.subject.latitude.toFixed(4)}, {shot.subject.longitude.toFixed(4)}.</p>
        </div>
      ) : null}
      {shot.compositionNotes ? <p className="mt-6">{shot.compositionNotes}</p> : null}
      <h2 className="mt-8 text-xl font-semibold">Other versions</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">{versions.map((photo) => <PhotoCard key={photo.id} href={`/photographs/${photo.id}`} title={photo.title} image={photo.image.url} />)}</div>
    </article>
  );
}
