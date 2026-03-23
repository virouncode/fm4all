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
    effectifPrestataire: string | null;
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
    imageStorageKeyDesinfectant: string | null;
    imageStorageKeyParfum: string | null;
    imageStorageKeyBalai: string | null;
    imageStorageKeyPoubelle: string | null;
  }[];
  handleClickProposition: (
    type: HygieneOptionsType,
    proposition: {
      nomPrestataire: string;
      sloganPrestataire: string | null;
      anneeCreation: number | null;
      logoStorageKey: string | null;
      ca: string | null;
      effectifPrestataire: string | null;
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
      imageStorageKeyDesinfectant: string | null;
      imageStorageKeyParfum: string | null;
      imageStorageKeyBalai: string | null;
      imageStorageKeyPoubelle: string | null;
    },
  ) => void;
};

const HygieneMobileOptionsPoubelle = ({
  hygieneDistribQuantite,
  nbDistribPoubelle,
  handleChangeDistribNbr,
  propositions,
  handleClickProposition,
}: HygieneMobileOptionsPoubelleProps) => {
  return (
    <>
      <HygieneMobileOptionsPoubelleInput
        nbDistribPoubelle={nbDistribPoubelle}
        handleChangeDistribNbr={handleChangeDistribNbr}
        hygieneDistribQuantite={hygieneDistribQuantite}
      />
      <HygieneMobileOptionsPoubelleCarousel
        propositions={propositions}
        handleClickProposition={handleClickProposition}
      />
    </>
  );
};

export default HygieneMobileOptionsPoubelle;
