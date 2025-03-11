import { ChangeEvent } from "react";
import ThePropositionCard from "../ThePropositionCard";
import ThePropositionFournisseurLogo from "../ThePropositionFournisseurLogo";
import ThePropositionsInput from "../ThePropositionsInput";

type TheDesktopPropositionsProps = {
  nbPersonnes: number;
  nbTassesParJour: number;
  effectif: number;
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
};

const TheDesktopPropositions = ({
  nbPersonnes,
  nbTassesParJour,
  effectif,
  handleChangeNbPersonnes,
  propositions,
  handleClickProposition,
}: TheDesktopPropositionsProps) => {
  return (
    <div className="h-full flex flex-col border rounded-xl overflow-auto">
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center flex-col p-4">
          <ThePropositionFournisseurLogo {...propositions[0]} />
          <ThePropositionsInput
            nbPersonnes={nbPersonnes}
            handleChange={handleChangeNbPersonnes}
            effectif={effectif}
          />
        </div>
        {propositions.map((proposition) => (
          <ThePropositionCard
            key={proposition.id}
            proposition={proposition}
            handleClickProposition={handleClickProposition}
            nbTassesParJour={nbTassesParJour}
          />
        ))}
      </div>
    </div>
  );
};

export default TheDesktopPropositions;
