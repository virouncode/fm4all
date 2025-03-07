import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { DureeLocationHygieneType } from "@/zod-schemas/dureeLocation";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { ChangeEvent, useContext } from "react";
import { useMediaQuery } from "react-responsive";
import HygieneDesktopPropositions from "./(desktop)/HygieneDesktopPropositions";
import HygieneMobilePropositions from "./(mobile)/HygieneMobilePropositions";
import {
  getFormattedHygienePropositions,
  getHygieneFournisseurTarifs,
} from "./getFormattedHygienePropositions";

export const MAX_NB_EMP = 100;
export const MAX_NB_SAVON = 100;
export const MAX_NB_PH = 100;

type HygienePropositionsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneDistribInstalTarifs: SelectHygieneInstalDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
};

const HygienePropositions = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneDistribInstalTarifs,
  hygieneConsosTarifs,
}: HygienePropositionsProps) => {
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { client } = useContext(ClientContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);

  //Calcul des propositions : 1 fournisseur 3 gammes.
  const effectif = client.effectif ?? 0;
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

  const propositions = getFormattedHygienePropositions(
    effectif,
    hygiene,
    hygieneDistribQuantite,
    hygieneDistribTarifs,
    hygieneDistribInstalTarifs,
    hygieneConsosTarifs
  );

  const handleClickProposition = (proposition: {
    gamme: "essentiel" | "confort" | "excellence";
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
    imageUrlEmp: string | null;
    imageUrlSavon: string | null;
    imageUrlPh: string | null;
  }) => {
    const {
      gamme,
      prixDistribEmp,
      prixDistribEmpPoubelle,
      prixDistribSavon,
      prixDistribPh,
      prixInstalDistrib,
      totalAnnuelTrilogie,
    } = proposition;

    //Je décoche la proposition
    if (gamme === hygiene.infos.trilogieGammeSelected) {
      setHygiene((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          trilogieGammeSelected: null,
        },
        prix: {
          ...prev.prix,
          prixDistribEmp: null,
          prixDistribEmpPoubelle: null,
          prixDistribSavon: null,
          prixDistribPh: null,
          prixInstalDistrib: null,
          paParPersonneEmp: null,
          paParPersonneSavon: null,
          paParPersonnePh: null,
        },
      }));
      setTotalHygiene((prev) => ({
        ...prev,
        totalTrilogie: null,
        totalDesinfectant: null,
        totalParfum: null,
        totalBalai: null,
        totalPoubelle: null,
        totalInstallation: null,
      }));
      return;
    }
    //Je coche la proposition
    setHygiene((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        trilogieGammeSelected: gamme,
      },
      prix: {
        ...prev.prix,
        prixDistribEmp,
        prixDistribEmpPoubelle,
        prixDistribSavon,
        prixDistribPh,
        prixInstalDistrib,
        paParPersonneEmp,
        paParPersonneSavon,
        paParPersonnePh,
      },
    }));
    //Calculer total hygiene
    const totalTrilogie = totalAnnuelTrilogie;
    //Recupération des options
    const nbDistribDesinfectant = hygiene.quantites.nbDistribDesinfectant;
    const nbDistribParfum = hygiene.quantites.nbDistribParfum;
    const nbDistribBalai = hygiene.quantites.nbDistribBalai;
    const nbDistribPoubelle = hygiene.quantites.nbDistribPoubelle;
    const prixDistribDesinfectant = hygiene.prix.prixDistribDesinfectant;
    const prixDistribParfum = hygiene.prix.prixDistribParfum;
    const prixDistribBalai = hygiene.prix.prixDistribBalai;
    const prixDistribPoubelle = hygiene.prix.prixDistribPoubelle;
    const paParPersonneDesinfectant = hygiene.prix.paParPersonneDesinfectant;

    const totalDesinfectant =
      hygiene.infos.desinfectantGammeSelected &&
      nbDistribDesinfectant !== null &&
      prixDistribDesinfectant !== null &&
      paParPersonneDesinfectant !== null
        ? nbDistribDesinfectant * prixDistribDesinfectant +
          paParPersonneDesinfectant * effectif
        : null;
    const totalParfum =
      hygiene.infos.parfumGammeSelected &&
      nbDistribParfum !== null &&
      prixDistribParfum !== null
        ? nbDistribParfum * prixDistribParfum
        : null;
    const totalBalai =
      hygiene.infos.balaiGammeSelected &&
      nbDistribBalai !== null &&
      prixDistribBalai !== null
        ? nbDistribBalai * prixDistribBalai
        : null;
    const totalPoubelle =
      hygiene.infos.poubelleGammeSelected &&
      nbDistribPoubelle !== null &&
      prixDistribPoubelle !== null
        ? nbDistribPoubelle * prixDistribPoubelle
        : null;
    setTotalHygiene({
      totalTrilogie,
      totalDesinfectant,
      totalParfum,
      totalBalai,
      totalPoubelle,
      totalInstallation: prixInstalDistrib,
    });
  };

  const handleChangeDistribNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const value = e.target.value;

    if (!hygiene.infos.trilogieGammeSelected) {
      //On change juste le nb de distributeurs
      switch (type) {
        case "emp":
          let newNbrEmp = value ? parseInt(value) : 0;
          if (newNbrEmp > MAX_NB_EMP) newNbrEmp = MAX_NB_EMP;
          setHygiene((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbDistribEmp: newNbrEmp,
              nbDistribEmpPoubelle: newNbrEmp,
            },
          }));
          break;
        case "savon":
          let newNbSavon = value ? parseInt(value) : 0;
          if (newNbSavon > MAX_NB_SAVON) newNbSavon = MAX_NB_SAVON;
          setHygiene((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbDistribSavon: newNbSavon,
            },
          }));
          break;
        case "ph":
          let newNbPh = value ? parseInt(value) : 0;
          if (newNbPh > MAX_NB_PH) newNbPh = MAX_NB_PH;
          setHygiene((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbDistribPh: newNbPh,
            },
          }));
          break;
      }
      return;
    }
    //Sinon on reclcule les totaux pour la trilogie avec la nouvelle gamme
    const gamme = hygiene.infos.trilogieGammeSelected;
    const prixDistribEmp =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "emp" && item.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribEmpPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "poubelleEmp" && item.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribSavon =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "savon" && item.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribPh =
      hygieneDistribTarifsFournisseur.find(
        (item) => item.type === "ph" && item.gamme === gamme
      )?.[hygiene.infos.dureeLocation] ?? null;

    let totalEmp: number | null = null;
    let totalSavon: number | null = null;
    let totalPh: number | null = null;
    let totalTrilogie: number | null = null;

    switch (type) {
      case "emp":
        let newNbrEmp = value ? parseInt(value) : 0;
        if (newNbrEmp > MAX_NB_EMP) newNbrEmp = MAX_NB_EMP;

        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribEmp: newNbrEmp,
            nbDistribEmpPoubelle: newNbrEmp,
          },
        }));
        totalEmp =
          prixDistribEmp !== null &&
          paParPersonneEmp !== null &&
          prixDistribEmpPoubelle !== null
            ? newNbrEmp * (prixDistribEmp + prixDistribEmpPoubelle) +
              paParPersonneEmp * effectif
            : null;
        totalSavon =
          prixDistribSavon !== null && paParPersonneSavon !== null
            ? nbDistribSavon * prixDistribSavon + paParPersonneSavon * effectif
            : null;
        totalPh =
          prixDistribPh !== null && paParPersonnePh !== null
            ? nbDistribPh * prixDistribPh + paParPersonnePh * effectif
            : null;
        totalTrilogie =
          totalEmp !== null && totalSavon !== null && totalPh !== null
            ? totalEmp + totalSavon + totalPh
            : null;
        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
      case "savon":
        let newNbSavon = value ? parseInt(value) : 0;
        if (newNbSavon > MAX_NB_SAVON) newNbSavon = MAX_NB_SAVON;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribSavon: newNbSavon,
          },
        }));
        totalEmp =
          prixDistribEmp !== null &&
          paParPersonneEmp !== null &&
          prixDistribEmpPoubelle !== null
            ? nbDistribEmp * (prixDistribEmp + prixDistribEmpPoubelle) +
              paParPersonneEmp * effectif
            : null;
        totalSavon =
          prixDistribSavon !== null && paParPersonneSavon !== null
            ? newNbSavon * prixDistribSavon + paParPersonneSavon * effectif
            : null;
        totalPh =
          prixDistribPh !== null && paParPersonnePh !== null
            ? nbDistribPh * prixDistribPh + paParPersonnePh * effectif
            : null;
        totalTrilogie =
          totalEmp !== null && totalSavon !== null && totalPh !== null
            ? totalEmp + totalSavon + totalPh
            : null;
        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
      case "ph":
        let newNbPh = value ? parseInt(value) : 0;
        if (newNbPh > MAX_NB_PH) newNbPh = MAX_NB_PH;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribPh: newNbPh,
          },
        }));
        totalEmp =
          prixDistribEmp !== null &&
          paParPersonneEmp !== null &&
          prixDistribEmpPoubelle !== null
            ? nbDistribEmp * (prixDistribEmp + prixDistribEmpPoubelle) +
              paParPersonneEmp * effectif
            : null;
        totalSavon =
          prixDistribSavon !== null && paParPersonneSavon !== null
            ? nbDistribSavon * prixDistribSavon + paParPersonneSavon * effectif
            : null;
        totalPh =
          prixDistribPh !== null && paParPersonnePh !== null
            ? newNbPh * prixDistribPh + paParPersonnePh * effectif
            : null;
        totalTrilogie =
          totalEmp !== null && totalSavon !== null && totalPh !== null
            ? totalEmp + totalSavon + totalPh
            : null;
        if (hygiene.infos.trilogieGammeSelected) {
          setTotalHygiene((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        break;
    }
  };

  const handleChangeDureeLocation = (value: DureeLocationHygieneType) => {
    const prixDistribEmp =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "emp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[value] ?? null;
    const prixDistribEmpPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "poubelleEmp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[value] ?? null;
    const prixDistribSavon =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "savon" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[value] ?? null;
    const prixDistribPh =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "ph" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected
      )?.[value] ?? null;
    const prixDistribDesinfectant =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "desinfectant" &&
          tarif.gamme === hygiene.infos.desinfectantGammeSelected
      )?.[value] ?? null;
    const prixDistribParfum =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "parfum" &&
          tarif.gamme === hygiene.infos.parfumGammeSelected
      )?.[value] ?? null;
    const prixDistribBalai =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "balai" &&
          tarif.gamme === hygiene.infos.balaiGammeSelected
      )?.[value] ?? null;
    const prixDistribPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "poubelle" &&
          tarif.gamme === hygiene.infos.poubelleGammeSelected
      )?.[value] ?? null;

    const nbDistribDesinfectant = hygiene.quantites.nbDistribDesinfectant;
    const nbDistribParfum = hygiene.quantites.nbDistribParfum;
    const nbDistribBalai = hygiene.quantites.nbDistribBalai;
    const nbDistribPoubelle = hygiene.quantites.nbDistribPoubelle;
    const paParPersonneDesinfectant = hygiene.prix.paParPersonneDesinfectant;

    const totalEmp =
      prixDistribEmp !== null &&
      paParPersonneEmp !== null &&
      prixDistribEmpPoubelle !== null
        ? nbDistribEmp * (prixDistribEmp + prixDistribEmpPoubelle) +
          paParPersonneEmp * effectif
        : null;
    const totalSavon =
      prixDistribSavon !== null && paParPersonneSavon !== null
        ? nbDistribSavon * prixDistribSavon + paParPersonneSavon * effectif
        : null;
    const totalPh =
      prixDistribPh !== null && paParPersonnePh !== null
        ? nbDistribPh * prixDistribPh + paParPersonnePh * effectif
        : null;

    const totalTrilogie =
      hygiene.infos.trilogieGammeSelected &&
      totalEmp !== null &&
      totalSavon !== null &&
      totalPh !== null
        ? totalEmp + totalSavon + totalPh
        : null;
    const totalDesinfectant =
      hygiene.infos.desinfectantGammeSelected &&
      nbDistribDesinfectant !== null &&
      prixDistribDesinfectant !== null &&
      paParPersonneDesinfectant !== null
        ? nbDistribDesinfectant * prixDistribDesinfectant +
          effectif * paParPersonneDesinfectant
        : null;

    const totalParfum =
      hygiene.infos.parfumGammeSelected &&
      nbDistribParfum !== null &&
      prixDistribParfum !== null
        ? nbDistribParfum * prixDistribParfum
        : null;
    const totalBalai =
      hygiene.infos.balaiGammeSelected &&
      nbDistribBalai !== null &&
      prixDistribBalai !== null
        ? nbDistribBalai * prixDistribBalai
        : null;
    const totalPoubelle =
      hygiene.infos.poubelleGammeSelected &&
      nbDistribPoubelle !== null &&
      prixDistribPoubelle !== null
        ? nbDistribPoubelle * prixDistribPoubelle
        : null;
    setHygiene((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        dureeLocation: value,
      },
      prix: {
        ...prev.prix,
        prixDistribEmp,
        prixDistribEmpPoubelle,
        prixDistribSavon,
        prixDistribPh,
        prixDistribDesinfectant,
        prixDistribParfum,
        prixDistribBalai,
        prixDistribPoubelle,
      },
    }));
    if (hygiene.infos.trilogieGammeSelected) {
      setTotalHygiene((prev) => ({
        ...prev,
        totalTrilogie,
        totalDesinfectant,
        totalParfum,
        totalBalai,
        totalPoubelle,
      }));
    }
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <HygieneMobilePropositions
      hygieneDistribQuantite={hygieneDistribQuantite}
      hygieneDistribTarifs={hygieneDistribTarifs}
      handleChangeDistribNbr={handleChangeDistribNbr}
      handleChangeDureeLocation={handleChangeDureeLocation}
      nbDistribEmp={nbDistribEmp}
      nbDistribSavon={nbDistribSavon}
      nbDistribPh={nbDistribPh}
      dureeLocation={dureeLocation}
      prixInstalDistrib={prixInstalDistrib}
      propositions={propositions}
      handleClickProposition={handleClickProposition}
    />
  ) : (
    <HygieneDesktopPropositions
      hygieneDistribQuantite={hygieneDistribQuantite}
      hygieneDistribTarifs={hygieneDistribTarifs}
      handleChangeDistribNbr={handleChangeDistribNbr}
      handleChangeDureeLocation={handleChangeDureeLocation}
      nbDistribEmp={nbDistribEmp}
      nbDistribSavon={nbDistribSavon}
      nbDistribPh={nbDistribPh}
      dureeLocation={dureeLocation}
      prixInstalDistrib={prixInstalDistrib}
      propositions={propositions}
      handleClickProposition={handleClickProposition}
    />
  );
};

export default HygienePropositions;
