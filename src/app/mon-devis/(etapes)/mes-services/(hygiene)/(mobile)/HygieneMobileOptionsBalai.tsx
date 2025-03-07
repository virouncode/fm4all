import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent } from "react";
import HygieneMobileOptionsBalaiInput from "./HygieneMobileOptionsBalaiInput";
import HygieneMobileOptionsBalaiCarousel from "./HygieneMobileOptionsBalaiCarousel";

type HygieneMobileOptionsBalaiProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  nbDistribBalai: number;
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
