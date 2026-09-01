import "server-only";
import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import { servicesFm4AllOffres, servicesFm4AllTaux } from "@/db/schema";
import { getGlobalTag } from "@/lib/data-cache";
import { selectServicesFm4AllOffresSchema } from "@/zod-schemas/servicesFm4AllOffresType.schema";
import { selectServicesFm4AllTauxSchema } from "@/zod-schemas/servicesFm4AllTaux.schema";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export const getServicesFm4AllTaux = async () => {
  "use cache";
  cacheTag(getGlobalTag("servicesFm4AllTaux"));
  try {
    const results = await db.select().from(servicesFm4AllTaux);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectServicesFm4AllTauxSchema.parse(result),
    );
    return validatedResults.map((result) => ({
      ...result,
      assurance: result.assurance / (RATIO * 100),
      plateforme: result.plateforme / (RATIO * 100),
      minFacturationPlateforme: result.minFacturationPlateforme / RATIO,
      supportAdmin: result.supportAdmin / (RATIO * 100),
      supportOp: result.supportOp / (RATIO * 100),
      minFacturationSupportOp: result.minFacturationSupportOp / RATIO,
      accountManager: result.accountManager / (RATIO * 100),
      minFacturationAccountManager: result.minFacturationAccountManager / RATIO,
      remiseCaSeuil: result.remiseCaSeuil / RATIO,
      remiseCa: result.remiseCa / (RATIO * 100),
      remiseHof: result.remiseHof / (RATIO * 100),
    }));
  } catch (error) {
    console.error("[queries] getServicesFm4AllTaux a échoué", error);
    return [];
  }
};

export const getServicesFm4AllOffres = async () => {
  "use cache";
  cacheTag(getGlobalTag("servicesFm4AllOffres"));
  try {
    const results = await db.select().from(servicesFm4AllOffres);
    if (results.length === 0) return [];
    return results.map((result) =>
      selectServicesFm4AllOffresSchema.parse(result),
    );
  } catch (error) {
    console.error("[queries] getServicesFm4AllOffres a échoué", error);
    return [];
  }
};
