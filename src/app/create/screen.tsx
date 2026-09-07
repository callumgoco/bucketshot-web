"use client";

import Link from "next/link";

const items = [
  { href: "/create/photograph", title: "Post Photograph", detail: "Share a frame with EXIF and a location." },
  { href: "/create/location", title: "Add Location", detail: "Drop a pin and describe how to get there." },
  { href: "/create/shot", title: "Add Bucket Shot", detail: "Mark where to stand and what to face." },
  { href: "/create/trip", title: "Start a trip", detail: "Plan days around the shots you want." },
];

export default function CreateMenuPage() {
  return (
    <div className="mx-auto max-w-xl space-y-3">
      <h1 className="text-3xl font-semibold">Create</h1>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="block rounded-[16px] bg-[var(--bs-surface)] p-4">
          <h2 className="font-semibold">{item.title}</h2>
          <p className="text-sm text-[var(--bs-text-secondary)]">{item.detail}</p>
        </Link>
      ))}
    </div>
  );
}
