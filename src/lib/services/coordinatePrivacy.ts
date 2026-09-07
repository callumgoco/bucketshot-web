import type { CoordinatePrecision } from "@/lib/domain/types";

/** Matches Postgres `redact_coordinate` and iOS CoordinatePrivacy. */
export function displayCoordinate(
  exact: number | null | undefined,
  precision: CoordinatePrecision,
  viewerIsOwner: boolean,
): number | null {
  if (exact == null || Number.isNaN(exact)) return null;
  if (viewerIsOwner) return exact;
  if (precision === "exact") return exact;
  if (precision === "approximate") return Math.round(exact * 100) / 100;
  return null;
}
