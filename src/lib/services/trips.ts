import type { Trip, TripDay } from "@/lib/domain/types";

export function dayCount(start: string | null, end: string | null) {
  if (!start || !end) return 1;
  const from = new Date(start);
  const to = new Date(end);
  const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
  return Math.max(1, days);
}

export function buildDays(start: string | null, end: string | null, tripId: string): TripDay[] {
  const count = dayCount(start, end);
  const startDate = start ? new Date(start) : new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      id: crypto.randomUUID(),
      tripId,
      date: start ? date.toISOString().slice(0, 10) : null,
      title: `Day ${index + 1}`,
      notes: "",
      sortOrder: index,
      stops: [],
    };
  });
}

export function defaultGear() {
  return ["Camera body", "Wide lens", "Tripod", "Filters", "Spare battery", "Rain cover"].map((title, index) => ({
    id: crypto.randomUUID(),
    title,
    isChecked: false,
    isCustom: false,
    sortOrder: index,
  }));
}

export function isInProgress(trip: Trip, today = new Date()) {
  if (!trip.startDate || !trip.endDate) return false;
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  end.setHours(23, 59, 59, 999);
  return today >= start && today <= end;
}
