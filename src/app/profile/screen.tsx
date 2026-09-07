"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { Avatar, InterestsGrid, PrimaryButton } from "@/components/ui";
import { categoryLabels, type PhotographyCategory } from "@/lib/domain/types";

export default function ProfilePage() {
  const app = useApp();
  if (!app.session || !app.profile) {
    return (
      <div className="mx-auto max-w-md space-y-4 pt-10 text-center">
        <h1 className="text-3xl font-semibold">Your profile</h1>
        <p className="text-[var(--bs-text-secondary)]">Sign in to publish photographs, follow photographers, and sync trips with the iOS app.</p>
        <PrimaryButton onClick={() => app.setAuthReason("signIn")}>Sign in</PrimaryButton>
        <button onClick={() => app.setAuthReason("signIn")} className="text-sm">Create account</button>
      </div>
    );
  }
  const incomplete = !app.profile.avatarUrl || !app.profile.bio;
  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h1 className="text-[22px] font-semibold">Profile</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/settings/appearance">Appearance</Link>
          <Link href="/profile/edit">Edit</Link>
        </div>
      </div>
      {incomplete ? <Link href="/profile-setup" className="mb-4 block rounded-[16px] bg-[var(--bs-accent-muted,var(--bs-raised))] p-4">Finish your profile — add a photo and a short about page.</Link> : null}
      <div className="flex items-center gap-4">
        <Avatar name={app.profile.displayName} src={app.profile.avatarUrl} size={72} />
        <div>
          <h2 className="text-2xl font-semibold">{app.profile.displayName}</h2>
          <p className="text-[var(--bs-text-secondary)]">@{app.profile.username}</p>
        </div>
      </div>
      <Link href={`/photographers/${app.profile.id}`} className="mt-4 inline-block text-[var(--bs-accent)]">View public profile</Link>
    </div>
  );
}

export function EditForm() {
  const app = useApp();
  const [profile, setProfile] = useState(app.profile);
  if (!profile) return null;
  return (
    <form className="mx-auto max-w-xl space-y-3" onSubmit={(event) => { event.preventDefault(); void app.updateProfile(profile); }}>
      <input className="w-full rounded-xl bg-[var(--bs-raised)] p-3" value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} />
      <input className="w-full rounded-xl bg-[var(--bs-raised)] p-3" value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value })} />
      <textarea className="w-full rounded-xl bg-[var(--bs-raised)] p-3" value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} />
      <input className="w-full rounded-xl bg-[var(--bs-raised)] p-3" value={profile.homeRegion} onChange={(event) => setProfile({ ...profile, homeRegion: event.target.value })} />
      <input className="w-full rounded-xl bg-[var(--bs-raised)] p-3" value={profile.gearNotes} onChange={(event) => setProfile({ ...profile, gearNotes: event.target.value })} />
      <InterestsGrid selected={profile.specialties} onToggle={(value) => setProfile({ ...profile, specialties: profile.specialties.includes(value) ? profile.specialties.filter((item) => item !== value) : [...profile.specialties, value] })} />
      <PrimaryButton type="submit">Save</PrimaryButton>
      <button type="button" onClick={() => void app.signOut()}>Sign out</button>
    </form>
  );
}

export const labels = categoryLabels;
export type { PhotographyCategory };
