import "server-only";
import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import {
  documents,
  entrepriseInfos,
  entrepriseRoles,
  entreprises,
  hygieneConsoTarifs,
  hygieneDistribQuantites,
  hygieneDistribTarifs,
  hygieneInstalDistribTarifs,
  hygieneMinFacturation,
} from "@/db/schema";
import {
  getEffectifTag,
  getGlobalTag,
  getPrestataireTag,
} from "@/lib/data-cache";
import { roundEffectif } from "@/lib/utils/roundEffectif";
import {
  selectHygieneConsoTarifsFournisseurSchema,
  selectHygieneConsoTarifsSchema,
} from "@/zod-schemas/hygieneConsoTarifs.schema";
import { selectHygieneDistribQuantitesSchema } from "@/zod-schemas/hygieneDistribQuantites.schema";
import {
  selectHygieneDistribTarifsFournisseurSchema,
  selectHygieneDistribTarifsSchema,
} from "@/zod-schemas/hygieneDistribTarifs.schema";
import {
  selectHygieneInstalDistribTarifsFournisseurSchema,
  selectHygieneInstalDistribTarifsSchema,
} from "@/zod-schemas/hygieneInstalDistribTarifs.schema";
import { selectHygieneMinFacturationSchema } from "@/zod-schemas/hygieneMinFacturation.schema";
import { and, eq, getTableColumns } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

const imageDoc = alias(documents, "image_doc");

export const getHygieneDistribQuantite = async (effectif: string) => {
  "use cache";
  cacheTag(getEffectifTag("hygieneDistribQuantites", effectif));
  const roundedEffectif = roundEffectif(parseInt(effectif));
  try {
    const results = await db
      .select()
      .from(hygieneDistribQuantites)
      .where(eq(hygieneDistribQuantites.effectif, roundedEffectif));

    if (results.length === 0) return null;
    const formattedResults = {
      ...results[0],
      nbDistribEmpPoubelle: results[0].nbDistribEmp,
      nbDistribDesinfectant: results[0].nbDistribPh,
      nbDistribParfum: results[0].nbDistribEmp,
      nbDistribBalai: results[0].nbDistribPh,
      nbDistribPoubelle: Math.ceil(results[0].nbDistribPh / 2),
    };
    return selectHygieneDistribQuantitesSchema.parse(formattedResults);
  } catch {
    return null;
  }
};

export const getHygieneDistribTarifs = async () => {
  "use cache";
  cacheTag(getGlobalTag("hygieneDistribTarifs"));
  try {
    const results = await db
      .select({
        ...getTableColumns(hygieneDistribTarifs),
        nomPrestataire: entreprises.nom,
        slogan: entrepriseInfos.slogan,
        logoStorageKey: documents.storageKey,
        anneeCreation: entrepriseInfos.anneeCreation,
        ca: entrepriseInfos.ca,
        effectifPrestataire: entrepriseInfos.effectif,
        nbClients: entrepriseInfos.nbClients,
        noteGoogle: entrepriseInfos.noteGoogle,
        nbAvis: entrepriseInfos.nbAvis,
        imageStorageKey: imageDoc.storageKey,
      })
      .from(hygieneDistribTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, hygieneDistribTarifs.entrepriseId),
      )
      .innerJoin(
        entrepriseRoles,
        and(
          eq(entrepriseRoles.entrepriseId, entreprises.id),
          eq(entrepriseRoles.role, "prestataire"),
          eq(entrepriseRoles.estSurComparateur, true),
        ),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entreprises.logoId))
      .leftJoin(imageDoc, eq(imageDoc.id, hygieneDistribTarifs.imageId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectHygieneDistribTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      oneShot: result.oneShot ? result.oneShot / RATIO : null,
      pa12M: result.pa12M ? result.pa12M / RATIO : null,
      pa24M: result.pa24M ? result.pa24M / RATIO : null,
      pa36M: result.pa36M ? result.pa36M / RATIO : null,
    }));
  } catch {
    return [];
  }
};

export const getHygieneMinFacturation = async () => {
  "use cache";
  cacheTag(getGlobalTag("hygieneMinFacturation"));
  try {
    const results = await db.select().from(hygieneMinFacturation);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectHygieneMinFacturationSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      minFacturation: result.minFacturation ? result.minFacturation / RATIO : null,
    }));
  } catch {
    return [];
  }
};

export const getHygieneMinFacturationPrestataire = async (
  entrepriseId: string,
) => {
  "use cache";
  cacheTag(getPrestataireTag("hygieneMinFacturation", entrepriseId));
  try {
    const results = await db
      .select()
      .from(hygieneMinFacturation)
      .where(eq(hygieneMinFacturation.entrepriseId, entrepriseId));
    if (results.length === 0) return null;
    const validatedResults = results.map((result) =>
      selectHygieneMinFacturationSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      minFacturation: result.minFacturation ? result.minFacturation / RATIO : null,
    }))[0];
  } catch {
    return null;
  }
};

