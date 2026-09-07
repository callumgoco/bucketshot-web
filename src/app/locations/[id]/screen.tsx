"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppState";
import { Cover, EmptyState, PhotoCard, SpecList } from "@/components/ui";
import { glanceLine, lightLabels, savedShotLabels } from "@/lib/domain/types";
import { fetchWeather, formatClock, lightTimes, moonPhase, type WeatherSnapshot } from "@/lib/services/conditions";

export default function LocationPage() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const location = app.catalog.locations.find((item) => item.id === id);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  useEffect(() => {
    if (!location?.coordinate) return;
    void fetchWeather(location.coordinate).then(setWeather);
  }, [location]);
  if (!app.ready) return <p className="text-[var(--bs-text-secondary)]">Loading…</p>;
  if (!location) return <EmptyState title="Location not found" message="This place is not in the catalog." />;
  const shots = app.catalog.bucketShots.filter((item) => item.locationId === location.id);
  const photos = app.catalog.photographs.filter((item) => item.locationId === location.id);
  const times = location.coordinate ? lightTimes(location.coordinate) : null;
  const moon = location.coordinate ? moonPhase(location.coordinate) : null;
  const maps = location.coordinate ? `https://www.google.com/maps/dir/?api=1&destination=${location.coordinate.latitude},${location.coordinate.longitude}` : null;
  return (
    <article>
      <Cover src={location.coverImage.url} alt={location.name} className="h-80 w-full rounded-[16px]" />
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--bs-text-tertiary)]">{location.region}, {location.country}</p>
          <h1 className="text-4xl font-semibold">{location.name}</h1>
          <p className="mt-2 max-w-2xl text-[var(--bs-text-secondary)]">{location.summary}</p>
          <p className="mt-2 text-sm">{glanceLine(location)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void app.toggleLocation(location.id)} className="rounded-full bg-[var(--bs-accent)] px-4 py-2 font-semibold text-[var(--bs-inverse)]">{app.saved.locationIds.includes(location.id) ? "Saved" : "Save"}</button>
          <Link href={`/trips?addLocation=${location.id}`} className="rounded-full bg-[var(--bs-raised)] px-4 py-2">Add to trip</Link>
          {maps ? <a className="rounded-full bg-[var(--bs-raised)] px-4 py-2" href={maps} target="_blank" rel="noreferrer">Directions</a> : null}
        </div>
      </div>
      <h2 className="mt-8 text-xl font-semibold">Bucket Shots</h2>
      <div className="mt-3 space-y-2">{shots.map((shot) => <Link key={shot.id} href={`/shots/${shot.id}`} className="block rounded-[12px] bg-[var(--bs-surface)] p-3">{shot.title} · {app.saved.bucketShotStatuses[shot.id] ? savedShotLabels[app.saved.bucketShotStatuses[shot.id]] : "Not saved"}</Link>)}</div>
      <h2 className="mt-8 text-xl font-semibold">Conditions</h2>
      {times ? (
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Stat label="Sunrise" value={formatClock(times.sunrise)} />
          <Stat label="Golden hour" value={formatClock(times.goldenHourEveningStart)} />
          <Stat label="Sunset" value={formatClock(times.sunset)} />
          <Stat label="Blue hour" value={formatClock(times.blueHourEveningStart)} />
        </div>
      ) : null}
      {weather ? <p className="mt-3 text-sm text-[var(--bs-text-secondary)]">{weather.summary} · {Math.round(weather.temperature)}° · cloud {weather.cloudCover}% · rain {weather.precipitation}mm · wind {weather.windSpeed} m/s · Open-Meteo</p> : null}
      {moon ? <p className="mt-2 text-sm text-[var(--bs-text-secondary)]">{moon.name} · rise {formatClock(moon.rise)} · set {formatClock(moon.set)}</p> : null}
      <p className="mt-2 text-sm">{location.preferredLight.map((item) => lightLabels[item]).join(", ")}</p>
      <h2 className="mt-8 text-xl font-semibold">Photography tips</h2>
      <div className="mt-3 space-y-3">{location.tips.map((tip) => <div key={tip.id} className="rounded-[16px] bg-[var(--bs-surface)] p-4"><h3 className="font-semibold">{tip.title}</h3><p className="text-sm text-[var(--bs-text-secondary)]">{tip.detail}</p></div>)}</div>
      <h2 className="mt-8 text-xl font-semibold">Access</h2>
      <div className="mt-3"><SpecList rows={[["Difficulty", location.accessDifficulty], ["Walk", location.walkingTimeMinutes ? `${location.walkingTimeMinutes} min` : null], ["Parking", location.parkingNotes], ["Hazards", location.hazards], ["Notes", location.accessNotes]]} /></div>
      {location.coordinate ? <p className="mt-6 text-sm text-[var(--bs-text-secondary)]">Pin {location.coordinate.latitude.toFixed(4)}, {location.coordinate.longitude.toFixed(4)}</p> : null}
      <h2 className="mt-8 text-xl font-semibold">Community photography</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">{photos.map((photo) => <PhotoCard key={photo.id} href={`/photographs/${photo.id}`} title={photo.title} image={photo.image.url} />)}</div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[16px] bg-[var(--bs-surface)] p-4"><p className="text-xs uppercase tracking-[1.4px] text-[var(--bs-text-tertiary)]">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>;
}
