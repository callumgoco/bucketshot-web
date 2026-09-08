"use client";

import { useApp } from "@/components/AppState";

export default function AppearancePage() {
  const app = useApp();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-semibold">Appearance</h1>
      <div className="flex gap-2">
        {(["system", "light", "dark"] as const).map((item) => <button key={item} onClick={() => app.setAppearance(item)} className={`rounded-full px-4 py-2 capitalize ${app.appearance === item ? "bg-[var(--bs-accent)] text-[var(--bs-inverse)]" : "bg-[var(--bs-raised)]"}`}>{item}</button>)}
      </div>
      <label className="flex items-center justify-between"><span>Home ambience</span><input type="checkbox" checked={app.ambience.enabled} onChange={(event) => app.setAmbience({ ...app.ambience, enabled: event.target.checked })} /></label>
      <div className="flex gap-2">
        {[5, 10, 20].map((seconds) => <button key={seconds} onClick={() => app.setAmbience({ ...app.ambience, interval: seconds })} className={`rounded-full px-3 py-2 ${app.ambience.interval === seconds ? "bg-[var(--bs-inverse)] text-[var(--bs-bg)]" : "bg-[var(--bs-raised)]"}`}>{seconds}s</button>)}
      </div>
    </div>
  );
}
 
