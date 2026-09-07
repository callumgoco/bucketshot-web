"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { InterestsGrid, PrimaryButton, fieldClass } from "@/components/ui";
import type { PhotographyCategory } from "@/lib/domain/types";
import { uploadMedia } from "@/lib/repositories/catalog";

export default function ProfileSetupPage() {
  const app = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(app.profile?.displayName ?? "");
  const [username, setUsername] = useState(app.profile?.username ?? "");
  const [bio, setBio] = useState(app.profile?.bio ?? "");
  const [specialties, setSpecialties] = useState<PhotographyCategory[]>(app.profile?.specialties ?? []);

  async function saveAvatar(file: File) {
    if (!app.profile || !app.session) return;
    const url = await uploadMedia("avatars", `${app.session.user.id}/avatar.jpg`, file, file.type || "image/jpeg");
    await app.updateProfile({ ...app.profile, avatarUrl: url, displayName: name || app.profile.displayName, username, bio, specialties });
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold">Set up your profile</h1>
      {step === 0 ? <input className={fieldClass} type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && void saveAvatar(event.target.files[0])} /> : null}
      {step === 1 ? <><input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" /><input className={fieldClass} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" /></> : null}
      {step === 2 ? <textarea className={fieldClass} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="About" /> : null}
      {step === 3 ? <InterestsGrid selected={specialties} onToggle={(value) => setSpecialties((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])} /> : null}
      {step === 4 ? <p>Add a first photograph now, or skip and do it later.</p> : null}
      <div className="flex gap-2">
        <button onClick={() => { router.push("/profile"); }}>Skip</button>
        {step < 4 ? <PrimaryButton onClick={() => setStep((value) => value + 1)}>Next</PrimaryButton> : <PrimaryButton onClick={() => router.push("/create/photograph")}>Add a photograph</PrimaryButton>}
      </div>
    </div>
  );
}
