"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppState";
import { Cover } from "@/components/ui";

/** Replace when the App Store listing is live. */
const APP_STORE_URL = "https://apps.apple.com/";

const IOS_SCREENSHOTS = [
  { src: "/app-screenshot-1.png", label: "Discover" },
  { src: "/app-screenshot-2.png", label: "Map" },
] as const;

export default function LandingPage() {
  const app = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const destinations = app.catalog.destinations;
  const shots = app.catalog.bucketShots;
  const locations = app.catalog.locations;

  const hero = destinations.find((item) => /skye|edinburgh|glencoe/i.test(item.name)) ?? destinations[0];
  const railDestinations = destinations.slice(0, 10);
  const primaryShot = shots[0];
  const secondaryShot = shots[1] ?? shots[0];
  const secondaryLocation = locations[0];
  const mapImage = locations[1]?.coverImage.url ?? locations[0]?.coverImage.url ?? hero?.coverImage.url;
  const discoverHero = primaryShot?.coverImage.url ?? destinations[1]?.coverImage.url ?? hero?.coverImage.url;
  const planImage = shots[2]?.coverImage.url ?? primaryShot?.coverImage.url ?? hero?.coverImage.url;

  function goToSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = searchQuery.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  return (
    <div className="bg-[#0c0c0d] text-white">
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <div className="absolute inset-0">
          <div className="bs-landing-hero-media-inner absolute inset-[-8%]">
            <Cover src={hero?.coverImage.url} alt="" className="h-full w-full" />
          </div>
          <div className="bs-landing-cinematic-scrim absolute inset-0" />
          <div className="bs-landing-grain absolute inset-0" aria-hidden="true" />
        </div>

        <header className="relative z-10 flex items-start justify-between px-6 pt-8 md:px-10 md:pt-10">
          <p className="bs-landing-display bs-landing-hero-stagger text-4xl tracking-tight md:text-6xl lg:text-7xl">BucketShot</p>
          <button
            type="button"
            onClick={() => app.setAuthReason("signIn")}
            className="bs-landing-hero-stagger mt-2 shrink-0 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/15"
          >
            Sign in
          </button>
        </header>

        <div className="relative z-10 mx-auto mt-auto flex w-full max-w-6xl flex-col px-6 pb-16 pt-16 md:px-10 md:pb-24">
          <p className="bs-landing-hero-stagger text-[11px] font-semibold uppercase tracking-[1.6px] text-[#e8a84a]">Photography, planned</p>
          <h1 className="bs-landing-display bs-landing-hero-stagger mt-4 max-w-4xl text-[2.75rem] leading-[1.05] md:text-6xl lg:text-[4.25rem]">
            Places worth photographing.
          </h1>
          <p className="bs-landing-hero-stagger mt-5 max-w-lg text-base text-white/75 md:text-lg">
            Find the location, learn the composition, and plan the trip around the light.
          </p>

          <form onSubmit={goToSearch} className="bs-landing-hero-stagger mt-10 w-full max-w-2xl">
            <label htmlFor="landing-search" className="sr-only">
              Search places, shots, photographers
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                id="landing-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search places, shots, photographers"
                className="h-14 flex-1 rounded-2xl border border-white/18 bg-white/10 px-5 text-white outline-none backdrop-blur-md placeholder:text-white/40 focus:border-[#e8a84a]/60 focus:ring-2 focus:ring-[#e8a84a]/25"
              />
              <button
                type="submit"
                className="h-14 shrink-0 rounded-2xl bg-[#e8a84a] px-8 font-semibold text-[#0c0c0d] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Search
              </button>
            </div>
          </form>

          {hero ? (
            <p className="bs-landing-hero-stagger mt-4 text-sm text-white/50">
              Now featuring <span className="text-white/80">{hero.name}</span>
            </p>
          ) : null}

          <div className="bs-landing-hero-stagger mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/discover" className="text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white">
              Enter the catalog
            </Link>
            <Link href="/map" className="text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white">
              Open the map
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-[#e8a84a]">Destinations</p>
            <h2 className="bs-landing-display mt-3 text-3xl md:text-5xl">Start with a place that pulls you in.</h2>
            <p className="mt-4 max-w-xl text-white/65">A curated UK catalog—from coastlines to glens—each with locations and shots worth the drive.</p>
          </Reveal>
          <Reveal className="mt-12" delay={80}>
            <div className="bs-landing-rail no-scrollbar -mx-6 px-6 md:-mx-0 md:px-0">
              {railDestinations.map((destination) => (
                <Link key={destination.id} href={`/destinations/${destination.id}`} className="bs-landing-rail-card group block overflow-hidden rounded-[18px]">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Cover src={destination.coverImage.url} alt={destination.name} className="bs-landing-rail-cover h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-lg font-semibold">{destination.name}</p>
                      <p className="mt-1 text-sm text-white/65">{destination.region}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/8 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-[#e8a84a]">Discover</p>
            <h2 className="bs-landing-display mt-3 text-3xl md:text-5xl">Learn the shot before you arrive.</h2>
            <p className="mt-4 text-white/65">
              Bucket Shots show where to stand, what to face, and which light to wait for—so your first frame isn&apos;t a guess.
            </p>
            <Link
              href="/discover"
              className="mt-8 inline-flex rounded-2xl bg-[#e8a84a] px-6 py-3 font-semibold text-[#0c0c0d] transition-transform hover:scale-[1.02]"
            >
              Explore Discover
            </Link>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={100}>
            <div className="grid grid-cols-12 gap-3 md:gap-4">
              <ParallaxMedia className="col-span-12 md:col-span-8">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] md:aspect-[5/6]">
                  <Cover src={discoverHero} alt={primaryShot?.title ?? "Bucket Shot"} className="h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {primaryShot ? (
                    <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white/90">{primaryShot.title}</p>
                  ) : null}
                </div>
              </ParallaxMedia>
              <div className="col-span-12 flex flex-col gap-3 md:col-span-4">
                {secondaryShot ? (
                  <Link href={`/shots/${secondaryShot.id}`} className="group relative aspect-[4/3] overflow-hidden rounded-[16px]">
                    <Cover src={secondaryShot.coverImage.url} alt={secondaryShot.title} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/25" />
                    <p className="absolute bottom-3 left-3 text-xs font-medium">{secondaryShot.title}</p>
                  </Link>
                ) : null}
                {secondaryLocation ? (
                  <Link href={`/locations/${secondaryLocation.id}`} className="group relative aspect-[4/3] overflow-hidden rounded-[16px]">
                    <Cover src={secondaryLocation.coverImage.url} alt={secondaryLocation.name} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/25" />
                    <p className="absolute bottom-3 left-3 text-xs font-medium">{secondaryLocation.name}</p>
                  </Link>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/8 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <ParallaxMedia>
              <div className="bs-landing-map-frame overflow-hidden rounded-[20px] p-3 md:p-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[14px]">
                  <Cover src={mapImage} alt="Map preview" className="h-full w-full opacity-90" />
                  <div className="absolute inset-0 bg-[#0c0c0d]/25" />
                  <span className="absolute left-4 top-4 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur">
                    UK catalog
                  </span>
                  <span className="absolute right-4 top-4 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur">
                    MapLibre
                  </span>
                  <span className="bs-landing-map-pin left-[28%] top-[42%]" aria-hidden="true" />
                  <span className="bs-landing-map-pin left-[52%] top-[55%]" aria-hidden="true" />
                  <span className="bs-landing-map-pin left-[68%] top-[38%]" aria-hidden="true" />
                </div>
              </div>
            </ParallaxMedia>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-[#e8a84a]">Map</p>
            <h2 className="bs-landing-display mt-3 text-3xl md:text-5xl">See every location in place.</h2>
            <p className="mt-4 text-white/65">Filter by region, find what&apos;s nearby, and jump straight into a location or Bucket Shot.</p>
            <Link href="/map" className="mt-8 inline-flex rounded-2xl border border-white/20 px-6 py-3 transition-colors hover:border-white/40 hover:bg-white/5">
              Open the map
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/8 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5 lg:order-2">
            <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-[#e8a84a]">Plan</p>
            <h2 className="bs-landing-display mt-3 text-3xl md:text-5xl">Plan the weekend around the light.</h2>
            <p className="mt-4 text-white/65">Save shots to your bucket, build an itinerary, and keep a gear list—synced with the same account as iOS.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/bucket" className="rounded-2xl bg-[#e8a84a] px-6 py-3 font-semibold text-[#0c0c0d] transition-transform hover:scale-[1.02]">
                Open your bucket
              </Link>
              <Link href="/trips" className="rounded-2xl border border-white/20 px-6 py-3 transition-colors hover:border-white/40 hover:bg-white/5">
                View trips
              </Link>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-7 lg:order-1" delay={80}>
            <ParallaxMedia>
              <div className="relative mx-auto max-w-md overflow-hidden rounded-[20px]">
                <Cover src={planImage} alt={shots[2]?.title ?? primaryShot?.title ?? "Trip planning"} className="aspect-[3/4] w-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </ParallaxMedia>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/8 px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-[#e8a84a]">Also on iOS</p>
            <h2 className="bs-landing-display mt-3 text-3xl md:text-5xl">The same catalog in your pocket.</h2>
            <p className="mt-4 max-w-md text-white/65">
              Sign in once—saves, trips, and collections stay in sync between the web companion and the iOS app.
            </p>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-2xl bg-white px-6 py-3 font-semibold text-[#0c0c0d] transition-transform hover:scale-[1.02]"
            >
              Download on the App Store
            </a>
          </Reveal>
          <Reveal className="flex justify-center gap-5 lg:justify-end" delay={120}>
            {IOS_SCREENSHOTS.map((shot) => (
              <PhoneFrame key={shot.src} src={shot.src} label={shot.label} />
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/8 px-6 py-20 md:px-10">
        <Reveal className="mx-auto max-w-6xl text-center">
          <h2 className="bs-landing-display text-3xl md:text-4xl">Ready when the light is.</h2>
          <p className="mx-auto mt-4 max-w-md text-white/60">Browse the catalog as a guest, or sign in to save, publish, and plan.</p>
          <Link
            href="/discover"
            className="mt-8 inline-flex rounded-2xl bg-[#e8a84a] px-8 py-3.5 font-semibold text-[#0c0c0d] transition-transform hover:scale-[1.02]"
          >
            Enter the catalog
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-white/10 px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/55">BucketShot — web and iOS, one catalog.</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/65" aria-label="Legal">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function ParallaxMedia({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    function onScroll() {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewMid = window.innerHeight * 0.5;
      const delta = (rect.top + rect.height * 0.5 - viewMid) * 0.06;
      setOffset(Math.max(-24, Math.min(24, delta)));
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={ref} className={`bs-landing-parallax-wrap ${className}`} style={{ transform: `translateY(${offset}px)` }}>
      {children}
    </div>
  );
}

function PhoneFrame({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="bs-landing-phone w-[148px] sm:w-[168px]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[32px] border border-white/18 bg-[#18181a] shadow-[0_28px_56px_rgb(0_0_0_/_0.5)]">
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-2.5">
          <div className="h-5 w-[72px] rounded-full bg-black/85" />
        </div>
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`${label} app screenshot`} className="h-full w-full object-cover" onError={() => setFailed(true)} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-white/15 bg-[#141416] px-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-white/40">{label}</p>
            <p className="text-xs text-white/30">Screenshot soon</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bs-landing-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
