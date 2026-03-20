import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { ChangeEvent } from "react";
import { HygieneOptionsType } from "../(desktop)/HygieneOptionsPropositions";
import HygieneMobileOptionsDesinfectantCarousel from "./HygieneMobileOptionsDesinfectantCarousel";
import HygieneMobileOptionsDesinfectantInput from "./HygieneMobileOptionsDesinfectantInput";

type HygieneMobileOptionsDesinfectantProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  nbDistribDesinfectant: number;
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

const HygieneMobileOptionsDesinfectant = ({
  hygieneDistribQuantite,
  nbDistribDesinfectant,
  handleChangeDistribNbr,
  propositions,
  handleClickProposition,
}: HygieneMobileOptionsDesinfectantProps) => {
  return (
    <>
      <HygieneMobileOptionsDesinfectantInput
        nbDistribDesinfectant={nbDistribDesinfectant}
        handleChangeDistribNbr={handleChangeDistribNbr}
        hygieneDistribQuantite={hygieneDistribQuantite}
      />
      <HygieneMobileOptionsDesinfectantCarousel
        propositions={propositions}
        handleClickProposition={handleClickProposition}
      />
    </>
  );
};

export default HygieneMobileOptionsDesinfectant;
