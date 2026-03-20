import { FontainesType } from "@/zod-schemas/fontaines.schema";
import { TotalFontainesType } from "@/zod-schemas/total.schema";

export function calcFontainesTotaux(fontaines: FontainesType): TotalFontainesType {
  const totalEspaces = fontaines.espaces.map((espace) => {
    const {
      infos: { espaceId, poseSelected },
      quantites: { nbPersonnes },
      prix: {
        prixLoc,
        prixInstal,
        prixMaintenance,
        prixUnitaireConsoFiltres,
        prixUnitaireConsoCO2,
        prixUnitaireConsoEauChaude,
      },
    } = espace;

    if (!poseSelected || nbPersonnes === null) {
      return { espaceId, total: null, totalInstallation: null };
    }

    const totalConso =
      nbPersonnes *
      ((prixUnitaireConsoFiltres ?? 0) +
        (prixUnitaireConsoCO2 ?? 0) +
        (prixUnitaireConsoEauChaude ?? 0));

    const totalLoc =
      prixLoc !== null && prixMaintenance !== null
        ? prixLoc + prixMaintenance
        : null;

    const total = totalLoc !== null ? totalLoc + totalConso : null;

    const totalInstallation = prixInstal !== null ? prixInstal : null;

    return { espaceId, total, totalInstallation };
  });

  return { totalEspaces };
}
