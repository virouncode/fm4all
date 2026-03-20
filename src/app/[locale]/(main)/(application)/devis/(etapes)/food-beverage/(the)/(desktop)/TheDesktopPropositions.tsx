import { ChangeEvent } from "react";
import ThePropositionCard from "./ThePropositionCard";
import ThePropositionFournisseurLogo from "./ThePropositionFournisseurLogo";
import ThePropositionsInput from "./ThePropositionsInput";

type TheDesktopPropositionsProps = {
  nbPersonnes: number;
  nbTassesParJour: number;
  effectif: number;
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
    <div className="flex h-full flex-col overflow-auto rounded-xl border">
      <div className="flex flex-1 border-b">
        <div className="flex w-1/4 flex-col items-center justify-center p-4">
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
