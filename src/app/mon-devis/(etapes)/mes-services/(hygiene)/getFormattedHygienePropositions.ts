import { gammes } from "@/zod-schemas/gamme";
import { HygieneType } from "@/zod-schemas/hygiene";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";

export const getFormattedHygienePropositions = (
  effectif: number,
  hygiene: HygieneType,
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType,
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[],
  hygieneDistribInstalTarifs: SelectHygieneInstalDistribTarifsType[],
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[]
) => {
  //Nombre de distributeurs
  const nbDistribEmp =
    hygiene.quantites.nbDistribEmp || hygieneDistribQuantite.nbDistribEmp;
  const nbDistribEmpPoubelle =
    hygiene.quantites.nbDistribEmpPoubelle ||
    hygieneDistribQuantite.nbDistribEmpPoubelle;
  const nbDistribSavon =
    hygiene.quantites.nbDistribSavon || hygieneDistribQuantite.nbDistribSavon;
  const nbDistribPh =
    hygiene.quantites.nbDistribPh || hygieneDistribQuantite.nbDistribPh;
  //Tarifs distributeurs
  const dureeLocation = hygiene.infos.dureeLocation;
  const {
    hygieneDistribTarifsFournisseur,
    prixInstalDistrib,
    paParPersonneEmp,
    paParPersonneSavon,
    paParPersonnePh,
  } = getHygieneFournisseurTarifs(
    hygiene,
    hygieneDistribTarifs,
    hygieneConsosTarifs,
    hygieneDistribInstalTarifs
  );

  const propositions = gammes.map((gamme) => {
    const prixDistribEmp =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "emp" && tarif.gamme === gamme
      )?.[dureeLocation] ?? null;

    const prixDistribEmpPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "poubelleEmp" && tarif.gamme === gamme
      )?.[dureeLocation] ?? null;

    const prixDistribSavon =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "savon" && tarif.gamme === gamme
      )?.[dureeLocation] ?? null;

    const prixDistribPh =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "ph" && tarif.gamme === gamme
      )?.[dureeLocation] ?? null;

    const totalAnnuelTrilogie =
      prixDistribEmp !== null &&
      prixDistribEmpPoubelle !== null &&
      prixDistribSavon !== null &&
      prixDistribPh !== null &&
      paParPersonneEmp !== null &&
      paParPersonneSavon !== null &&
      paParPersonnePh !== null
        ? nbDistribEmp * prixDistribEmp +
          nbDistribEmpPoubelle * prixDistribEmpPoubelle +
          nbDistribSavon * prixDistribSavon +
          nbDistribPh * prixDistribPh +
          (paParPersonneEmp + paParPersonneSavon + paParPersonnePh) * effectif
        : null;

    return {
      gamme,
      nbDistribEmp,
      nbDistribSavon,
      nbDistribPh,
      prixDistribEmp,
      prixDistribEmpPoubelle,
      prixDistribSavon,
      prixDistribPh,
      prixInstalDistrib,
      totalAnnuelTrilogie,
    };
  });
  return propositions;
};

export const getHygieneFournisseurTarifs = (
  hygiene: HygieneType,
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[],
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[],
  hygieneDistribInstalTarifs?: SelectHygieneInstalDistribTarifsType[]
) => {
  const hygieneDistribTarifsFournisseur = hygieneDistribTarifs.filter(
    (item) => item.fournisseurId === hygiene.infos.fournisseurId
  );
  const ditribInstalTarifFournisseur = hygieneDistribInstalTarifs
    ? hygieneDistribInstalTarifs.find(
        (item) => item.fournisseurId === hygiene.infos.fournisseurId
      )
    : null;
  const consosTarifFournisseur = hygieneConsosTarifs.find(
    (item) => item.fournisseurId === hygiene.infos.fournisseurId
  );
  const prixInstalDistrib =
    ditribInstalTarifFournisseur?.prixInstallation ?? null;
  const paParPersonneEmp = consosTarifFournisseur?.paParPersonneEmp ?? null;
  const paParPersonneSavon = consosTarifFournisseur?.paParPersonneSavon ?? null;
  const paParPersonnePh = consosTarifFournisseur?.paParPersonnePh ?? null;
  const paParPersonneDesinfectant =
    consosTarifFournisseur?.paParPersonneDesinfectant ?? null;
  return {
    hygieneDistribTarifsFournisseur,
    prixInstalDistrib,
    paParPersonneEmp,
    paParPersonneSavon,
    paParPersonnePh,
    paParPersonneDesinfectant,
  };
};
