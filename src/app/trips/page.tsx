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
  const addShot = Array.isArray(query.addShot) ? query.addShot[0] : query.addShot ?? null;
  const addLocation = Array.isArray(query.addLocation) ? query.addLocation[0] : query.addLocation ?? null;
  return <Screen addShot={addShot} addLocation={addLocation} />;
}
