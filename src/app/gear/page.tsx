import Screen from "./screen";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await params;
  const query = await searchParams;
  const q = Array.isArray(query.q) ? query.q[0] : query.q ?? "";
  return <Screen query={q} />;
}
