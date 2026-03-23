import MaintenancePrestataireLogo from "./MaintenancePrestataireLogo";
import MaintenancePropositionCard from "./MaintenancePropositionCard";

type MaintenanceDesktopPropositionsProps = {
  formattedPropositions: {
    id: string;
    gamme: "essentiel" | "confort" | "excellence";
    nomPrestataire: string;
    entrepriseId: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  }[][];
  handleClickProposition: (proposition: {
    id: string;
    gamme: "essentiel" | "confort" | "excellence";
    nomPrestataire: string;
    entrepriseId: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  }) => void;
};

const MaintenanceDesktopPropositions = ({
  formattedPropositions,
  handleClickProposition,
}: MaintenanceDesktopPropositionsProps) => {
  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((propositions) => (
            <div
              className="flex flex-1 border-b"
              key={propositions[0].entrepriseId}
            >
              <MaintenancePrestataireLogo {...propositions[0]} />
              {propositions.map((proposition) => (
                <MaintenancePropositionCard
                  key={proposition.id}
                  proposition={proposition}
                  handleClickProposition={handleClickProposition}
                />
              ))}
            </div>
          ))
        : null}
    </div>
  );
};

export default MaintenanceDesktopPropositions;
