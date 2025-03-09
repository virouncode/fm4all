import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent } from "react";
import HygieneOptionsBalaiCard from "./HygieneOptionsBalaiCard";
import HygieneOptionsDesinfectantCard from "./HygieneOptionsDesinfectantCard";
import HygieneOptionsParfumCard from "./HygieneOptionsParfumCard";
import HygieneOptionsPoubelleCard from "./HygieneOptionsPoubelleCard";

type HygieneDesktopOptionsPropositionsProps = {
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

const HygieneDesktopOptionsPropositions = ({
  hygieneDistribQuantite,
  nbDistribDesinfectant,
  nbDistribParfum,
  nbDistribBalai,
  nbDistribPoubelle,
  handleChangeDistribNbr,
  handleClickProposition,
  propositions,
}: HygieneDesktopOptionsPropositionsProps) => {
  return (
    <div className="h-full flex flex-col border rounded-xl overflow-auto">
      {/*1ère ligne */}
      <HygieneOptionsDesinfectantCard
        nbDistribDesinfectant={nbDistribDesinfectant}
        handleChangeDistribNbr={handleChangeDistribNbr}
        handleClickProposition={handleClickProposition}
        hygieneDistribQuantite={hygieneDistribQuantite}
        propositions={propositions}
      />
      {/*2ème ligne */}
      <HygieneOptionsParfumCard
        nbDistribParfum={nbDistribParfum}
        handleChangeDistribNbr={handleChangeDistribNbr}
        handleClickProposition={handleClickProposition}
        hygieneDistribQuantite={hygieneDistribQuantite}
        propositions={propositions}
      />
      {/*3ème ligne */}
      <HygieneOptionsBalaiCard
        nbDistribBalai={nbDistribBalai}
        handleChangeDistribNbr={handleChangeDistribNbr}
        handleClickProposition={handleClickProposition}
        hygieneDistribQuantite={hygieneDistribQuantite}
        propositions={propositions}
      />
      {/*4ème ligne */}
      <HygieneOptionsPoubelleCard
        nbDistribPoubelle={nbDistribPoubelle}
        handleChangeDistribNbr={handleChangeDistribNbr}
        handleClickProposition={handleClickProposition}
        hygieneDistribQuantite={hygieneDistribQuantite}
        propositions={propositions}
      />
    </div>
  );
};

export default HygieneDesktopOptionsPropositions;
