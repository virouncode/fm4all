import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { ChangeEvent } from "react";
import { HygieneOptionsType } from "../(desktop)/HygieneOptionsPropositions";
import HygieneMobileOptionsPoubelleCarousel from "./HygieneMobileOptionsPoubelleCarousel";
import HygieneMobileOptionsPoubelleInput from "./HygieneMobileOptionsPoubelleInput";

type HygieneMobileOptionsPoubelleProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  nbDistribPoubelle: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: HygieneOptionsType,
  ) => void;
  propositions: {
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
  }[];
  handleClickProposition: (
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
  ) => void;
  hygieneDistribTarifsFournisseur: {
    id: string;
    effectif: string | null;
    createdAt: Date;
    type:
      | "emp"
      | "poubelleEmp"
      | "savon"
      | "ph"
      | "desinfectant"
      | "parfum"
      | "balai"
      | "poubelle";
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;

    anneeCreation: number | null;
    ca: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    entrepriseId: string;
    gamme: "essentiel" | "confort" | "excellence";
    oneShot: number | null;
    pa12M: number | null;
    pa24M: number | null;
    pa36M: number | null;

  }[];
};

const HygieneMobileOptionsPoubelle = ({
  hygieneDistribQuantite,
  nbDistribPoubelle,
  handleChangeDistribNbr,
  propositions,
  handleClickProposition,
  hygieneDistribTarifsFournisseur,
}: HygieneMobileOptionsPoubelleProps) => {
  return (
    <>
      <HygieneMobileOptionsPoubelleInput
        nbDistribPoubelle={nbDistribPoubelle}
        handleChangeDistribNbr={handleChangeDistribNbr}
        hygieneDistribQuantite={hygieneDistribQuantite}
        hygieneDistribTarifsFournisseur={hygieneDistribTarifsFournisseur}
      />
      <HygieneMobileOptionsPoubelleCarousel
        propositions={propositions}
        handleClickProposition={handleClickProposition}
      />
    </>
  );
};

export default HygieneMobileOptionsPoubelle;
