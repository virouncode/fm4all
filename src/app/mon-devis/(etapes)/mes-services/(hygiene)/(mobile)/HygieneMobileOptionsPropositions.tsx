import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent } from "react";

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
    <div className="flex flex-col gap-6 w-full">
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
