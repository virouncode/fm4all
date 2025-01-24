import { RATIO } from "@/constants/constants";
import { db } from "@/db";
import { servicesFm4AllOffres, servicesFm4AllTaux } from "@/db/schema";
import { errorHelper } from "@/lib/errorHelper";
import { selectServicesFm4AllOffresSchema } from "@/zod-schemas/servicesFm4AllOffresType";
import { selectServicesFm4AllTauxSchema } from "@/zod-schemas/servicesFm4AllTaux";

export const getServicesFm4AllTaux = async () => {
  try {
    const results = await db.select().from(servicesFm4AllTaux);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectServicesFm4AllTauxSchema.parse(result)
    );
    return validatedResults.map((validatedResult) => ({
      ...validatedResult,
      assurance: validatedResult.assurance / (RATIO * 100),
      plateforme: validatedResult.plateforme / (RATIO * 100),
      minFacturationPlateforme:
        validatedResult.minFacturationPlateforme / RATIO,
      supportAdmin: validatedResult.supportAdmin / (RATIO * 100),
      supportOp: validatedResult.supportOp / (RATIO * 100),
      minFacturationSupportOp: validatedResult.minFacturationSupportOp / RATIO,
      accountManager: validatedResult.accountManager / (RATIO * 100),
      minFacturationAccountManager:
        validatedResult.minFacturationAccountManager / RATIO,
      remiseCaSeuil: validatedResult.remiseCaSeuil / RATIO,
      remiseCa: validatedResult.remiseCa / (RATIO * 100),
      remiseHof: validatedResult.remiseHof / (RATIO * 100),
    }));
  } catch (err) {
    errorHelper(err);
  }
};

export const getServicesFm4AllOffres = async () => {
  try {
    const results = await db.select().from(servicesFm4AllOffres);
    if (results.length === 0) return [];
    const validatedResults = results.map((result) =>
      selectServicesFm4AllOffresSchema.parse(result)
    );
    return validatedResults;
  } catch (err) {
    errorHelper(err);
  }
};
