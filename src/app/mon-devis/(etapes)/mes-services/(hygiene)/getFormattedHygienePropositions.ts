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
    hygiene.quantites.nbDistribEmp ?? hygieneDistribQuantite.nbDistribEmp;
  const nbDistribEmpPoubelle = nbDistribEmp;
  const nbDistribSavon =
    hygiene.quantites.nbDistribSavon ?? hygieneDistribQuantite.nbDistribSavon;
  const nbDistribPh =
    hygiene.quantites.nbDistribPh ?? hygieneDistribQuantite.nbDistribPh;
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

    const imageUrlEmp =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "emp" && tarif.gamme === gamme
      )?.imageUrl ?? null;

    const imageUrlSavon =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "savon" && tarif.gamme === gamme
      )?.imageUrl ?? null;

    const imageUrlPh =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "ph" && tarif.gamme === gamme
      )?.imageUrl ?? null;

    const nomFournisseur = hygieneDistribTarifsFournisseur[0].nomFournisseur;
    const sloganFournisseur = hygieneDistribTarifsFournisseur[0].slogan;
    const logoUrl = hygieneDistribTarifsFournisseur[0].logoUrl;
    const locationUrl = hygieneDistribTarifsFournisseur[0].locationUrl;
    const anneeCreation = hygieneDistribTarifsFournisseur[0].anneeCreation;
    const ca = hygieneDistribTarifsFournisseur[0].ca;
    const effectifFournisseur = hygieneDistribTarifsFournisseur[0].effectif;
    const nbClients = hygieneDistribTarifsFournisseur[0].nbClients;
    const noteGoogle = hygieneDistribTarifsFournisseur[0].noteGoogle;
    const nbAvis = hygieneDistribTarifsFournisseur[0].nbAvis;

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

    const totalAnnuelTrilogie =
      totalEmp + totalPoubellEmp + totalSavon + totalPh || null;

    return {
      gamme,
      nomFournisseur,
      sloganFournisseur,
      logoUrl,
      locationUrl,
      anneeCreation,
      ca,
      effectifFournisseur,
      nbClients,
      noteGoogle,
      nbAvis,
      nbDistribEmp,
      nbDistribSavon,
      nbDistribPh,
      prixDistribEmp,
      prixDistribEmpPoubelle,
      prixDistribSavon,
      prixDistribPh,
      prixInstalDistrib,
      totalAnnuelTrilogie,
      imageUrlEmp,
      imageUrlSavon,
      imageUrlPh,
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
