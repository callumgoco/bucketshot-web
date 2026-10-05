import type { Metadata } from "next";
import Screen from "./screen";

export const metadata: Metadata = {
  title: "Privacy Policy · BucketShot",
  description: "How BucketShot collects, uses, and shares personal information.",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await params;
  await searchParams;
  return <Screen />;
}
