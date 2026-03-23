import { gammes } from "@/zod-schemas/gamme.schema";
import { HygieneType } from "@/zod-schemas/hygiene.schema";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs.schema";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs.schema";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs.schema";
import { SelectHygieneMinFacturationType } from "@/zod-schemas/hygieneMinFacturation.schema";

export const getFormattedHygienePropositions = (
  effectif: number,
  hygiene: HygieneType,
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType,
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[],
  hygieneDistribInstalTarifs: SelectHygieneInstalDistribTarifsType[],
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[],
  hygieneMinFacturation: SelectHygieneMinFacturationType[],
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
    hygieneMinFacturationFournisseur,
    prixInstalDistrib,
    paParPersonneEmp,
    paParPersonneSavon,
    paParPersonnePh,
  } = getHygieneFournisseurTarifs(
    hygiene,
    hygieneDistribTarifs,
    hygieneConsosTarifs,
    hygieneDistribInstalTarifs,
    hygieneMinFacturation,
  );

  const propositions = gammes.map((gamme) => {
    const prixDistribEmp =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "emp" && tarif.gamme === gamme,
      )?.[dureeLocation] ?? null;

    const prixDistribEmpPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "poubelleEmp" && tarif.gamme === gamme,
      )?.[dureeLocation] ?? null;

    const prixDistribSavon =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "savon" && tarif.gamme === gamme,
      )?.[dureeLocation] ?? null;

    const prixDistribPh =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "ph" && tarif.gamme === gamme,
      )?.[dureeLocation] ?? null;

    const imageStorageKeyEmp =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "emp" && tarif.gamme === gamme,
      )?.imageStorageKey ?? null;
    const imageStorageKeySavon =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "savon" && tarif.gamme === gamme,
      )?.imageStorageKey ?? null;
    const imageStorageKeyPh =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "ph" && tarif.gamme === gamme,
      )?.imageStorageKey ?? null;

    const nomPrestataire = hygieneDistribTarifsFournisseur[0].nomPrestataire;
    const sloganPrestataire = hygieneDistribTarifsFournisseur[0].slogan;
    const logoStorageKey = hygieneDistribTarifsFournisseur[0].logoStorageKey;
    const anneeCreation = hygieneDistribTarifsFournisseur[0].anneeCreation;
    const ca = hygieneDistribTarifsFournisseur[0].ca;
    const effectifPrestataire = hygieneDistribTarifsFournisseur[0].effectifPrestataire;
    const nbClients = hygieneDistribTarifsFournisseur[0].nbClients;
    const noteGoogle = hygieneDistribTarifsFournisseur[0].noteGoogle;
    const nbAvis = hygieneDistribTarifsFournisseur[0].nbAvis;
    const minFacturation =
      hygieneMinFacturationFournisseur?.minFacturation ?? null;

    const totalEmp =
      nbDistribEmp && prixDistribEmp !== null && paParPersonneEmp !== null
        ? nbDistribEmp * prixDistribEmp + paParPersonneEmp * effectif
        : 0;

    const totalPoubelleEmp =
      nbDistribEmp && nbDistribEmpPoubelle && prixDistribEmpPoubelle !== null
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
      totalEmp === null &&
      totalPoubelleEmp === null &&
      totalSavon === null &&
      totalPh === null
        ? null
        : Math.max(
            (totalEmp ?? 0) +
              (totalPoubelleEmp ?? 0) +
              (totalSavon ?? 0) +
              (totalPh ?? 0),
            minFacturation ?? 0,
          );

    return {
      gamme,
      nomPrestataire,
      sloganPrestataire,
      logoStorageKey,
      anneeCreation,
      ca,
      effectifPrestataire,
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
      minFacturation,
      imageStorageKeyEmp,
      imageStorageKeySavon,
      imageStorageKeyPh,
    };
  });
  return propositions;
};

export const getHygieneFournisseurTarifs = (
  hygiene: HygieneType,
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[],
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[],
  hygieneDistribInstalTarifs?: SelectHygieneInstalDistribTarifsType[],
  hygieneMinFacturation?: SelectHygieneMinFacturationType[],
) => {
  const hygieneDistribTarifsFournisseur = hygieneDistribTarifs.filter(
    (item) => item.entrepriseId === hygiene.infos.entrepriseId,
  );
  const ditribInstalTarifFournisseur =
    hygieneDistribInstalTarifs?.find(
      (item) => item.entrepriseId === hygiene.infos.entrepriseId,
    ) ?? null;
  const consosTarifFournisseur = hygieneConsosTarifs.find(
    (item) => item.entrepriseId === hygiene.infos.entrepriseId,
  );
  const hygieneMinFacturationFournisseur =
    hygieneMinFacturation?.find(
      (item) => item.entrepriseId === hygiene.infos.entrepriseId,
    ) ?? null;
  const prixInstalDistrib =
    ditribInstalTarifFournisseur?.prixInstallation ?? null;
  const paParPersonneEmp = consosTarifFournisseur?.paParPersonneEmp ?? null;
  const paParPersonneSavon = consosTarifFournisseur?.paParPersonneSavon ?? null;
  const paParPersonnePh = consosTarifFournisseur?.paParPersonnePh ?? null;
  const paParPersonneDesinfectant =
    consosTarifFournisseur?.paParPersonneDesinfectant ?? null;
  return {
    hygieneDistribTarifsFournisseur,
    hygieneMinFacturationFournisseur,
    prixInstalDistrib,
    paParPersonneEmp,
    paParPersonneSavon,
    paParPersonnePh,
    paParPersonneDesinfectant,
  };
};
