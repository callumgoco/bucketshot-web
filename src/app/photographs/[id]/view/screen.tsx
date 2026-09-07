"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { Cover } from "@/components/ui";

export default function PhotographViewerPage() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const start = app.catalog.photographs.findIndex((item) => item.id === id);
  const [index, setIndex] = useState(Math.max(0, start));
  const [meta, setMeta] = useState(true);
  const photo = app.catalog.photographs[index] ?? app.catalog.photographs[0];
  const chromeButton = "rounded-full border border-white/40 bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_12px_rgb(0_0_0/0.45)] backdrop-blur-md disabled:opacity-40";
  if (!photo) return null;
  const photographer = app.catalog.photographers.find((item) => item.id === photo.userId);
  const location = app.catalog.locations.find((item) => item.id === photo.locationId);
  return (
    <div className="fixed inset-0 z-40 bg-black text-white" onClick={() => setMeta((value) => !value)}>
      <Cover src={photo.image.url} alt={photo.title} className="h-full w-full object-contain" />
      <div className="absolute inset-x-0 top-0 flex justify-between p-4">
        <Link href={`/photographs/${photo.id}`} className={chromeButton}>Close</Link>
        <div className="flex gap-2">
          <button type="button" className={chromeButton} disabled={index <= 0} onClick={(event) => { event.stopPropagation(); setIndex((value) => Math.max(0, value - 1)); }}>Prev</button>
          <button type="button" className={chromeButton} disabled={index >= app.catalog.photographs.length - 1} onClick={(event) => { event.stopPropagation(); setIndex((value) => Math.min(app.catalog.photographs.length - 1, value + 1)); }}>Next</button>
        </div>
      </div>
      {meta ? (
        <div className="absolute inset-x-0 bottom-0 bg-black/70 p-5" onClick={(event) => event.stopPropagation()}>
          <h1 className="text-2xl font-semibold">{photo.title}</h1>
          <p>{photographer?.displayName} · {location?.name}</p>
          <p className="text-sm text-white/70">{[photo.camera, photo.lens, photo.focalLength ? `${photo.focalLength}mm` : null].filter(Boolean).join(" · ")}</p>
        </div>
      ) : null}
    </div>
  );
}
