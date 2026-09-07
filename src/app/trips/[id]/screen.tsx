"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { EmptyState, fieldClass, PrimaryButton } from "@/components/ui";
import { newId } from "@/lib/repositories/catalog";
import { TripMap } from "@/components/TripMap";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const trip = app.trips.find((item) => item.id === id);
  const [tab, setTab] = useState<"itinerary" | "map" | "gear">("itinerary");
  const [reorder, setReorder] = useState(false);
  if (!trip) return <EmptyState title="Trip not found" message="Create a trip from the Trips list." />;

  function save(next = trip!) {
    void app.upsertTrip(next);
  }

  return (
    <article>
      <h1 className="text-4xl font-semibold">{trip.title}</h1>
      <p className="text-[var(--bs-text-secondary)]">{trip.destination}</p>
      <div className="mt-4 flex gap-4 border-b border-[var(--bs-hairline)]">
        {(["itinerary", "map", "gear"] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`pb-2 capitalize ${tab === item ? "border-b-2 border-[var(--bs-accent)]" : ""}`}>{item === "gear" ? "Gear / Notes" : item}</button>)}
      </div>
      {tab === "itinerary" ? (
        <div className="mt-4 space-y-6">
          <button onClick={() => setReorder((value) => !value)}>{reorder ? "Done" : "Reorder"}</button>
          {trip.days.map((day) => (
            <section key={day.id}>
              <h2 className="font-semibold">{day.title} {day.date}</h2>
              {day.stops.map((stop, index) => {
                const shot = app.catalog.bucketShots.find((item) => item.id === stop.bucketShotId);
                const location = app.catalog.locations.find((item) => item.id === stop.locationId);
                return (
                  <div key={stop.id} className="mt-2 flex items-center justify-between rounded-[12px] bg-[var(--bs-surface)] p-3">
                    <div>
                      <strong>{shot?.title ?? location?.name ?? "Stop"}</strong>
                      <p className="text-sm text-[var(--bs-text-secondary)]">{stop.time ?? "No time"} · {stop.notes}</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      {reorder && index > 0 ? <button onClick={() => { const days = trip.days.map((item) => item.id === day.id ? { ...item, stops: move(item.stops, index, index - 1) } : item); save({ ...trip, days }); }}>Up</button> : null}
                      <button onClick={() => { const note = prompt("Note", stop.notes) ?? stop.notes; const time = prompt("Time HH:MM", stop.time ?? "") || null; const days = trip.days.map((item) => item.id === day.id ? { ...item, stops: item.stops.map((row) => row.id === stop.id ? { ...row, notes: note, time } : row) } : item); save({ ...trip, days }); }}>Edit</button>
                      <button onClick={() => { const days = trip.days.map((item) => item.id === day.id ? { ...item, stops: item.stops.filter((row) => row.id !== stop.id) } : item); save({ ...trip, days }); }}>Remove</button>
                    </div>
                  </div>
                );
              })}
              <button className="mt-2 text-sm" onClick={() => {
                const shot = app.catalog.bucketShots[0];
                if (!shot) return;
                const days = trip.days.map((item) => item.id === day.id ? { ...item, stops: [...item.stops, { id: newId(), tripDayId: day.id, locationId: shot.locationId, bucketShotId: shot.id, kind: "bucketShot" as const, time: null, notes: "", sortOrder: item.stops.length }] } : item);
                save({ ...trip, days });
              }}>Add stop</button>
            </section>
          ))}
        </div>
      ) : null}
      {tab === "map" ? <TripMap trip={trip} catalog={app.catalog} /> : null}
      {tab === "gear" ? (
        <div className="mt-4 space-y-3">
          {trip.gear.map((item) => <label key={item.id} className="flex items-center gap-2"><input type="checkbox" checked={item.isChecked} onChange={() => save({ ...trip, gear: trip.gear.map((row) => row.id === item.id ? { ...row, isChecked: !row.isChecked } : row) })} />{item.title}</label>)}
          <button onClick={() => { const title = prompt("Gear item"); if (!title) return; save({ ...trip, gear: [...trip.gear, { id: newId(), title, isChecked: false, isCustom: true, sortOrder: trip.gear.length }] }); }}>Add item</button>
          <textarea className={fieldClass} value={trip.notes} onChange={(event) => save({ ...trip, notes: event.target.value })} />
        </div>
      ) : null}
    </article>
  );
}

function move<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
