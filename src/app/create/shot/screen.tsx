"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { fieldClass, PrimaryButton } from "@/components/ui";
import { newId, publishBucketShot } from "@/lib/repositories/catalog";

export default function CreateShotPage() {
  const app = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [locationId, setLocationId] = useState(app.catalog.locations[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [cameraLat, setCameraLat] = useState("55.95");
  const [cameraLng, setCameraLng] = useState("-3.19");
  const [subjectLat, setSubjectLat] = useState("55.951");
  const [subjectLng, setSubjectLng] = useState("-3.191");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!app.ensureAuth("create") || !app.session) return;
    const id = newId();
    const location = app.catalog.locations.find((item) => item.id === locationId);
    try {
      await publishBucketShot({
        id,
        locationId,
        createdBy: app.session.user.id,
        title,
        description: notes,
        compositionNotes: notes,
        camera: { latitude: Number(cameraLat), longitude: Number(cameraLng) },
        subject: { latitude: Number(subjectLat), longitude: Number(subjectLng) },
        heading: null,
        focalMin: 24,
        focalMax: 70,
        suggestedAperture: "f/8",
        suggestedShutterSpeed: "1/125",
        suggestedIso: 100,
        orientation: "landscape",
        tripodRecommended: true,
        filterNotes: "",
        bestLight: ["sunrise"],
        seasonNotes: ["autumn"],
        weatherNotes: "",
        tags: [],
        privacy: "public",
        coordinatePrecision: "exact",
        status: "published",
        coverImage: { url: location?.coverImage.url ?? null, altText: title },
      }, app.session.user.id);
      await app.refresh();
      router.push(`/shots/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save Bucket Shot");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold">Add a Bucket Shot</h1>
      {step === 0 ? <select className={fieldClass} value={locationId} onChange={(event) => setLocationId(event.target.value)}>{app.catalog.locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select> : null}
      {step === 1 ? <p className="text-sm text-[var(--bs-text-secondary)]">Add a reference photo from the photograph flow after you save this composition.</p> : null}
      {step === 2 ? <div className="grid grid-cols-2 gap-2"><input className={fieldClass} value={cameraLat} onChange={(event) => setCameraLat(event.target.value)} /><input className={fieldClass} value={cameraLng} onChange={(event) => setCameraLng(event.target.value)} /></div> : null}
      {step === 3 ? <div className="grid grid-cols-2 gap-2"><input className={fieldClass} value={subjectLat} onChange={(event) => setSubjectLat(event.target.value)} /><input className={fieldClass} value={subjectLng} onChange={(event) => setSubjectLng(event.target.value)} /></div> : null}
      {step === 4 ? <><input className={fieldClass} placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} /><textarea className={fieldClass} placeholder="How to stand and frame it" value={notes} onChange={(event) => setNotes(event.target.value)} /></> : null}
      {error ? <p className="text-sm text-[var(--bs-danger)]">{error}</p> : null}
      <div className="flex gap-2">
        <button onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</button>
        {step < 4 ? <PrimaryButton onClick={() => setStep((value) => value + 1)}>Next</PrimaryButton> : <PrimaryButton onClick={() => void save()}>Save Bucket Shot</PrimaryButton>}
      </div>
    </div>
  );
}
