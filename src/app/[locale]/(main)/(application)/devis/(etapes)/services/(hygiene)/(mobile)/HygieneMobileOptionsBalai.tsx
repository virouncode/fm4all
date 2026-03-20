import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { ChangeEvent } from "react";
import { HygieneOptionsType } from "../(desktop)/HygieneOptionsPropositions";
import HygieneMobileOptionsBalaiCarousel from "./HygieneMobileOptionsBalaiCarousel";
import HygieneMobileOptionsBalaiInput from "./HygieneMobileOptionsBalaiInput";

type HygieneMobileOptionsBalaiProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  nbDistribBalai: number;
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
};

const HygieneMobileOptionsBalai = ({
  hygieneDistribQuantite,
  nbDistribBalai,
  handleChangeDistribNbr,
  propositions,
  handleClickProposition,
}: HygieneMobileOptionsBalaiProps) => {
  return (
    <>
      <HygieneMobileOptionsBalaiInput
        nbDistribBalai={nbDistribBalai}
        handleChangeDistribNbr={handleChangeDistribNbr}
        hygieneDistribQuantite={hygieneDistribQuantite}
      />
      <HygieneMobileOptionsBalaiCarousel
        propositions={propositions}
        handleClickProposition={handleClickProposition}
      />
    </>
  );
};

export default HygieneMobileOptionsBalai;
