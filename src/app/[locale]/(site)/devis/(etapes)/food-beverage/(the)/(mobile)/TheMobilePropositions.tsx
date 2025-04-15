import { ChangeEvent } from "react";
import TheMobileInputs from "./TheMobileInputs";
import TheMobilePropositionsCarousel from "./TheMobilePropositionsCarousel";
import { useTranslations } from "next-intl";

type TheMobilePropositionsProps = {
  nbPersonnes: number;
  nbTassesParJour: number;
  handleChangeNbPersonnes: (e: ChangeEvent<HTMLInputElement>) => void;
  propositions: {
    totalAnnuel: number | null;
    infos: string | null;
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: number;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    prixUnitaire: number | null;
    effectifFournisseur: string | null;
  }[];
  handleClickProposition: (proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: number;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    prixUnitaire: number | null;
    effectifFournisseur: string | null;
  }) => void;
  handleIncrement: () => void;
  handleDecrement: () => void;
};

const TheMobilePropositions = ({
  nbPersonnes,
  nbTassesParJour,
  handleChangeNbPersonnes,
  propositions,
  handleClickProposition,
  handleIncrement,
  handleDecrement,
}: TheMobilePropositionsProps) => {
  const tThe = useTranslations("DevisPage.foodBeverage.the");
  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="font-bold text-xl -mb-4">{tThe("sachets-de-the")}</p>
      <TheMobileInputs
        nbPersonnes={nbPersonnes}
        handleChangeNbPersonnes={handleChangeNbPersonnes}
        handleIncrement={handleIncrement}
        handleDecrement={handleDecrement}
      />
      <TheMobilePropositionsCarousel
        propositions={propositions}
        handleClickProposition={handleClickProposition}
        nbTassesParJour={nbTassesParJour}
      />
    </div>
  );
};

export default TheMobilePropositions;
