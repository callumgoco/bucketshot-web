"use client";

import { GearList } from "@/app/projects/[id]/screen";

export default function GearPage({ query = "" }: { query?: string }) {
  return <GearList query={query} />;
}
