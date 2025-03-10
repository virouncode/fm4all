import { GammeType } from "@/zod-schemas/gamme";
import NettoyageMobilePropositionsCarousel from "./NettoyageMobilePropositionsCarousel";

type NettoyageMobilePropositionsProps = {
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

const NettoyageMobilePropositions = ({
  handleClickProposition,
  formattedPropositions,
}: NettoyageMobilePropositionsProps) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="font-bold text-xl -mb-4 lg:hidden">Nettoyage</p>
      {formattedPropositions.map((propositions) => (
        <NettoyageMobilePropositionsCarousel
          propositions={propositions}
          key={propositions[0].fournisseurId}
          handleClickProposition={handleClickProposition}
        />
      ))}
    </div>
  );
};

export default NettoyageMobilePropositions;
