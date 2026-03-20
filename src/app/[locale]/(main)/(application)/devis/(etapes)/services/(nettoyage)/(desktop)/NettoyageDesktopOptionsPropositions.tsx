import { ChangeEvent } from "react";
import NettoyageOptionsDimancheCard from "./NettoyageOptionsDimancheCard";
import NettoyageOptionsRepasseCard from "./NettoyageOptionsRepasseCard";
import NettoyageOptionsSamediCard from "./NettoyageOptionsSamediCard";
import NettoyageOptionsVitrerieCard from "./NettoyageOptionsVitrerieCard";

type NettoyageOptionsPropositionsProps = {
  repasseProposition: {
    id: string;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  } | null;
  handleClickRepasseProposition: (proposition: {
    id: string;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  }) => void;
  samediProposition: {
    id: string;
    prixAnnuel: number;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  };
  handleClickSamediProposition: (proposition: {
    id: string;
    prixAnnuel: number;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  }) => void;
  dimancheProposition: {
    id: string;
    prixAnnuel: number;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  };
  handleClickDimancheProposition: (proposition: {
    id: string;
    prixAnnuel: number;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  }) => void;
  vitrerieProposition: {
    id: string;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  };
  handleClickVitrerieProposition: (proposition: {
    id: string;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
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
    <div className="hidden h-full flex-col overflow-auto rounded-xl border lg:flex">
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
