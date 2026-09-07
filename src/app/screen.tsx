"use client";

import Link from "next/link";
import { useApp } from "@/components/AppState";
import { Cover } from "@/components/ui";

const points = [
  { title: "Discover", detail: "A curated UK catalog of places worth photographing, from coast to glen." },
  { title: "Learn the shot", detail: "Bucket Shots show where to stand, what to face, and which light to wait for." },
  { title: "Plan the trip", detail: "Save locations, build an itinerary, and keep a gear list for the weekend." },
];

export default function LandingPage() {
  const app = useApp();
  const hero = app.catalog.destinations.find((item) => /skye|edinburgh|glencoe/i.test(item.name)) ?? app.catalog.destinations[0];

  return (
    <div className="relative min-h-screen bg-[#0c0c0d] text-white">
      <div className="absolute inset-0">
        <Cover src={hero?.coverImage.url} alt="" className="h-full w-full" />
        <div className="bs-onboarding-scrim absolute inset-0" />
      </div>
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10">
        <p className="text-sm font-semibold uppercase tracking-[1.4px]">BucketShot</p>
        <button type="button" onClick={() => app.setAuthReason("signIn")} className="rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
          Sign in
        </button>
      </header>
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col justify-end px-6 pb-16 md:px-10">
        <p className="text-sm uppercase tracking-[1.4px] text-white/70">Photography, planned</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">Places worth photographing.</h1>
        <p className="mt-4 max-w-xl text-lg text-white/80">Find the location, learn the composition, and plan the trip around the light. The same catalog as the iOS app.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/discover" className="rounded-full bg-[#e8a84a] px-6 py-3 font-semibold text-[#0c0c0d]">Enter the catalog</Link>
          <Link href="/map" className="rounded-full border border-white/25 px-6 py-3">Open the map</Link>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {points.map((point) => (
            <div key={point.title} className="rounded-[16px] bg-black/40 p-5 backdrop-blur">
              <h2 className="text-lg font-semibold">{point.title}</h2>
              <p className="mt-2 text-sm text-white/75">{point.detail}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
