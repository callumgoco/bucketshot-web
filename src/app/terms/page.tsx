import type { Metadata } from "next";
import Screen from "./screen";

export const metadata: Metadata = {
  title: "Terms of Use · BucketShot",
  description: "Terms of Use (EULA) for BucketShot, including auto-renewable subscriptions.",
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
