import "server-only";
import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  documents,
  entrepriseInfos,
  entreprises,
  fontaines,
  fontainesTarifs,
} from "@/db/schema";
import { getGlobalTag } from "@/lib/data-cache";
import { selectFontainesModelesSchema } from "@/zod-schemas/fontainesModeles.schema";
import { selectFontainesTarifsSchema } from "@/zod-schemas/fontainesTarifs.schema";
import { eq, getTableColumns } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

const imageDoc = alias(documents, "image_doc");

export const getFontainesTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("fontainesTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(fontainesTarifs),
        nomPrestataire: entreprises.nom,
        sloganPrestataire: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
        anneeCreation: entrepriseInfos.anneeCreation,
        ca: entrepriseInfos.ca,
        effectifPrestataire: entrepriseInfos.effectif,
        nbClients: entrepriseInfos.nbClients,
        noteGoogle: entrepriseInfos.noteGoogle,
        nbAvis: entrepriseInfos.nbAvis,
        imageStorageKey: imageDoc.storageKey,
      })
      .from(fontainesTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, fontainesTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entreprises.logoId))
      .leftJoin(imageDoc, eq(imageDoc.id, fontainesTarifs.imageId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectFontainesTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      oneShot: result.oneShot !== null ? result.oneShot / RATIO : null,
      pa12M: result.pa12M !== null ? result.pa12M / RATIO : null,
      rac12M: result.rac12M !== null ? result.rac12M / RATIO : null,
      pa24M: result.pa24M !== null ? result.pa24M / RATIO : null,
      rac24M: result.rac24M !== null ? result.rac24M / RATIO : null,
      pa36M: result.pa36M !== null ? result.pa36M / RATIO : null,
      pa48M: result.pa48M !== null ? result.pa48M / RATIO : null,
      pa60M: result.pa60M !== null ? result.pa60M / RATIO : null,
      paMaintenance:
        result.paMaintenance !== null ? result.paMaintenance / RATIO : null,
      fraisInstallation:
        result.fraisInstallation !== null
          ? result.fraisInstallation / RATIO
          : null,
      paConsoFiltres:
        result.paConsoFiltres !== null ? result.paConsoFiltres / RATIO : null,
      paConsoCO2: result.paConsoCO2 !== null ? result.paConsoCO2 / RATIO : null,
      paConsoEauChaude:
        result.paConsoEauChaude !== null
          ? result.paConsoEauChaude / RATIO
          : null,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getFontaines = async () => {
  "use cache";
  cacheTag(getGlobalTag("fontaines"));
  try {
    const results = await db.select().from(fontaines);
    if (results.length === 0) return [];
    return results.map((result) => selectFontainesModelesSchema.parse(result));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};
