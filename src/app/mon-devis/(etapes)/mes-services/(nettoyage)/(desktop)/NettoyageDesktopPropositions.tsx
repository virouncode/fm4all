import { GammeType } from "@/zod-schemas/gamme";
import NettoyageFournisseurLogo from "./NettoyageFournisseurLogo";
import NettoyagePropositionCard from "./NettoyagePropositionCard";

type NettoyageDesktopPropositionsProps = {
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: GammeType;
    totalAnnuel: number | null;
  }) => void;
  formattedPropositions: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: "essentiel" | "confort" | "excellence";
    totalAnnuel: number | null;
  }[][];
};

const NettoyageDesktopPropositions = ({
  formattedPropositions,
  handleClickProposition,
}: NettoyageDesktopPropositionsProps) => {
  return (
    <div className="h-full flex flex-col border rounded-xl overflow-auto">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((propositions) => (
            <div
              className="flex border-b flex-1"
              key={propositions[0].fournisseurId}
            >
              <NettoyageFournisseurLogo {...propositions[0]} />
              {propositions.map((proposition) => (
                <NettoyagePropositionCard
                  key={proposition.id}
                  handleClickProposition={handleClickProposition}
                  proposition={proposition}
                />
              ))}
            </div>
          ))
        : null}
    </div>
  );
};

export default NettoyageDesktopPropositions;
