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
    id: string;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: number;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    entrepriseId: string;
    gamme: "essentiel" | "confort" | "excellence";
    prixUnitaire: number | null;
    effectifFournisseur: string | null;
  }[];
  handleClickProposition: (proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: string;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: number;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    entrepriseId: string;
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
    <div className="flex w-full flex-col gap-6">
      <p className="-mb-4 text-xl font-bold">{tThe("sachets-de-the")}</p>
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
