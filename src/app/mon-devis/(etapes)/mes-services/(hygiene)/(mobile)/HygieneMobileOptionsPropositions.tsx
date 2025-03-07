import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent } from "react";

type HygieneMobielOptionsPropositionsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  nbDistribDesinfectant: number;
  nbDistribParfum: number;
  nbDistribBalai: number;
  nbDistribPoubelle: number;
  dureeLocation: "pa12M" | "pa24M" | "pa36M" | "oneShot";
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  propositions: {
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
  dureeLocation,
  handleChangeDistribNbr,
  handleClickProposition,
  propositions,
}: HygieneMobielOptionsPropositionsProps) => {
  return <div></div>;
};

export default HygieneMobileOptionsPropositions;
