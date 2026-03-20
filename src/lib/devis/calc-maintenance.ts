import { MaintenanceType } from "@/zod-schemas/maintenance.schema";
import { TotalMaintenanceType } from "@/zod-schemas/total.schema";

export function calcMaintenanceTotaux(
  maintenance: MaintenanceType,
): TotalMaintenanceType {
  const {
    infos: { gammeSelected },
    quantites: { freqAnnuelle, hParPassage },
    prix: { tauxHoraire, prixQ18, prixLegio, prixQualiteAir },
  } = maintenance;

  const totalService =
    freqAnnuelle !== null && hParPassage !== null && tauxHoraire !== null
      ? hParPassage * tauxHoraire * freqAnnuelle
      : null;

  const totalQ18 = gammeSelected !== null ? prixQ18 : null;

  const totalLegio =
    gammeSelected !== null && gammeSelected !== "essentiel" ? prixLegio : null;

  const totalQualiteAir =
    gammeSelected !== null && gammeSelected === "excellence"
      ? prixQualiteAir
      : null;

  return {
    totalService,
    totalQ18,
    totalLegio,
    totalQualiteAir,
  };
}
