import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { ChangeEvent } from "react";

import { HygieneOptionsType } from "../(desktop)/HygieneOptionsPropositions";
import HygieneMobileOptionsBalai from "./HygieneMobileOptionsBalai";
import HygieneMobileOptionsDesinfectant from "./HygieneMobileOptionsDesinfectant";
import HygieneMobileOptionsParfum from "./HygieneMobileOptionsParfum";
import HygieneMobileOptionsPoubelle from "./HygieneMobileOptionsPoubelle";

type HygieneMobielOptionsPropositionsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  nbDistribDesinfectant: number;
  nbDistribParfum: number;
  nbDistribBalai: number;
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

const HygieneMobileOptionsPropositions = ({
  hygieneDistribQuantite,
  nbDistribDesinfectant,
  nbDistribParfum,
  nbDistribBalai,
  nbDistribPoubelle,
  handleChangeDistribNbr,
  handleClickProposition,
  propositions,
}: HygieneMobielOptionsPropositionsProps) => {
  return (
    <div className="flex w-full flex-col gap-6">
      <HygieneMobileOptionsDesinfectant
        nbDistribDesinfectant={nbDistribDesinfectant}
        handleChangeDistribNbr={handleChangeDistribNbr}
        propositions={propositions}
        hygieneDistribQuantite={hygieneDistribQuantite}
        handleClickProposition={handleClickProposition}
      />
      <HygieneMobileOptionsParfum
        nbDistribParfum={nbDistribParfum}
        handleChangeDistribNbr={handleChangeDistribNbr}
        propositions={propositions}
        hygieneDistribQuantite={hygieneDistribQuantite}
        handleClickProposition={handleClickProposition}
      />

      <HygieneMobileOptionsBalai
        nbDistribBalai={nbDistribBalai}
        handleChangeDistribNbr={handleChangeDistribNbr}
        propositions={propositions}
        hygieneDistribQuantite={hygieneDistribQuantite}
        handleClickProposition={handleClickProposition}
      />

      <HygieneMobileOptionsPoubelle
        nbDistribPoubelle={nbDistribPoubelle}
        handleChangeDistribNbr={handleChangeDistribNbr}
        propositions={propositions}
        hygieneDistribQuantite={hygieneDistribQuantite}
        handleClickProposition={handleClickProposition}
      />
    </div>
  );
};

export default HygieneMobileOptionsPropositions;