export const getHygieneDistribTarifsPrestataire = async (
  entrepriseId: string,
) => {
  "use cache";
  cacheTag(getPrestataireTag("hygieneDistribTarifs", entrepriseId));
  try {
    const results = await db
      .select()
      .from(hygieneDistribTarifs)
      .where(eq(hygieneDistribTarifs.entrepriseId, entrepriseId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectHygieneDistribTarifsFournisseurSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      oneShot: result.oneShot ? result.oneShot / RATIO : null,
      pa12M: result.pa12M ? result.pa12M / RATIO : null,
      pa24M: result.pa24M ? result.pa24M / RATIO : null,
      pa36M: result.pa36M ? result.pa36M / RATIO : null,
    }));
  } catch {
    return [];
  }
};

export const getHygieneInstalDistribTarifs = async (effectif: string) => {
  "use cache";
  cacheTag(getEffectifTag("hygieneInstalDistribTarifs", effectif));
  const roundedEffectif = roundEffectif(parseInt(effectif));
  try {
    const results = await db
      .select({ ...getTableColumns(hygieneInstalDistribTarifs) })
      .from(hygieneInstalDistribTarifs)
      .innerJoin(
        entrepriseRoles,
        and(
          eq(
            entrepriseRoles.entrepriseId,
            hygieneInstalDistribTarifs.entrepriseId,
          ),
          eq(entrepriseRoles.role, "prestataire"),
          eq(entrepriseRoles.estSurComparateur, true),
        ),
      )
      .where(eq(hygieneInstalDistribTarifs.effectif, roundedEffectif));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectHygieneInstalDistribTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixInstallation: result.prixInstallation / RATIO,
    }));
  } catch {
    return [];
  }
};

export const getHygieneInstalDistribTarifsPrestataire = async (
  entrepriseId: string,
) => {
  "use cache";
  cacheTag(getPrestataireTag("hygieneInstalDistribTarifs", entrepriseId));
  try {
    const results = await db
      .select()
      .from(hygieneInstalDistribTarifs)
      .where(eq(hygieneInstalDistribTarifs.entrepriseId, entrepriseId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectHygieneInstalDistribTarifsFournisseurSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      prixInstallation: result.prixInstallation / RATIO,
    }));
  } catch {
    return [];
  }
};

export const getHygieneConsosTarifs = async (effectif: string) => {
  "use cache";
  cacheTag(getEffectifTag("hygieneConsosTarifs", effectif));
  const roundedEffectif = roundEffectif(parseInt(effectif));
  try {
    const results = await db
      .select({
        ...getTableColumns(hygieneConsoTarifs),
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
      .from(hygieneConsoTarifs)
      .innerJoin(
        entreprises,
        eq(entreprises.id, hygieneConsoTarifs.entrepriseId),
      )
      .innerJoin(
        entrepriseRoles,
        and(
          eq(entrepriseRoles.entrepriseId, entreprises.id),
          eq(entrepriseRoles.role, "prestataire"),
          eq(entrepriseRoles.estSurComparateur, true),
        ),
      )
      .leftJoin(
        entrepriseInfos,
        eq(entrepriseInfos.entrepriseId, entreprises.id),
      )
      .leftJoin(documents, eq(documents.id, entreprises.logoId))
      .where(eq(hygieneConsoTarifs.effectif, roundedEffectif));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectHygieneConsoTarifsSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      paParPersonneEmp: result.paParPersonneEmp / RATIO,
      paParPersonnePh: result.paParPersonnePh / RATIO,
      paParPersonneSavon: result.paParPersonneSavon / RATIO,
      paParPersonneDesinfectant: result.paParPersonneDesinfectant / RATIO,
    }));
  } catch {
    return [];
  }
};

export const getHygieneConsosTarifsPrestataire = async (
  entrepriseId: string,
) => {
  "use cache";
  cacheTag(getPrestataireTag("hygieneConsosTarifs", entrepriseId));
  try {
    const results = await db
      .select()
      .from(hygieneConsoTarifs)
      .where(eq(hygieneConsoTarifs.entrepriseId, entrepriseId));
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectHygieneConsoTarifsFournisseurSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      paParPersonneEmp: result.paParPersonneEmp / RATIO,
      paParPersonnePh: result.paParPersonnePh / RATIO,
      paParPersonneSavon: result.paParPersonneSavon / RATIO,
      paParPersonneDesinfectant: result.paParPersonneDesinfectant / RATIO,
    }));
  } catch {
    return [];
  }
};
