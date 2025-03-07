import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent } from "react";
import HygieneMobileOptionsParfumCarousel from "./HygieneMobileOptionsParfumCarousel";
import HygieneMobileOptionsParfumInput from "./HygieneMobileOptionsParfumInput";

type HygieneMobileOptionsParfumProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  nbDistribParfum: number;
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

const HygieneMobileOptionsParfum = ({
  hygieneDistribQuantite,
  nbDistribParfum,
  handleChangeDistribNbr,
  propositions,
  handleClickProposition,
}: HygieneMobileOptionsParfumProps) => {
  return (
    <>
      <HygieneMobileOptionsParfumInput
        nbDistribParfum={nbDistribParfum}
        handleChangeDistribNbr={handleChangeDistribNbr}
        hygieneDistribQuantite={hygieneDistribQuantite}
      />
      <HygieneMobileOptionsParfumCarousel
        propositions={propositions}
        handleClickProposition={handleClickProposition}
      />
    </>
  );
};

export default HygieneMobileOptionsParfum;
