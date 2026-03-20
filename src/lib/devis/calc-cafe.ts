import { RATIO_CHOCO, RATIO_LAIT, RATIO_SUCRE } from "@/constants/constants";
import { CafeType } from "@/zod-schemas/cafe.schema";
import { TotalCafeType } from "@/zod-schemas/total.schema";

export function calcCafeTotaux(cafe: CafeType): TotalCafeType {
  const totalEspaces = cafe.espaces.map((espace) => {
    const {
      infos: { espaceId, typeBoissons, gammeCafeSelected },
      quantites: { nbPersonnes },
      prix: {
        prixLoc,
        prixInstal,
        prixMaintenance,
        prixUnitaireConsoCafe,
        prixUnitaireConsoLait,
        prixUnitaireConsoChocolat,
        prixUnitaireConsoSucre,
      },
    } = espace;

    if (!gammeCafeSelected || nbPersonnes === null) {
      return { espaceId, total: null, totalInstallation: null };
    }

    const nbTassesParAn = nbPersonnes * 400;

    const totalConso =
      (prixUnitaireConsoCafe ?? 0) * nbTassesParAn +
      (prixUnitaireConsoSucre ?? 0) * nbTassesParAn * RATIO_SUCRE +
      (typeBoissons !== "cafe"
        ? (prixUnitaireConsoLait ?? 0) * nbTassesParAn * RATIO_LAIT
        : 0) +
      (typeBoissons === "chocolat"
        ? (prixUnitaireConsoChocolat ?? 0) * nbTassesParAn * RATIO_CHOCO
        : 0);

    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;

    const total =
      nbPersonnes && totalLoc !== null ? totalLoc + totalConso : null;

    const totalInstallation = prixInstal !== null ? prixInstal : null;

    return { espaceId, total, totalInstallation };
  });

  return { totalEspaces };
}
