import { expect, test } from "@playwright/test";

test("guest can browse discover, search, and a destination", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Places worth photographing." })).toBeVisible();
  await page.goto("/discover");
  await expect(page.getByRole("heading", { name: "Discover" })).toBeVisible();
  await expect(page.getByText("Explore the UK")).toBeVisible();
  await page.goto("/search");
  await page.getByPlaceholder("Search places, shots, photographers").fill("Skye");
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await page.goto("/map");
  await expect(page.getByRole("link", { name: "Search this area" })).toBeVisible();
});
