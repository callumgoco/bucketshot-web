"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/AppState";
import { fieldClass, PrimaryButton, SecondaryButton } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const tabs = [
  { href: "/discover", label: "Discover", icon: "⌂" },
  { href: "/map", label: "Map", icon: "⌖" },
  { href: "/bucket", label: "Bucket", icon: "⚑" },
  { href: "/profile", label: "Profile", icon: "☺" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const hideNav = isLanding || pathname.startsWith("/auth");
  return (
    <div className="min-h-screen">
      {!hideNav ? <Sidebar pathname={pathname} /> : null}
      {isLanding ? children : (
        <div className={hideNav ? "" : "md:pl-64"}>
          <main className="mx-auto min-h-screen w-full max-w-6xl px-5 pb-28 pt-6 md:pb-10">{children}</main>
        </div>
      )}
      {!hideNav ? <MobileTabBar pathname={pathname} /> : null}
      <AuthModal />
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--bs-hairline)] bg-[var(--bs-surface)] p-5 md:block">
      <Link href="/discover" className="text-xl font-semibold tracking-tight">BucketShot</Link>
      <nav className="mt-8 space-y-1">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className={`flex items-center gap-3 rounded-full px-4 py-3 ${isActive(pathname, tab.href) ? "bg-[var(--bs-inverse)] text-[var(--bs-bg)]" : ""}`}>
            <span>{tab.icon}</span> {tab.label}
          </Link>
        ))}
        <Link href="/trips" className={`flex items-center gap-3 rounded-full px-4 py-3 ${pathname.startsWith("/trips") ? "bg-[var(--bs-inverse)] text-[var(--bs-bg)]" : ""}`}>Trips</Link>
      </nav>
      <Link href="/create" className="mt-8 block rounded-full bg-[var(--bs-accent)] px-4 py-3 text-center font-semibold text-[var(--bs-inverse)]">Add</Link>
    </aside>
  );
}

function MobileTabBar({ pathname }: { pathname: string }) {
  const center = pathname.startsWith("/map") ? { href: "/create", label: "Add" } : { href: "/search", label: "Search" };
  return (
    <nav className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-full bg-[var(--bs-surface)] p-2 shadow-[var(--bs-shadow-float)] md:hidden">
      {tabs.slice(0, 2).map((tab) => <TabLink key={tab.href} {...tab} active={isActive(pathname, tab.href)} />)}
      <Link href={center.href} className="rounded-full bg-[var(--bs-accent)] px-4 py-2 text-sm font-semibold text-[var(--bs-inverse)]">{center.label}</Link>
      {tabs.slice(2).map((tab) => <TabLink key={tab.href} {...tab} active={isActive(pathname, tab.href)} />)}
    </nav>
  );
}

function TabLink({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link href={href} className={`grid h-11 w-11 place-items-center rounded-full text-sm ${active ? "bg-[var(--bs-inverse)] text-[var(--bs-bg)]" : ""}`} aria-label={label}>
      {icon}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AuthModal() {
  const { authReason, setAuthReason } = useApp();
  const [mode, setMode] = useState<"signIn" | "signUp" | "magic">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!authReason) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const result = mode === "magic"
      ? await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
      : mode === "signUp"
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (mode === "magic") setMessage("Check your email for the sign-in link.");
    else setAuthReason(null);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-4 md:place-items-center">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-[20px] bg-[var(--bs-bg)] p-6 shadow-[var(--bs-shadow-float)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{mode === "signUp" ? "Create account" : "Sign in"}</h2>
            <p className="mt-1 text-sm text-[var(--bs-text-secondary)]">Sign in to save, publish, and plan trips with the same account as the iOS app.</p>
          </div>
          <button type="button" onClick={() => setAuthReason(null)}>Not now</button>
        </div>
        <input className={fieldClass} type="email" required placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        {mode !== "magic" ? <input className={fieldClass} type="password" required minLength={8} placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} /> : null}
        {message ? <p className="text-sm text-[var(--bs-text-secondary)]">{message}</p> : null}
        <PrimaryButton type="submit" disabled={busy}>{busy ? "Working…" : mode === "magic" ? "Send magic link" : mode === "signUp" ? "Create account" : "Sign in"}</PrimaryButton>
        <div className="flex justify-between text-sm">
          <button type="button" onClick={() => setMode(mode === "signUp" ? "signIn" : "signUp")}>{mode === "signUp" ? "Have an account?" : "Create account"}</button>
          <button type="button" onClick={() => setMode(mode === "magic" ? "signIn" : "magic")}>Magic link</button>
        </div>
        <SecondaryButton onClick={() => setAuthReason(null)}>Continue browsing</SecondaryButton>
      </form>
    </div>
  );
}

export function useGo() {
  const router = useRouter();
  return router.push;
}
