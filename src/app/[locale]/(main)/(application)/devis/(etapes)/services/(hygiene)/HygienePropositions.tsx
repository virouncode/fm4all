import { MAX_NB_EMP, MAX_NB_PH, MAX_NB_SAVON } from "@/constants/constants";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { DureeLocationHygieneType } from "@/zod-schemas/dureeLocation.schema";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs.schema";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs.schema";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs.schema";
import { SelectHygieneMinFacturationType } from "@/zod-schemas/hygieneMinFacturation.schema";
import { ChangeEvent } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import HygieneDesktopPropositions from "./(desktop)/HygieneDesktopPropositions";
import HygieneMobilePropositions from "./(mobile)/HygieneMobilePropositions";
import {
  getFormattedHygienePropositions,
  getHygieneFournisseurTarifs,
} from "./getFormattedHygienePropositions";

type HygienePropositionsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneDistribInstalTarifs: SelectHygieneInstalDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
  hygieneMinFacturation: SelectHygieneMinFacturationType[];
};

const HygienePropositions = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneDistribInstalTarifs,
  hygieneConsosTarifs,
  hygieneMinFacturation,
}: HygienePropositionsProps) => {
  const { hygiene, setHygiene } = useHygieneStore(
    useShallow((s) => ({
      hygiene: s.hygiene,
      setHygiene: s.setHygiene,
    })),
  );
  const prospect = useProspectStore((s) => s.prospect);

  //Calcul des propositions : 1 fournisseur 3 gammes.
  const effectif = prospect.effectif ?? 0;
  const nbDistribEmp =
    hygiene.quantites.nbDistribEmp ?? hygieneDistribQuantite.nbDistribEmp;
  // const nbDistribEmpPoubelle = nbDistribEmp;
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
    hygieneDistribInstalTarifs,
    hygieneMinFacturation,
  );

  const propositions = getFormattedHygienePropositions(
    effectif,
    hygiene,
    hygieneDistribQuantite,
    hygieneDistribTarifs,
    hygieneDistribInstalTarifs,
    hygieneConsosTarifs,
    hygieneMinFacturation,
  );

  const handleClickProposition = (proposition: {
    gamme: "essentiel" | "confort" | "excellence";
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;

    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
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
    minFacturation: number | null;
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
      minFacturation,
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
          minFacturation: null,
        },
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
        minFacturation,
      },
    }));
  };

  const handleChangeDistribNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    const value = e.target.value;
    const paParPersonneEmp = hygiene.prix.paParPersonneEmp;
    const paParPersonneSavon = hygiene.prix.paParPersonneSavon;
    const paParPersonnePh = hygiene.prix.paParPersonnePh;

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
  };

  const handleIncrement = (type: "emp" | "savon" | "ph") => {
    switch (type) {
      case "emp":
        let newNbrEmp = nbDistribEmp + 1;
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
        let newNbSavon = nbDistribSavon + 1;
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
        let newNbPh = nbDistribPh + 1;
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
  };

  const handleDecrement = (type: "emp" | "savon" | "ph") => {
    switch (type) {
      case "emp":
        let newNbrEmp = nbDistribEmp - 1;
        if (newNbrEmp < 0) newNbrEmp = 0;
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
        let newNbSavon = nbDistribSavon - 1;
        if (newNbSavon < 0) newNbSavon = 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribSavon: newNbSavon,
          },
        }));
        break;
      case "ph":
        let newNbPh = nbDistribPh - 1;
        if (newNbPh < 0) newNbPh = 0;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribPh: newNbPh,
          },
        }));
        break;
    }
  };

  const handleChangeDureeLocation = (value: DureeLocationHygieneType) => {
    const prixDistribEmp =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "emp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected,
      )?.[value] ?? null;
    const prixDistribEmpPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "poubelleEmp" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected,
      )?.[value] ?? null;
    const prixDistribSavon =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "savon" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected,
      )?.[value] ?? null;
    const prixDistribPh =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "ph" &&
          tarif.gamme === hygiene.infos.trilogieGammeSelected,
      )?.[value] ?? null;
    const prixDistribDesinfectant =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "desinfectant" &&
          tarif.gamme === hygiene.infos.desinfectantGammeSelected,
      )?.[value] ?? null;
    const prixDistribParfum =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "parfum" &&
          tarif.gamme === hygiene.infos.parfumGammeSelected,
      )?.[value] ?? null;
    const prixDistribBalai =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "balai" &&
          tarif.gamme === hygiene.infos.balaiGammeSelected,
      )?.[value] ?? null;
    const prixDistribPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (tarif) =>
          tarif.type === "poubelle" &&
          tarif.gamme === hygiene.infos.poubelleGammeSelected,
      )?.[value] ?? null;

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
      handleIncrement={handleIncrement}
      handleDecrement={handleDecrement}
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
