import { ChangeEvent } from "react";
import NettoyageOptionsDimancheCard from "./NettoyageOptionsDimancheCard";
import NettoyageOptionsRepasseCard from "./NettoyageOptionsRepasseCard";
import NettoyageOptionsSamediCard from "./NettoyageOptionsSamediCard";
import NettoyageOptionsVitrerieCard from "./NettoyageOptionsVitrerieCard";

type NettoyageOptionsPropositionsProps = {
  repasseProposition: {
    id: number;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
  } | null;
  handleClickRepasseProposition: (proposition: {
    id: number;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
  }) => void;
  samediProposition: {
    id: number;
    prixAnnuel: number;
  };
  handleClickSamediProposition: (proposition: {
    id: number;
    prixAnnuel: number;
  }) => void;
  dimancheProposition: {
    id: number;
    prixAnnuel: number;
  };
  handleClickDimancheProposition: (proposition: {
    id: number;
    prixAnnuel: number;
  }) => void;
  vitrerieProposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
  };
  handleClickVitrerieProposition: (proposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
  }) => void;
  handleChangeNbPassageVitrerie: (e: ChangeEvent<HTMLInputElement>) => void;
  color: string;
};

const NettoyageDesktopOptionsPropositions = ({
  repasseProposition,
  handleClickRepasseProposition,
  samediProposition,
  handleClickSamediProposition,
  dimancheProposition,
  handleClickDimancheProposition,
  vitrerieProposition,
  handleClickVitrerieProposition,
  handleChangeNbPassageVitrerie,
  color,
}: NettoyageOptionsPropositionsProps) => {
  return (
    <div className="h-full flex-col border rounded-xl overflow-auto hidden lg:flex">
      <NettoyageOptionsRepasseCard
        repasseProposition={repasseProposition}
        handleClickRepasseProposition={handleClickRepasseProposition}
        color={color}
      />
      <NettoyageOptionsSamediCard
        samediProposition={samediProposition}
        handleClickSamediProposition={handleClickSamediProposition}
        color={color}
      />
      <NettoyageOptionsDimancheCard
        dimancheProposition={dimancheProposition}
        handleClickDimancheProposition={handleClickDimancheProposition}
        color={color}
      />
      <NettoyageOptionsVitrerieCard
        vitrerieProposition={vitrerieProposition}
        handleClickVitrerieProposition={handleClickVitrerieProposition}
        handleChangeNbPassageVitrerie={handleChangeNbPassageVitrerie}
        color={color}
      />
    </div>
  );
};

export default NettoyageDesktopOptionsPropositions;
