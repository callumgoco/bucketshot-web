import { describe, expect, it } from "vitest";

const live = process.env.BUCKETSHOT_LIVE_INTEGRATION === "1";

describe.skipIf(!live)("live supabase catalog", () => {
  it("reads the public UK catalog with the anon key", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const response = await fetch(`${url}/rest/v1/destinations?select=id`, {
      headers: { apikey: key!, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
    });
    expect(response.ok || response.status === 206).toBe(true);
    expect(response.headers.get("content-range")).toMatch(/\/20$/);
  });
});
