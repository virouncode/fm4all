import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent } from "react";
import HygieneMobileOptionsBalaiCarousel from "./HygieneMobileOptionsBalaiCarousel";
import HygieneMobileOptionsBalaiInput from "./HygieneMobileOptionsBalaiInput";

type HygieneMobileOptionsBalaiProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  nbDistribBalai: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  propositions: {
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
  }[];
  handleClickProposition: (
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
  ) => void;
  hygieneDistribTarifsFournisseur: {
    id: number;
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
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    oneShot: number | null;
    pa12M: number | null;
    pa24M: number | null;
    pa36M: number | null;
    imageUrl: string | null;
  }[];
};

const HygieneMobileOptionsBalai = ({
  hygieneDistribQuantite,
  nbDistribBalai,
  handleChangeDistribNbr,
  propositions,
  handleClickProposition,
  hygieneDistribTarifsFournisseur,
}: HygieneMobileOptionsBalaiProps) => {
  return (
    <>
      <HygieneMobileOptionsBalaiInput
        nbDistribBalai={nbDistribBalai}
        handleChangeDistribNbr={handleChangeDistribNbr}
        hygieneDistribQuantite={hygieneDistribQuantite}
        hygieneDistribTarifsFournisseur={hygieneDistribTarifsFournisseur}
      />
      <HygieneMobileOptionsBalaiCarousel
        propositions={propositions}
        handleClickProposition={handleClickProposition}
      />
    </>
  );
};

export default HygieneMobileOptionsBalai;
