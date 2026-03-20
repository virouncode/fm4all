import { ChangeEvent } from "react";
import NettoyageMobileOptionsDimancheCard from "./NettoyageMobileOptionsDimancheCard";
import NettoyageMobileOptionsRepasseCard from "./NettoyageMobileOptionsRepasseCard";
import NettoyageMobileOptionsSamediCard from "./NettoyageMobileOptionsSamediCard";
import NettoyageMobileOptionsVitrerieCard from "./NettoyageMobileOptionsVitrerieCard";

type NettoyageMobileOptionsPropositionsProps = {
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

const NettoyageMobileOptionsPropositions = ({
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
}: NettoyageMobileOptionsPropositionsProps) => {
  return (
    <div className="flex w-full flex-col gap-6">
      <NettoyageMobileOptionsRepasseCard
        repasseProposition={repasseProposition}
        handleClickRepasseProposition={handleClickRepasseProposition}
        color={color}
      />
      <NettoyageMobileOptionsSamediCard
        samediProposition={samediProposition}
        handleClickSamediProposition={handleClickSamediProposition}
        color={color}
      />
      <NettoyageMobileOptionsDimancheCard
        dimancheProposition={dimancheProposition}
        handleClickDimancheProposition={handleClickDimancheProposition}
        color={color}
      />
      <NettoyageMobileOptionsVitrerieCard
        vitrerieProposition={vitrerieProposition}
        handleClickVitrerieProposition={handleClickVitrerieProposition}
        handleChangeNbPassageVitrerie={handleChangeNbPassageVitrerie}
        color={color}
      />
    </div>
  );
};

export default NettoyageMobileOptionsPropositions;
