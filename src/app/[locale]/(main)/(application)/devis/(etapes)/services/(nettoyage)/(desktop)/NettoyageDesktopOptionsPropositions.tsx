import NettoyageOptionsDimancheCard from "./NettoyageOptionsDimancheCard";
import NettoyageOptionsRepasseCard from "./NettoyageOptionsRepasseCard";
import NettoyageOptionsSamediCard from "./NettoyageOptionsSamediCard";
import NettoyageOptionsVitrerieCard from "./NettoyageOptionsVitrerieCard";

type NettoyageOptionsPropositionsProps = {
  repasseProposition: {
    id: number;
    freqAnnuelle: number | undefined;
    hParPassage: number;
    prixAnnuel: number | null;
  } | null;
  samediProposition: {
    id: number;
    prixAnnuel: number;
    hParPassage: number;
  };
  dimancheProposition: {
    id: number;
    prixAnnuel: number;
    hParPassage: number;
  };
  vitrerieProposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
  } | null;
  color: string;
  initialSelectedRepasseId?: string;
  initialSelectedSamediId?: string;
  initialSelectedDimancheId?: string;
  initialSelectedVitrerieId?: string;
  initialSelectedNbPassagesVitrerie?: number;
};

const NettoyageDesktopOptionsPropositions = ({
  initialSelectedRepasseId,
  initialSelectedSamediId,
  initialSelectedDimancheId,
  initialSelectedVitrerieId,
  initialSelectedNbPassagesVitrerie,
  repasseProposition,
  samediProposition,
  dimancheProposition,
  vitrerieProposition,
  color,
}: NettoyageOptionsPropositionsProps) => {
  return (
    <div className="hidden h-full flex-col overflow-auto rounded-xl border lg:flex">
      <NettoyageOptionsRepasseCard
        repasseProposition={repasseProposition}
        selectedRepasseId={initialSelectedRepasseId}
        color={color}
      />
      <NettoyageOptionsSamediCard
        samediProposition={samediProposition}
        selectedSamediId={initialSelectedSamediId}
        color={color}
      />
      <NettoyageOptionsDimancheCard
        dimancheProposition={dimancheProposition}
        selectedDimancheId={initialSelectedDimancheId}
        color={color}
      />
      <NettoyageOptionsVitrerieCard
        vitrerieProposition={vitrerieProposition}
        selectedVitrerieId={initialSelectedVitrerieId}
        selectedNbPassagesVitrerie={initialSelectedNbPassagesVitrerie}
        color={color}
      />
    </div>
  );
};

export default NettoyageDesktopOptionsPropositions;
