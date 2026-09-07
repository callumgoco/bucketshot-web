import * as SunCalcNamespace from "suncalc";

type SunCalcApi = {
  getTimes: (date: Date, lat: number, lng: number) => Record<string, Date>;
  getMoonIllumination: (date: Date) => { phase: number; fraction: number };
  getMoonTimes: (date: Date, lat: number, lng: number) => { rise?: Date; set?: Date };
};

const SunCalc = (("getTimes" in SunCalcNamespace ? SunCalcNamespace : (SunCalcNamespace as { default: SunCalcApi }).default) as SunCalcApi);
import type { GeoCoordinate, LightCondition } from "@/lib/domain/types";

export type LightTimes = {
  sunrise: Date | null;
  sunset: Date | null;
  goldenHourMorningEnd: Date | null;
  goldenHourEveningStart: Date | null;
  blueHourMorningEnd: Date | null;
  blueHourEveningStart: Date | null;
  solarNoon: Date | null;
};

export function lightTimes(coordinate: GeoCoordinate, date = new Date()): LightTimes {
  const times = SunCalc.getTimes(date, coordinate.latitude, coordinate.longitude);
  return {
    sunrise: times.sunrise ?? null,
    sunset: times.sunset ?? null,
    goldenHourMorningEnd: times.goldenHourEnd ?? null,
    goldenHourEveningStart: times.goldenHour ?? null,
    blueHourMorningEnd: times.dawn ?? null,
    blueHourEveningStart: times.dusk ?? null,
    solarNoon: times.solarNoon ?? null,
  };
}

export function moonPhase(coordinate: GeoCoordinate, date = new Date()) {
  const illumination = SunCalc.getMoonIllumination(date);
  const times = SunCalc.getMoonTimes(date, coordinate.latitude, coordinate.longitude);
  const names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
  const index = Math.round(illumination.phase * 8) % 8;
  return {
    name: names[index],
    fraction: illumination.fraction,
    rise: times.rise ?? null,
    set: times.set ?? null,
  };
}

export function formatClock(date: Date | null) {
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export type WeatherSnapshot = {
  summary: string;
  cloudCover: number;
  precipitation: number;
  windSpeed: number;
  temperature: number;
  fetchedAt: number;
};

const weatherCache = new Map<string, WeatherSnapshot>();

export async function fetchWeather(coordinate: GeoCoordinate): Promise<WeatherSnapshot | null> {
  const windowKey = Math.floor(Date.now() / (30 * 60 * 1000));
  const key = `${coordinate.latitude.toFixed(2)}:${coordinate.longitude.toFixed(2)}:${windowKey}`;
  const cached = weatherCache.get(key);
  if (cached) return cached;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coordinate.latitude}&longitude=${coordinate.longitude}&current=temperature_2m,cloud_cover,precipitation,wind_speed_10m,weather_code`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const json = (await response.json()) as {
    current?: { temperature_2m?: number; cloud_cover?: number; precipitation?: number; wind_speed_10m?: number; weather_code?: number };
  };
  const current = json.current;
  if (!current) return null;
  const snapshot: WeatherSnapshot = {
    summary: weatherLabel(current.weather_code ?? 0, current.cloud_cover ?? 0),
    cloudCover: current.cloud_cover ?? 0,
    precipitation: current.precipitation ?? 0,
    windSpeed: current.wind_speed_10m ?? 0,
    temperature: current.temperature_2m ?? 0,
    fetchedAt: Date.now(),
  };
  weatherCache.set(key, snapshot);
  return snapshot;
}

function weatherLabel(code: number, cloud: number) {
  if (code >= 95) return "Thunderstorm";
  if (code >= 71) return "Snow";
  if (code >= 51) return "Rain";
  if (code >= 45) return "Fog";
  if (cloud > 80) return "Overcast";
  if (cloud > 40) return "Broken cloud";
  return "Clear";
}

export function matchScore(preferred: LightCondition[], weather: WeatherSnapshot | null) {
  if (!weather) return { label: "Unknown", tone: "mixed" as const };
  const wantsNight = preferred.includes("night") || preferred.includes("aurora");
  const wantsOvercast = preferred.includes("overcast") || preferred.includes("fog");
  if (wantsNight && weather.cloudCover < 40) return { label: "Promising", tone: "promising" as const };
  if (wantsOvercast && weather.cloudCover > 60) return { label: "Promising", tone: "promising" as const };
  if (weather.precipitation > 1 || weather.windSpeed > 12) return { label: "Poor", tone: "poor" as const };
  if (weather.cloudCover > 85 && !wantsOvercast) return { label: "Mixed", tone: "mixed" as const };
  return { label: "Promising", tone: "promising" as const };
}
