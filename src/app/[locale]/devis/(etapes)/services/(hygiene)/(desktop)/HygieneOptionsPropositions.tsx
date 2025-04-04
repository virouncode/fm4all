import { ClientContext } from "@/context/ClientProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { gammes } from "@/zod-schemas/gamme";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { ChangeEvent, useContext } from "react";
import { useMediaQuery } from "react-responsive";
import HygieneMobileOptionsPropositions from "../(mobile)/HygieneMobileOptionsPropositions";
import { getHygieneFournisseurTarifs } from "../getFormattedHygienePropositions";
import HygieneDesktopOptionsPropositions from "./HygieneDesktopOptionsPropositions";
import { MAX_NB_DISTRIB } from "@/constants/constants";

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
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { client } = useContext(ClientContext);
  const { setTotalHygiene } = useContext(TotalHygieneContext);
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
      hygieneConsosTarifs
    );

  const propositions = gammes.map((gamme) => {
    //la gamme suffit pour identifier la proposition car il n'y a qu'un fournisseur
    const prixDistribDesinfectant =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "desinfectant" && tarif.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribParfum =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "parfum" && tarif.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribBalai =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "balai" && tarif.gamme === gamme
      )?.[dureeLocation] ?? null;
    const prixDistribPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "poubelle" && tarif.gamme === gamme
      )?.[dureeLocation] ?? null;

    const imageUrlDesinfectant =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "desinfectant" && tarif.gamme === gamme
      )?.imageUrl ?? null;
    const imageUrlParfum =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "parfum" && tarif.gamme === gamme
      )?.imageUrl ?? null;
    const imageUrlBalai =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "balai" && tarif.gamme === gamme
      )?.imageUrl ?? null;
    const imageUrlPoubelle =
      hygieneDistribTarifsFournisseur.find(
        (tarif) => tarif.type === "poubelle" && tarif.gamme === gamme
      )?.imageUrl ?? null;

    const totalDesinfectant =
      paParPersonneDesinfectant !== null &&
      prixDistribDesinfectant !== null &&
      nbDistribDesinfectant
        ? nbDistribDesinfectant * prixDistribDesinfectant +
          paParPersonneDesinfectant * (client.effectif ?? 0)
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

    const nomFournisseur = hygieneDistribTarifsFournisseur[0].nomFournisseur;
    const sloganFournisseur = hygieneDistribTarifsFournisseur[0].slogan;
    const anneeCreation = hygieneDistribTarifsFournisseur[0].anneeCreation;
    const logoUrl = hygieneDistribTarifsFournisseur[0].logoUrl;
    const ca = hygieneDistribTarifsFournisseur[0].ca;
    const effectifFournisseur = hygieneDistribTarifsFournisseur[0].effectif;
    const nbClients = hygieneDistribTarifsFournisseur[0].nbClients;
    const noteGoogle = hygieneDistribTarifsFournisseur[0].noteGoogle;
    const nbAvis = hygieneDistribTarifsFournisseur[0].nbAvis;
    const locationUrl = hygieneDistribTarifsFournisseur[0].locationUrl;

    return {
      nomFournisseur,
      sloganFournisseur,
      anneeCreation,
      logoUrl,
      ca,
      effectifFournisseur,
      nbClients,
      noteGoogle,
      nbAvis,
      locationUrl,
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
    type: string,
    proposition: {
      nomFournisseur: string;
      sloganFournisseur: string | null;
      anneeCreation: number | null;
      logoUrl: string | null;
      ca: string | null;
      effectifFournisseur: string | null;
      nbClients: number | null;
      noteGoogle: string | null;
      nbAvis: number | null;
      locationUrl: string | null;
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
    }
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
          setTotalHygiene((prev) => ({
            ...prev,
            totalDesinfectant: null,
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
        setTotalHygiene((prev) => ({
          ...prev,
          totalDesinfectant,
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
          setTotalHygiene((prev) => ({
            ...prev,
            totalParfum: null,
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
        setTotalHygiene((prev) => ({
          ...prev,
          totalParfum,
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
          setTotalHygiene((prev) => ({
            ...prev,
            totalBalai: null,
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
        setTotalHygiene((prev) => ({
          ...prev,
          totalBalai,
        }));
        return;
      case "poubelle":
        if (hygiene.infos.poubelleGammeSelected === gamme) {
          setHygiene((prev) => ({
            ...prev,
            infos: { ...prev.infos, poubelleGammeSelected: null },
          }));
          setTotalHygiene((prev) => ({
            ...prev,
            totalPoubelle: null,
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
        setTotalHygiene((prev) => ({
          ...prev,
          totalPoubelle: totalPoubelle,
        }));
        return;
    }
  };

  const handleChangeDistribNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: string
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
        if (hygiene.infos.desinfectantGammeSelected) {
          const prixDistribDesinfectant =
            hygieneDistribTarifsFournisseur.find(
              (tarif) =>
                tarif.type === "desinfectant" &&
                tarif.gamme === hygiene.infos.desinfectantGammeSelected
            )?.[dureeLocation] ?? null;

          const totalDesinfectant =
            newNbDistribDesinfectant &&
            prixDistribDesinfectant !== null &&
            paParPersonneDesinfectant !== null &&
            newNbDistribDesinfectant
              ? newNbDistribDesinfectant * prixDistribDesinfectant +
                paParPersonneDesinfectant * (client.effectif ?? 0)
              : null;
          setTotalHygiene((prev) => ({
            ...prev,
            totalDesinfectant,
          }));
        }
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
        if (hygiene.infos.parfumGammeSelected) {
          const prixDistribParfum =
            hygieneDistribTarifsFournisseur.find(
              (tarif) =>
                tarif.type === "parfum" &&
                tarif.gamme === hygiene.infos.parfumGammeSelected
            )?.[dureeLocation] ?? null;

          const totalParfum =
            newNbDistribParfum && prixDistribParfum !== null
              ? newNbDistribParfum * prixDistribParfum
              : null;
          setTotalHygiene((prev) => ({
            ...prev,
            totalParfum,
          }));
        }
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
        if (hygiene.infos.balaiGammeSelected) {
          const prixDistribBalai =
            hygieneDistribTarifsFournisseur.find(
              (tarif) =>
                tarif.type === "balai" &&
                tarif.gamme === hygiene.infos.balaiGammeSelected
            )?.[dureeLocation] ?? null;

          const totalBalai =
            newNbDistribBalai && prixDistribBalai !== null
              ? newNbDistribBalai * prixDistribBalai
              : null;
          setTotalHygiene((prev) => ({
            ...prev,
            totalBalai,
          }));
        }
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
        if (hygiene.infos.poubelleGammeSelected) {
          const prixDistribPoubelle =
            hygieneDistribTarifsFournisseur.find(
              (tarif) =>
                tarif.type === "poubelle" &&
                tarif.gamme === hygiene.infos.poubelleGammeSelected
            )?.[dureeLocation] ?? null;

          const totalPoubelle =
            newNbDistribPoubelle && prixDistribPoubelle !== null
              ? newNbDistribPoubelle * prixDistribPoubelle
              : null;
          setTotalHygiene((prev) => ({
            ...prev,
            totalPoubelle,
          }));
        }
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
      hygieneDistribTarifsFournisseur={hygieneDistribTarifsFournisseur}
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
