# BucketShot Web

The web companion to the BucketShot iOS app. It uses the same Supabase project, anon key, tables, storage buckets, and row-level security. Guests can browse the UK catalog. Sign-in, saves, trips, collections, comments, and publishing use the same account as iOS.

## Setup

```bash
cd bucketshot-web
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# optional: NEXT_PUBLIC_CARTO_API_KEY from https://carto.com/basemaps/apikey
npm install
npm run dev
```

Add `http://localhost:3000/auth/callback` to Supabase **Authentication → URL Configuration → Redirect URLs** so magic links can return to the web app. Leave `bucketshot://auth-callback` in place for iOS.

## Scripts

- `npm run dev` — local app
- `npm test` — Vitest unit tests
- `npm run test:e2e` — Playwright browse journeys
- `BUCKETSHOT_LIVE_INTEGRATION=1 npm test` — opt-in read against the live project

## Substitutions from iOS

- Maps: MapLibre GL with CARTO light/dark tiles when `NEXT_PUBLIC_CARTO_API_KEY` is set, otherwise OpenStreetMap
- Weather: Open-Meteo, not WeatherKit
- Sun and moon: `suncalc`, checked against the same coordinate math
- Auth: email/password and magic link. Sign in with Apple stays on iOS
- Photo import: file input plus `exifr` for EXIF and GPS
