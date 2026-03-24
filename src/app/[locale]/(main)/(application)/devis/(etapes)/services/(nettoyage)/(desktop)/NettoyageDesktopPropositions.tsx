import { GammeType } from "@/zod-schemas/gamme.schema";
import NettoyagePrestataireLogo from "./NettoyagePrestataireLogo";
import NettoyagePropositionCard from "./NettoyagePropositionCard";

type NettoyageDesktopPropositionsProps = {
  handleClickProposition: (proposition: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: GammeType;
    totalAnnuel: number | null;
    imageStorageKey: string | null;
    infos: string | null;
    hygienePartenaireEntrepriseId: string | null;
  }) => void;
  formattedPropositions: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: "essentiel" | "confort" | "excellence";
    totalAnnuel: number | null;
    imageStorageKey: string | null;
    infos: string | null;
    hygienePartenaireEntrepriseId: string | null;
  }[][];
};

const NettoyageDesktopPropositions = ({
  formattedPropositions,
  handleClickProposition,
}: NettoyageDesktopPropositionsProps) => {
  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((propositions) => (
            <div
              className="flex flex-1 border-b"
              key={propositions[0].entrepriseId}
            >
              <NettoyagePrestataireLogo {...propositions[0]} />
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
