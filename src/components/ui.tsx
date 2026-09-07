"use client";

import { useState } from "react";
import Link from "next/link";
import { categoryLabels, type PhotographyCategory } from "@/lib/domain/types";

export function Cover({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`bg-[var(--bs-placeholder)] ${className}`} aria-label={alt} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setFailed(true)} />
  );
}

export function Overline({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[1.4px] text-[var(--bs-text-tertiary)]">{children}</p>;
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between border-t border-[var(--bs-hairline)] pt-6">
      <h2 className="text-[20px] font-semibold">{title}</h2>
      {action}
    </div>
  );
}

export function PrimaryButton({ children, onClick, type = "button", disabled }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className="min-h-11 w-full rounded-full bg-[var(--bs-accent)] px-5 font-semibold text-[var(--bs-inverse)] disabled:opacity-50">
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-11 w-full rounded-full border border-[var(--bs-hairline)] px-5">
      {children}
    </button>
  );
}

export function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`h-8 shrink-0 rounded-full px-3 text-sm ${active ? "bg-[var(--bs-accent)] text-[var(--bs-inverse)]" : "bg-[var(--bs-raised)] text-[var(--bs-text)]"}`}>
      {children}
    </button>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--bs-surface)] px-6 py-12 text-center shadow-[var(--bs-shadow-card)]">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--bs-raised)] text-[var(--bs-accent)]">◇</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--bs-text-secondary)]">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LocationCard({ href, title, meta, image, saved, onSave }: { href: string; title: string; meta: string; image?: string | null; saved?: boolean; onSave?: () => void }) {
  return (
    <article className="overflow-hidden rounded-[16px] bg-[var(--bs-surface)] shadow-[var(--bs-shadow-card)]">
      <Link href={href} className="block">
        <Cover src={image} alt={title} className="h-40 w-full" />
        <div className="p-4">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-[var(--bs-text-secondary)]">{meta}</p>
        </div>
      </Link>
      {onSave ? (
        <button type="button" onClick={onSave} className="px-4 pb-4 text-sm text-[var(--bs-accent)]">
          {saved ? "Saved" : "Save"}
        </button>
      ) : null}
    </article>
  );
}

export function ShotCard({ href, title, meta, image, status }: { href: string; title: string; meta: string; image?: string | null; status?: string }) {
  return (
    <Link href={href} className="block min-w-[220px] overflow-hidden rounded-[16px] bg-[var(--bs-surface)] shadow-[var(--bs-shadow-card)]">
      <div className="relative">
        <Cover src={image} alt={title} className="h-36 w-full" />
        {status ? <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-xs text-white">{status}</span> : null}
      </div>
      <div className="p-3">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-[var(--bs-text-secondary)]">{meta}</p>
      </div>
    </Link>
  );
}

export function PhotoCard({ href, title, image, subtitle }: { href: string; title: string; image?: string | null; subtitle?: string }) {
  return (
    <Link href={href} className="relative block overflow-hidden rounded-[16px]">
      <Cover src={image} alt={title} className="aspect-[4/5] w-full" />
      <div className="bs-scrim absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <p className="font-semibold">{title}</p>
        {subtitle ? <p className="text-sm text-white/80">{subtitle}</p> : null}
      </div>
    </Link>
  );
}

export function Avatar({ name, src, size = 44 }: { name: string; src?: string | null; size?: number }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="grid place-items-center rounded-full bg-[var(--bs-raised)] text-sm font-semibold" style={{ width: size, height: size }}>{initials || "?"}</span>
  );
}

export function InterestsGrid({ selected, onToggle }: { selected: PhotographyCategory[]; onToggle: (value: PhotographyCategory) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(Object.keys(categoryLabels) as PhotographyCategory[]).map((key) => (
        <button key={key} type="button" onClick={() => onToggle(key)} className={`rounded-[12px] px-3 py-4 text-left ${selected.includes(key) ? "bg-[var(--bs-accent)] text-[var(--bs-inverse)]" : "bg-[var(--bs-raised)]"}`}>
          {categoryLabels[key]}
        </button>
      ))}
    </div>
  );
}

export function SpecList({ rows }: { rows: Array<[string, string | null | undefined]> }) {
  return (
    <dl className="divide-y divide-[var(--bs-hairline)] rounded-[16px] bg-[var(--bs-surface)]">
      {rows.filter((row) => row[1]).map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
          <dt className="text-[var(--bs-text-secondary)]">{label}</dt>
          <dd className="text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-[var(--bs-text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

export const fieldClass = "w-full rounded-[12px] border border-[var(--bs-hairline)] bg-[var(--bs-surface)] px-3 py-3 outline-none";
