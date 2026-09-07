"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { EmptyState, fieldClass, PrimaryButton } from "@/components/ui";
import { newId } from "@/lib/repositories/catalog";
import { buildDays, defaultGear, isInProgress } from "@/lib/services/trips";

export default function TripsPage({ addShot = null, addLocation = null }: { addShot?: string | null; addLocation?: string | null }) {
  const app = useApp();
  const [open, setOpen] = useState(Boolean(addShot || addLocation));
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [destinationId, setDestinationId] = useState(app.catalog.destinations[0]?.id ?? "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [shotIds, setShotIds] = useState<string[]>(addShot ? [addShot] : []);
  const today = app.trips.find((trip) => isInProgress(trip));

  function create() {
    if (!app.ensureAuth("create") && !app.session) return;
    const id = newId();
    const destination = app.catalog.destinations.find((item) => item.id === destinationId);
    const days = buildDays(start || null, end || null, id);
    if (days[0]) {
      days[0].stops = shotIds.map((shotId, index) => ({ id: newId(), tripDayId: days[0].id, locationId: app.catalog.bucketShots.find((item) => item.id === shotId)?.locationId ?? null, bucketShotId: shotId, kind: "bucketShot" as const, time: null, notes: "", sortOrder: index }));
      const locationId = addLocation;
      if (locationId) days[0].stops.push({ id: newId(), tripDayId: days[0].id, locationId, bucketShotId: null, kind: "location", time: null, notes: "", sortOrder: days[0].stops.length });
    }
    void app.upsertTrip({
      id,
      userId: app.session?.user.id ?? null,
      title: title || "Untitled trip",
      destination: destination?.name ?? "",
      summary: notes,
      startDate: start || null,
      endDate: end || null,
      notes,
      heroImageUrl: destination?.coverImage.url ?? null,
      gear: defaultGear(),
      days,
      destinationIds: destinationId ? [destinationId] : [],
      isSample: false,
      createdAt: new Date().toISOString(),
    });
    setOpen(false);
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px] font-semibold">Trips</h1>
        <button onClick={() => { if (app.session || app.ensureAuth("create")) setOpen(true); }} className="rounded-full bg-[var(--bs-accent)] px-4 py-2 font-semibold text-[var(--bs-inverse)]">New trip</button>
      </header>
      {today ? <Link href={`/trips/${today.id}`} className="mb-4 block rounded-[16px] bg-[var(--bs-surface)] p-4"><p className="text-xs uppercase">Today</p><strong>{today.title}</strong><p className="text-sm">{today.days.flatMap((day) => day.stops)[0]?.notes || "Next stop waiting"}</p></Link> : null}
      {app.trips.length ? app.trips.map((trip) => <Link key={trip.id} href={`/trips/${trip.id}`} className="mb-3 block rounded-[16px] bg-[var(--bs-surface)] p-4"><strong>{trip.title}</strong><p className="text-sm text-[var(--bs-text-secondary)]">{trip.destination} · {trip.startDate ?? "Dates open"}</p></Link>) : <EmptyState title="No trips yet" message="Plan a weekend around the shots you want." />}
      {open ? (
        <div className="mt-6 space-y-4 rounded-[20px] bg-[var(--bs-surface)] p-5">
          {step === 0 ? <input className={fieldClass} placeholder="Trip name" value={title} onChange={(event) => setTitle(event.target.value)} /> : null}
          {step === 1 ? <select className={fieldClass} value={destinationId} onChange={(event) => setDestinationId(event.target.value)}>{app.catalog.destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select> : null}
          {step === 2 ? <div className="grid gap-2 md:grid-cols-2"><input className={fieldClass} type="date" value={start} onChange={(event) => setStart(event.target.value)} /><input className={fieldClass} type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></div> : null}
          {step === 3 ? <textarea className={fieldClass} placeholder="Notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} /> : null}
          {step === 4 ? <div className="max-h-64 space-y-2 overflow-auto">{app.catalog.bucketShots.filter((shot) => app.saved.bucketShotIds.includes(shot.id) || shotIds.includes(shot.id)).map((shot) => <label key={shot.id} className="flex gap-2"><input type="checkbox" checked={shotIds.includes(shot.id)} onChange={() => setShotIds((current) => current.includes(shot.id) ? current.filter((item) => item !== shot.id) : [...current, shot.id])} />{shot.title}</label>)}</div> : null}
          <div className="flex gap-2">
            <button onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</button>
            {step < 4 ? <PrimaryButton onClick={() => setStep((value) => value + 1)}>Next</PrimaryButton> : <PrimaryButton onClick={create}>Save trip</PrimaryButton>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
