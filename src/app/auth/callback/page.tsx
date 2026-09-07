import Screen from "./screen";

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
