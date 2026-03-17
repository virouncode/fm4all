import { getTerrainDataByToken } from "@/server/queries/terrain.query";
import { notFound } from "next/navigation";
import { OccurrenceTerrain } from "./OccurrenceTerrain";

export default async function TerrainPage({
  params,
}: {
  params: Promise<{ token: string; locale: string }>;
}) {
  const { token } = await params;

  const data = await getTerrainDataByToken(token).catch(() => null);
  if (!data) notFound();

  return (
    <OccurrenceTerrain
      token={token}
      occurrence={data.occurrence}
      taches={data.taches}
      clientEntrepriseId={data.clientEntrepriseId}
    />
  );
}
