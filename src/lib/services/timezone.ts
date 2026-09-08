import tzlookup from "tz-lookup";
import type { GeoCoordinate } from "@/lib/domain/types";

/** Resolve an IANA timezone for map coordinates (handles BST/GMT for the UK). */
export function timeZoneForCoordinate(coordinate: GeoCoordinate): string {
  try {
    return tzlookup(coordinate.latitude, coordinate.longitude);
  } catch {
    return "UTC";
  }
}
