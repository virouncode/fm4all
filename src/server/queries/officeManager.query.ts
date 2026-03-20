import "server-only";
import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  documents,
  entrepriseInfos,
  entreprises,
  officeManagerQuantites,
  officeManagerTarifs,
} from "@/db/schema";
import { getGlobalTag } from "@/lib/data-cache";
import { roundEffectifOfficeManager } from "@/lib/utils/roundEffectifOfficeManager";
import { roundSurface } from "@/lib/utils/roundSurface";
import { selectOfficeManagerQuantitesSchema } from "@/zod-schemas/officeManagerQuantites.schema";
import { selectOfficeManagerTarifsSchema } from "@/zod-schemas/officeManagerTarifs.schema";
import { eq, getTableColumns } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getOfficeManagerQuantites = async (
  surface: string,
  effectif: string,
) => {
  "use cache";
  cacheTag(getGlobalTag("officeManagerQuantites"));
  const roundedSurface = roundSurface(parseInt(surface));
  const roundedEffectif = roundEffectifOfficeManager(parseInt(effectif));
  try {
    const [resultsSurface, resultsEffectif] = await Promise.all([
      db
        .select()
        .from(officeManagerQuantites)
        .where(eq(officeManagerQuantites.surface, roundedSurface)),
      db
        .select()
        .from(officeManagerQuantites)
        .where(eq(officeManagerQuantites.effectif, roundedEffectif)),
    ]);
    if (resultsSurface.length === 0 || resultsEffectif.length === 0) return [];
    const results =
      (resultsSurface.find((result) => result.gamme === "essentiel")
        ?.demiJParSemaine as number) >=
      (resultsEffectif.find((result) => result.gamme === "essentiel")
        ?.demiJParSemaine as number)
        ? resultsSurface
        : resultsEffectif;
    return results.map((result) =>
      selectOfficeManagerQuantitesSchema.parse(result),
    );
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getOfficeManagerTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("officeManagerTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(officeManagerTarifs),
        nomPrestataire: entreprises.nom,
        slogan: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
      })
      .from(officeManagerTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, officeManagerTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entrepriseInfos.logoDocumentId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectOfficeManagerTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      demiTjm: result.demiTjm / RATIO,
      demiTjmPremium: result.demiTjmPremium / RATIO,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};
