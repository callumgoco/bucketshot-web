"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { fieldClass, PrimaryButton } from "@/components/ui";
import { newId, publishPhotograph, uploadMedia } from "@/lib/repositories/catalog";
import { audienceValues } from "@/lib/domain/types";

export default function CreatePhotographPage() {
  const app = useApp();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [locationId, setLocationId] = useState("");
  const [camera, setCamera] = useState("");
  const [lens, setLens] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(next: File | null) {
    setFile(next);
    if (!next) return;
    const exifr = await import("exifr");
    const data = await exifr.parse(next, { gps: true }).catch(() => null);
    if (data?.Make || data?.Model) setCamera([data.Make, data.Model].filter(Boolean).join(" "));
    if (data?.LensModel) setLens(String(data.LensModel));
  }

  async function save() {
    if (!app.ensureAuth("create") || !app.session) return;
    setError(null);
    try {
      const id = newId();
      const userId = app.session.user.id;
      let imageUrl: string | null = null;
      if (file) imageUrl = await uploadMedia("photographs", `${userId}/${id}/original.jpg`, file, file.type || "image/jpeg");
      await publishPhotograph({
        id,
        userId,
        locationId: locationId || null,
        bucketShotId: null,
        title: title || "Untitled",
        description: story,
        story,
        processNotes: "",
        challenges: "",
        image: { url: imageUrl, altText: title },
        imagePath: `${userId}/${id}/original.jpg`,
        thumbnailUrl: imageUrl,
        captureDate: new Date().toISOString(),
        camera: camera || null,
        lens: lens || null,
        focalLength: null,
        aperture: null,
        shutterSpeed: null,
        iso: null,
        latitude: null,
        longitude: null,
        locationDisclosure: "approximate",
        visibility: "public",
        status: "published",
        critiqueWelcome: true,
        process: { usedLightroom: false, usedPhotoshop: false, exposureBlend: false, panorama: false, focusStack: false },
        tags: [],
        createdAt: new Date().toISOString(),
      }, userId);
      await app.refresh();
      router.push(`/photographs/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish");
    }
  }

  return (
    <form className="mx-auto max-w-xl space-y-4" onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <h1 className="text-3xl font-semibold">Post a photograph</h1>
      <input className={fieldClass} type="file" accept="image/*" onChange={(event) => void onFile(event.target.files?.[0] ?? null)} />
      <input className={fieldClass} placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      <textarea className={fieldClass} placeholder="Story" value={story} onChange={(event) => setStory(event.target.value)} />
      <select className={fieldClass} value={locationId} onChange={(event) => setLocationId(event.target.value)} required>
        <option value="">Choose a location</option>
        {app.catalog.locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <input className={fieldClass} placeholder="Camera" value={camera} onChange={(event) => setCamera(event.target.value)} />
      <input className={fieldClass} placeholder="Lens" value={lens} onChange={(event) => setLens(event.target.value)} />
      {error ? <p className="text-sm text-[var(--bs-danger)]">{error}</p> : null}
      <PrimaryButton type="submit">Publish</PrimaryButton>
      <Link href="/create/location" className="block text-sm">Or add a location, Bucket Shot, or trip</Link>
    </form>
  );
}

export const privacyOptions = audienceValues;
