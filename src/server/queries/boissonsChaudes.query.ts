import "server-only";
import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  cafeConsoTarifs,
  cafeMachines,
  cafeMachinesTarifs,
  chocolatConsoTarifs,
  documents,
  entrepriseInfos,
  entreprises,
  laitConsoTarifs,
  sucreConsoTarifs,
  theConsoTarifs,
} from "@/db/schema";
import { selectCafeConsoTarifsSchema } from "@/zod-schemas/cafeConsoTarifs.schema";
import { selectCafeMachinesSchema } from "@/zod-schemas/cafeMachine.schema";
import { selectCafeMachinesTarifsSchema } from "@/zod-schemas/cafeMachinesTarifs.schema";
import { selectChocolatConsoTarifsSchema } from "@/zod-schemas/chocolatConsoTarifs.schema";
import { selectLaitConsoTarifsSchema } from "@/zod-schemas/laitConsoTarifs.schema";
import { selectSucreConsoTarifsSchema } from "@/zod-schemas/sucreConsoTarifs.schema";
import { selectTheConsoTarifsSchema } from "@/zod-schemas/theConsoTarifs.schema";
import { getGlobalTag } from "@/lib/data-cache";
import { eq, getTableColumns } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getCafeMachinesTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("cafeMachinesTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(cafeMachinesTarifs),
        nomPrestataire: entreprises.nom,
        slogan: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
        anneeCreation: entrepriseInfos.anneeCreation,
        ca: entrepriseInfos.ca,
        effectifPrestataire: entrepriseInfos.effectif,
        nbClients: entrepriseInfos.nbClients,
        noteGoogle: entrepriseInfos.noteGoogle,
        nbAvis: entrepriseInfos.nbAvis,
      })
      .from(cafeMachinesTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, cafeMachinesTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entrepriseInfos.logoDocumentId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectCafeMachinesTarifsSchema.parse(result),
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
      paMaintenance:
        result.paMaintenance !== null ? result.paMaintenance / RATIO : null,
      fraisInstallation:
        result.fraisInstallation !== null
          ? result.fraisInstallation / RATIO
          : null,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getCafeConsoTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("cafeConsoTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(cafeConsoTarifs),
        nomPrestataire: entreprises.nom,
        slogan: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
        anneeCreation: entrepriseInfos.anneeCreation,
        ca: entrepriseInfos.ca,
        effectifPrestataire: entrepriseInfos.effectif,
        nbClients: entrepriseInfos.nbClients,
        noteGoogle: entrepriseInfos.noteGoogle,
        nbAvis: entrepriseInfos.nbAvis,
      })
      .from(cafeConsoTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, cafeConsoTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entrepriseInfos.logoDocumentId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectCafeConsoTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire: result.prixUnitaire ? result.prixUnitaire / RATIO : null,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getLaitConsoTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("laitConsoTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(laitConsoTarifs),
        nomPrestataire: entreprises.nom,
        slogan: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
      })
      .from(laitConsoTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, laitConsoTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entrepriseInfos.logoDocumentId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectLaitConsoTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaireDosette:
        result.prixUnitaireDosette !== null
          ? result.prixUnitaireDosette / RATIO
          : null,
      prixUnitaireFrais:
        result.prixUnitaireFrais !== null
          ? result.prixUnitaireFrais / RATIO
          : null,
      prixUnitairePoudre:
        result.prixUnitairePoudre !== null
          ? result.prixUnitairePoudre / RATIO
          : null,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getChocolatConsoTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("chocolatConsoTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(chocolatConsoTarifs),
        nomPrestataire: entreprises.nom,
        slogan: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
      })
      .from(chocolatConsoTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, chocolatConsoTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entrepriseInfos.logoDocumentId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectChocolatConsoTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaireSachet:
        result.prixUnitaireSachet !== null
          ? result.prixUnitaireSachet / RATIO
          : null,
      prixUnitairePoudre:
        result.prixUnitairePoudre !== null
          ? result.prixUnitairePoudre / RATIO
          : null,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getTheConsoTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("theConsoTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(theConsoTarifs),
        nomPrestataire: entreprises.nom,
        slogan: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
        anneeCreation: entrepriseInfos.anneeCreation,
        ca: entrepriseInfos.ca,
        effectifPrestataire: entrepriseInfos.effectif,
        nbClients: entrepriseInfos.nbClients,
        noteGoogle: entrepriseInfos.noteGoogle,
        nbAvis: entrepriseInfos.nbAvis,
      })
      .from(theConsoTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, theConsoTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entrepriseInfos.logoDocumentId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectTheConsoTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire:
        result.prixUnitaire !== null ? result.prixUnitaire / RATIO : null,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getSucreConsoTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("sucreConsoTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(sucreConsoTarifs),
        nomPrestataire: entreprises.nom,
        slogan: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
      })
      .from(sucreConsoTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, sucreConsoTarifs.entrepriseId),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entrepriseInfos.logoDocumentId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectSucreConsoTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixUnitaire:
        result.prixUnitaire !== null ? result.prixUnitaire / RATIO : null,
    }));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};

export const getCafeMachines = async () => {
  "use cache";
  cacheTag(getGlobalTag("cafeMachines"));
  try {
    const results = await db.select().from(cafeMachines);
    if (results.length === 0) return [];
    return results.map((result) => selectCafeMachinesSchema.parse(result));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return [];
  }
};
