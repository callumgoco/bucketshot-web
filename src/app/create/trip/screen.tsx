"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateTripRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/trips");
  }, [router]);
  return <p>Opening trip planner…</p>;
}
