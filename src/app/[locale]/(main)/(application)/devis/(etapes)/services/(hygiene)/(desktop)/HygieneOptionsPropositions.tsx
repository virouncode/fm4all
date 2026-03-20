import { MAX_NB_DISTRIB } from "@/constants/constants";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { gammes } from "@/zod-schemas/gamme.schema";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs.schema";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs.schema";
import { ChangeEvent } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import HygieneMobileOptionsPropositions from "../(mobile)/HygieneMobileOptionsPropositions";
import { getHygieneFournisseurTarifs } from "../getFormattedHygienePropositions";
import HygieneDesktopOptionsPropositions from "./HygieneDesktopOptionsPropositions";

export type HygieneOptionsType =
  | "desinfectant"
  | "parfum"
  | "balai"
  | "poubelle";

type HygieneOptionsPropositionsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
};

const HygieneOptionsPropositions = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneConsosTarifs,
}: HygieneOptionsPropositionsProps) => {
  const { hygiene, setHygiene } = useHygieneStore(
    useShallow((s) => ({
      hygiene: s.hygiene,
      setHygiene: s.setHygiene,
    })),
  );
  const prospect = useProspectStore((s) => s.prospect);
  //Formatter les propositions d'options en hygiene
  const nbDistribDesinfectant =
    hygiene.quantites.nbDistribDesinfectant ??
    hygieneDistribQuantite.nbDistribDesinfectant;
  const nbDistribParfum =
    hygiene.quantites.nbDistribParfum ?? hygieneDistribQuantite.nbDistribParfum;
  const nbDistribBalai =
    hygiene.quantites.nbDistribBalai ?? hygieneDistribQuantite.nbDistribBalai;
  const nbDistribPoubelle =
    hygiene.quantites.nbDistribPoubelle ??
    hygieneDistribQuantite.nbDistribPoubelle;
  const dureeLocation = hygiene.infos.dureeLocation;
  const { hygieneDistribTarifsFournisseur, paParPersonneDesinfectant } =
    getHygieneFournisseurTarifs(
      hygiene,
      hygieneDistribTarifs,
      hygieneConsosTarifs,
    );

  const propositions = gammes.map((gamme) => {
    //la gamme suffit pour identifier la proposition car il n'y a qu'un fournisseur
    const prixDistribDesinfectant =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "desinfectant" && tarif.gamme === gamme,
      )?.[dureeLocation] ?? null;
    const prixDistribParfum =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "parfum" && tarif.gamme === gamme,
      )?.[dureeLocation] ?? null;
    const prixDistribBalai =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "balai" && tarif.gamme === gamme,
      )?.[dureeLocation] ?? null;
    const prixDistribPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "poubelle" && tarif.gamme === gamme,
      )?.[dureeLocation] ?? null;

    const imageUrlDesinfectant = null;
    const imageUrlParfum = null;
    const imageUrlBalai = null;
    const imageUrlPoubelle = null;

    const totalDesinfectant =
      paParPersonneDesinfectant !== null &&
      prixDistribDesinfectant !== null &&
      nbDistribDesinfectant
        ? nbDistribDesinfectant * prixDistribDesinfectant +
          paParPersonneDesinfectant * (prospect.effectif ?? 0)
        : null;
    const totalParfum =
      prixDistribParfum !== null && nbDistribParfum
        ? nbDistribParfum * prixDistribParfum
        : null;
    const totalBalai =
      prixDistribBalai !== null && nbDistribBalai
        ? nbDistribBalai * prixDistribBalai
        : null;
    const totalPoubelle =
      prixDistribPoubelle !== null && nbDistribPoubelle
        ? nbDistribPoubelle * prixDistribPoubelle
        : null;

    const nomPrestataire = hygieneDistribTarifsFournisseur[0].nomPrestataire;
    const sloganPrestataire = hygieneDistribTarifsFournisseur[0].slogan;
    const anneeCreation = hygieneDistribTarifsFournisseur[0].anneeCreation;
    const logoStorageKey = hygieneDistribTarifsFournisseur[0].logoStorageKey;
    const ca = hygieneDistribTarifsFournisseur[0].ca;
    const effectifFournisseur = hygieneDistribTarifsFournisseur[0].effectif;
    const nbClients = hygieneDistribTarifsFournisseur[0].nbClients;
    const noteGoogle = hygieneDistribTarifsFournisseur[0].noteGoogle;
    const nbAvis = hygieneDistribTarifsFournisseur[0].nbAvis;
    return {
      nomPrestataire,
      sloganPrestataire,
      anneeCreation,
      logoStorageKey,
      ca,
      effectifFournisseur,
      nbClients,
      noteGoogle,
      nbAvis,
      gamme,
      prixDistribDesinfectant,
      prixDistribParfum,
      prixDistribBalai,
      prixDistribPoubelle,
      paParPersonneDesinfectant,
      totalDesinfectant,
      totalParfum,
      totalBalai,
      totalPoubelle,
      imageUrlDesinfectant,
      imageUrlParfum,
      imageUrlBalai,
      imageUrlPoubelle,
    };
  });

  const handleClickProposition = (
    type: HygieneOptionsType,
    proposition: {
      nomPrestataire: string;
      sloganPrestataire: string | null;
      anneeCreation: number | null;
      logoStorageKey: string | null;
      ca: string | null;
      effectifFournisseur: string | null;
      nbClients: number | null;
      noteGoogle: string | null;
      nbAvis: number | null;
      gamme: "essentiel" | "confort" | "excellence";
      prixDistribDesinfectant: number | null;
      prixDistribParfum: number | null;
      prixDistribBalai: number | null;
      prixDistribPoubelle: number | null;
      paParPersonneDesinfectant: number | null;
      totalDesinfectant: number | null;
      totalParfum: number | null;
      totalBalai: number | null;
      totalPoubelle: number | null;
      imageUrlDesinfectant: string | null;
      imageUrlParfum: string | null;
      imageUrlBalai: string | null;
      imageUrlPoubelle: string | null;
    },
  ) => {
    const {
      gamme,
      prixDistribDesinfectant,
      prixDistribParfum,
      prixDistribBalai,
      prixDistribPoubelle,
      paParPersonneDesinfectant,
      totalDesinfectant,
      totalParfum,
      totalBalai,
      totalPoubelle,
    } = proposition;
    switch (type) {
      case "desinfectant":
        if (hygiene.infos.desinfectantGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            infos: { ...prev.infos, desinfectantGammeSelected: null },
            prix: {
              ...prev.prix,
              prixDistribDesinfectant: null,
              paParPersonneDesinfectant: null,
            },
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            desinfectantGammeSelected: gamme,
          },
          prix: {
            ...prev.prix,
            prixDistribDesinfectant,
            paParPersonneDesinfectant,
          },
        }));
        return;
      case "parfum":
        if (hygiene.infos.parfumGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            infos: { ...prev.infos, parfumGammeSelected: null },
            prix: {
              ...prev.prix,
              prixDistribParfum: null,
            },
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          infos: {
            ...prev.infos,
            parfumGammeSelected: gamme,
          },
          prix: {
            ...prev.prix,
            prixDistribParfum,
          },
        }));
        return;
      case "balai":
        if (hygiene.infos.balaiGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            infos: { ...prev.infos, balaiGammeSelected: null },
            prix: {
              ...prev.prix,
              prixDistribBalai: null,
            },
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          infos: { ...prev.infos, balaiGammeSelected: gamme },
          prix: {
            ...prev.prix,
            prixDistribBalai,
          },
        }));
        return;
      case "poubelle":
        if (hygiene.infos.poubelleGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            infos: { ...prev.infos, poubelleGammeSelected: null },
            prix: {
              ...prev.prix,
              prixDistribPoubelle: null,
            },
          }));
          return;
        }
        setHygiene((prev) => ({
          ...prev,
          infos: { ...prev.infos, poubelleGammeSelected: gamme },
          prix: {
            ...prev.prix,
            prixDistribPoubelle,
          },
        }));
        return;
    }
  };

  const handleChangeDistribNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: HygieneOptionsType,
  ) => {
    const value = e.target.value;
    switch (type) {
      case "desinfectant":
        let newNbDistribDesinfectant = value ? parseInt(value) : 0;
        if (newNbDistribDesinfectant > MAX_NB_DISTRIB)
          newNbDistribDesinfectant = MAX_NB_DISTRIB;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribDesinfectant: newNbDistribDesinfectant,
          },
        }));
        return;
      case "parfum":
        let newNbDistribParfum = value ? parseInt(value) : 0;
        if (newNbDistribParfum > MAX_NB_DISTRIB)
          newNbDistribParfum = MAX_NB_DISTRIB;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribParfum: newNbDistribParfum,
          },
        }));
        return;

      case "balai":
        let newNbDistribBalai = value ? parseInt(value) : 0;
        if (newNbDistribBalai > MAX_NB_DISTRIB)
          newNbDistribBalai = MAX_NB_DISTRIB;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribBalai: newNbDistribBalai,
          },
        }));
        return;

      case "poubelle":
        let newNbDistribPoubelle = value ? parseInt(value) : 0;
        if (newNbDistribPoubelle > MAX_NB_DISTRIB)
          newNbDistribPoubelle = MAX_NB_DISTRIB;
        setHygiene((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbDistribPoubelle: newNbDistribPoubelle,
          },
        }));
        return;
    }
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <HygieneMobileOptionsPropositions
      hygieneDistribQuantite={hygieneDistribQuantite}
      nbDistribDesinfectant={nbDistribDesinfectant}
      nbDistribParfum={nbDistribParfum}
      nbDistribBalai={nbDistribBalai}
      nbDistribPoubelle={nbDistribPoubelle}
      handleChangeDistribNbr={handleChangeDistribNbr}
      propositions={propositions}
      handleClickProposition={handleClickProposition}
    />
  ) : (
    <HygieneDesktopOptionsPropositions
      hygieneDistribQuantite={hygieneDistribQuantite}
      nbDistribDesinfectant={nbDistribDesinfectant}
      nbDistribParfum={nbDistribParfum}
      nbDistribBalai={nbDistribBalai}
      nbDistribPoubelle={nbDistribPoubelle}
      handleChangeDistribNbr={handleChangeDistribNbr}
      propositions={propositions}
      handleClickProposition={handleClickProposition}
    />
  );
};

export default HygieneOptionsPropositions;
