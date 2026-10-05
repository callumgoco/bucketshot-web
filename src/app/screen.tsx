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
  const discoverImage = destinations[1]?.coverImage.url ?? hero?.coverImage.url;
  const mapImage = locations[0]?.coverImage.url ?? destinations[2]?.coverImage.url ?? hero?.coverImage.url;
  const planImage = shots[0]?.coverImage.url ?? destinations[3]?.coverImage.url ?? hero?.coverImage.url;

  function goToSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = searchQuery.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  return (
    <div className="bg-[#0c0c0d] text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bs-landing-hero-media">
          <Cover src={hero?.coverImage.url} alt="" className="h-full w-full" />
          <div className="bs-onboarding-scrim absolute inset-0" />
        </div>
        <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[1.4px]">BucketShot</p>
          <button
            type="button"
            onClick={() => app.setAuthReason("signIn")}
            className="rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur transition-colors hover:bg-white/16"
          >
            Sign in
          </button>
        </header>
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col justify-end px-6 pb-20 md:px-10">
          <div className="bs-landing-hero-copy">
            <p className="text-sm uppercase tracking-[1.4px] text-white/70">Photography, planned</p>
            <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">Places worth photographing.</h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              Find the location, learn the composition, and plan the trip around the light.
            </p>
            <form onSubmit={goToSearch} className="mt-8 max-w-xl">
              <label htmlFor="landing-search" className="sr-only">
                Search places, shots, photographers
              </label>
              <div className="flex gap-2">
                <input
                  id="landing-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search places, shots, photographers"
                  className="h-12 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-white outline-none backdrop-blur placeholder:text-white/45 focus:border-white/40"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-[#e8a84a] px-5 font-semibold text-[#0c0c0d] transition-transform hover:scale-[1.02]"
                >
                  Search
                </button>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/discover" className="rounded-full bg-[#e8a84a] px-6 py-3 font-semibold text-[#0c0c0d] transition-transform hover:scale-[1.02]">
                Enter the catalog
              </Link>
              <Link href="/map" className="rounded-full border border-white/25 px-6 py-3 transition-colors hover:border-white/50 hover:bg-white/5">
                Open the map
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FeatureBand
        overline="Discover"
        title="A curated UK catalog"
        detail="Browse destinations, projects, and Bucket Shots that show where to stand, what to face, and which light to wait for."
        href="/discover"
        cta="Explore Discover"
        image={discoverImage}
        imageAlt={destinations[1]?.name ?? "Destination"}
      />

      <FeatureBand
        overline="Map"
        title="See every location in place"
        detail="Open the map to filter by region, find nearby spots, and jump straight into a location or shot."
        href="/map"
        cta="Open the map"
        image={mapImage}
        imageAlt={locations[0]?.name ?? "Location"}
        reverse
      />

      <FeatureBand
        overline="Plan"
        title="Save shots. Build the trip."
        detail="Keep a bucket list, assemble weekend itineraries, and track gear—synced with the same account as iOS."
        href="/bucket"
        cta="Open your bucket"
        secondaryHref="/trips"
        secondaryCta="View trips"
        image={planImage}
        imageAlt={shots[0]?.title ?? "Bucket Shot"}
      />

      <section className="border-t border-white/10 px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
          <Reveal>
            <p className="text-sm uppercase tracking-[1.4px] text-[#e8a84a]">Also on iOS</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">The same catalog in your pocket</h2>
            <p className="mt-4 max-w-md text-base text-white/70">
              Sign in once—saves, trips, and collections stay in sync between the web companion and the iOS app.
            </p>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-[#0c0c0d] transition-transform hover:scale-[1.02]"
            >
              Download on the App Store
            </a>
          </Reveal>
          <Reveal className="flex justify-center gap-4 md:justify-end" delay={120}>
            {IOS_SCREENSHOTS.map((shot) => (
              <PhoneFrame key={shot.src} src={shot.src} label={shot.label} />
            ))}
          </Reveal>
        </div>
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

function FeatureBand({
  overline,
  title,
  detail,
  href,
  cta,
  secondaryHref,
  secondaryCta,
  image,
  imageAlt,
  reverse = false,
}: {
  overline: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  secondaryHref?: string;
  secondaryCta?: string;
  image?: string | null;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <section className="border-t border-white/10 px-6 py-20 md:px-10 md:py-28">
      <div className={`mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
        <Reveal>
          <p className="text-sm uppercase tracking-[1.4px] text-[#e8a84a]">{overline}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          <p className="mt-4 max-w-md text-base text-white/70">{detail}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={href} className="rounded-full bg-[#e8a84a] px-5 py-2.5 text-sm font-semibold text-[#0c0c0d] transition-transform hover:scale-[1.02]">
              {cta}
            </Link>
            {secondaryHref && secondaryCta ? (
              <Link href={secondaryHref} className="rounded-full border border-white/25 px-5 py-2.5 text-sm transition-colors hover:border-white/50 hover:bg-white/5">
                {secondaryCta}
              </Link>
            ) : null}
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="bs-landing-feature-media relative aspect-[4/3] overflow-hidden rounded-[20px]">
            <Cover src={image} alt={imageAlt} className="h-full w-full transition-transform duration-700 ease-out hover:scale-[1.03]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PhoneFrame({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="bs-landing-phone w-[140px] sm:w-[160px]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[28px] border border-white/20 bg-[#18181a] shadow-[0_24px_48px_rgb(0_0_0_/_0.45)]">
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
          <div className="h-5 w-16 rounded-full bg-black/80" />
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
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
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
