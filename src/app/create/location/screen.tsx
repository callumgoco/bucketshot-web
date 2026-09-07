"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { fieldClass, PrimaryButton } from "@/components/ui";
import { categoryLabels, type PhotographyCategory } from "@/lib/domain/types";
import { newId, publishLocation, uploadMedia } from "@/lib/repositories/catalog";

export default function CreateLocationPage() {
  const app = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [lat, setLat] = useState("55.95");
  const [lng, setLng] = useState("-3.19");
  const [category, setCategory] = useState<PhotographyCategory>("landscape");
  const [privacy, setPrivacy] = useState<"public" | "private">(app.session ? "public" : "private");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (privacy !== "private" && !app.session) {
      app.setAuthReason("create");
      return;
    }
    const id = newId();
    const userId = app.session?.user.id;
    let imageUrl: string | null = null;
    if (file && userId) imageUrl = await uploadMedia("location-images", `${userId}/${id}/hero.jpg`, file, file.type || "image/jpeg");
    const location = {
      id,
      createdBy: userId ?? null,
      destinationId: app.catalog.destinations[0]?.id ?? null,
      name,
      slug: null,
      summary,
      description: summary,
      coordinate: { latitude: Number(lat), longitude: Number(lng) },
      region: "United Kingdom",
      country: "United Kingdom",
      categories: [category],
      tags: [],
      accessDifficulty: "easy" as const,
      freeEntry: true,
      walkingTimeMinutes: null,
      distanceKilometers: null,
      accessNotes: "",
      parkingNotes: "",
      publicTransportNotes: "",
      hazards: "",
      isRoadside: false,
      preferredLight: ["sunrise" as const],
      preferredSeasons: ["autumn" as const],
      conditionsNotes: "",
      privacy,
      coordinatePrecision: "exact" as const,
      status: "published" as const,
      isCurated: false,
      coverImage: { url: imageUrl, altText: name },
      gallery: [],
      tips: [],
    };
    try {
      if (userId && privacy !== "private") await publishLocation(location, userId);
      await app.refresh();
      router.push(`/locations/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save location");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold">Add a location</h1>
      <div className="h-1 rounded-full bg-[var(--bs-raised)]"><div className="h-1 rounded-full bg-[var(--bs-accent)]" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      {step === 0 ? <input className={fieldClass} type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /> : null}
      {step === 1 ? <input className={fieldClass} placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} /> : null}
      {step === 2 ? <div className="grid grid-cols-2 gap-2"><input className={fieldClass} value={lat} onChange={(event) => setLat(event.target.value)} /><input className={fieldClass} value={lng} onChange={(event) => setLng(event.target.value)} /></div> : null}
      {step === 3 ? (
        <>
          <textarea className={fieldClass} placeholder="What is worth photographing?" value={summary} onChange={(event) => setSummary(event.target.value)} />
          <select className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value as PhotographyCategory)}>{Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
          <select className={fieldClass} value={privacy} onChange={(event) => setPrivacy(event.target.value as "public" | "private")}><option value="public">Public</option><option value="private">Private</option></select>
        </>
      ) : null}
      {error ? <p className="text-sm text-[var(--bs-danger)]">{error}</p> : null}
      <div className="flex gap-2">
        <button onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</button>
        {step < 3 ? <PrimaryButton onClick={() => setStep((value) => value + 1)}>Next</PrimaryButton> : <PrimaryButton onClick={() => void save()}>Save location</PrimaryButton>}
      </div>
    </div>
  );
}
