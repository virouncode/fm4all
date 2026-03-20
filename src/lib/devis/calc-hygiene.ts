import { HygieneType } from "@/zod-schemas/hygiene.schema";
import { TotalHygieneType } from "@/zod-schemas/total.schema";

export function calcHygieneTotaux(
  hygiene: HygieneType,
  effectif: number,
): TotalHygieneType {
  const {
    infos: {
      trilogieGammeSelected,
      desinfectantGammeSelected,
      parfumGammeSelected,
      balaiGammeSelected,
      poubelleGammeSelected,
    },
    quantites: {
      nbDistribEmp,
      nbDistribEmpPoubelle,
      nbDistribSavon,
      nbDistribPh,
      nbDistribDesinfectant,
      nbDistribParfum,
      nbDistribBalai,
      nbDistribPoubelle,
    },
    prix: {
      prixDistribEmp,
      prixDistribEmpPoubelle,
      prixDistribSavon,
      prixDistribPh,
      prixDistribDesinfectant,
      prixDistribParfum,
      prixDistribBalai,
      prixDistribPoubelle,
      prixInstalDistrib,
      paParPersonneEmp,
      paParPersonneSavon,
      paParPersonnePh,
      paParPersonneDesinfectant,
    },
  } = hygiene;

  const totalEmp =
    nbDistribEmp && prixDistribEmp !== null && paParPersonneEmp !== null
      ? nbDistribEmp * prixDistribEmp + paParPersonneEmp * effectif
      : 0;

  const totalPoubellEmp =
    nbDistribEmpPoubelle && prixDistribEmpPoubelle !== null
      ? nbDistribEmpPoubelle * prixDistribEmpPoubelle
      : 0;

  const totalSavon =
    nbDistribSavon && prixDistribSavon !== null && paParPersonneSavon !== null
      ? nbDistribSavon * prixDistribSavon + paParPersonneSavon * effectif
      : 0;

  const totalPh =
    nbDistribPh && prixDistribPh !== null && paParPersonnePh !== null
      ? nbDistribPh * prixDistribPh + paParPersonnePh * effectif
      : 0;

  const totalTrilogie = trilogieGammeSelected
    ? totalEmp + totalPoubellEmp + totalSavon + totalPh || null
    : null;

  const totalInstallation = trilogieGammeSelected ? prixInstalDistrib : null;

  const totalDesinfectant =
    desinfectantGammeSelected &&
    prixDistribDesinfectant !== null &&
    paParPersonneDesinfectant !== null &&
    nbDistribDesinfectant
      ? nbDistribDesinfectant * prixDistribDesinfectant +
        paParPersonneDesinfectant * effectif
      : null;

  const totalParfum =
    parfumGammeSelected && prixDistribParfum !== null && nbDistribParfum
      ? nbDistribParfum * prixDistribParfum
      : null;

  const totalBalai =
    balaiGammeSelected && prixDistribBalai !== null && nbDistribBalai
      ? nbDistribBalai * prixDistribBalai
      : null;

  const totalPoubelle =
    poubelleGammeSelected && prixDistribPoubelle !== null && nbDistribPoubelle
      ? nbDistribPoubelle * prixDistribPoubelle
      : null;

  return {
    totalTrilogie,
    totalDesinfectant,
    totalParfum,
    totalBalai,
    totalPoubelle,
    totalInstallation,
  };
}
