import { MARGE } from "@/constants/constants";
import { OfficeManagerType } from "@/zod-schemas/officeManager.schema";
import { ServicesFm4AllType } from "@/zod-schemas/servicesFm4All.schema";
import { TotalServicesFm4AllType } from "@/zod-schemas/total.schema";

type ServiceTotals = {
  totalNettoyage: number;
  totalHygiene: number;
  totalMaintenance: number;
  totalIncendie: number;
  totalCafe: number;
  totalThe: number;
  totalSnacksFruits: number;
  totalFontaines: number;
  totalOfficeManager: number;
};

export function calcServicesFm4AllTotaux(
  servicesFm4All: ServicesFm4AllType,
  officeManager: OfficeManagerType,
  serviceTotals: ServiceTotals,
): TotalServicesFm4AllType {
  const {
    totalNettoyage,
    totalHygiene,
    totalMaintenance,
    totalIncendie,
    totalCafe,
    totalThe,
    totalSnacksFruits,
    totalFontaines,
    totalOfficeManager,
  } = serviceTotals;

  const total =
    totalNettoyage +
    totalHygiene +
    totalMaintenance +
    totalIncendie +
    totalCafe +
    totalThe +
    totalSnacksFruits +
    totalFontaines +
    totalOfficeManager;

  const {
    infos: {
      assurance,
      plateforme,
      supportAdmin,
      supportOp,
      accountManager,
    },
    prix: {
      tauxAssurance,
      tauxPlateforme,
      tauxSupportAdmin,
      tauxSupportOp,
      tauxAccountManager,
      remiseCaSeuil,
      tauxRemiseCa,
      tauxRemiseHof,
      minFacturationPlateforme,
      minFacturationSupportOp,
      minFacturationAccountManager,
    },
  } = servicesFm4All;

  const prixAssurance =
    assurance === "non propose"
      ? null
      : assurance === "inclus"
        ? 0
        : tauxAssurance * total * MARGE;

  const prixPlateforme =
    plateforme === "non propose"
      ? null
      : plateforme === "inclus"
        ? 0
        : Math.max(tauxPlateforme * total * MARGE, minFacturationPlateforme);

  const prixSupportAdmin =
    supportAdmin === "non propose"
      ? null
      : supportAdmin === "inclus"
        ? 0
        : tauxSupportAdmin * total * MARGE;

  const prixSupportOp =
    supportOp === "non propose"
      ? null
      : supportOp === "inclus"
        ? 0
        : Math.max(tauxSupportOp * total * MARGE, minFacturationSupportOp);

  const prixAccountManager =
    accountManager === "non propose"
      ? null
      : accountManager === "inclus"
        ? 0
        : Math.max(
            tauxAccountManager * total * MARGE,
            minFacturationAccountManager,
          );

  const remiseCa =
    total * MARGE >= remiseCaSeuil ? tauxRemiseCa * total * MARGE : 0;

  const remiseHof = officeManager.infos.gammeSelected
    ? tauxRemiseHof * total * MARGE
    : 0;

  return {
    totalAssurance: prixAssurance,
    totalPlateforme: prixPlateforme,
    totalSupportAdmin: prixSupportAdmin,
    totalSupportOp: prixSupportOp,
    totalAccountManager: prixAccountManager,
    totalRemiseCa: remiseCa,
    totalRemiseHof: remiseHof,
  };
}
