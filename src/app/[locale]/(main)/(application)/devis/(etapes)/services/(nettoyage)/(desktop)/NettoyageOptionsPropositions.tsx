import { MAX_PASSAGES_VITRERIE } from "@/constants/constants";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { ChangeEvent } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import NettoyageMobileOptionsPropositions from "../(mobile)/NettoyageMobileOptionsPropositions";
import NettoyageDesktopOptionsPropositions from "./NettoyageDesktopOptionsPropositions";

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
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  } | null;
  samediProposition: {
    id: string;
    prixAnnuel: number;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  };
  dimancheProposition: {
    id: string;
    prixAnnuel: number;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  };
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
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  };
};

const NettoyageOptionsPropositions = ({
  repasseProposition,
  samediProposition,
  dimancheProposition,
  vitrerieProposition,
}: NettoyageOptionsPropositionsProps) => {
  const { nettoyage, setNettoyage } = useNettoyageStore(
    useShallow((s) => ({
      nettoyage: s.nettoyage,
      setNettoyage: s.setNettoyage,
    })),
  );
  const color = getFm4AllColor(nettoyage.infos.gammeSelected);

  const handleClickRepasseProposition = (proposition: {
    id: string;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
  }) => {
    if (nettoyage.infos.repasseSelected) {
      setNettoyage((prev) => ({
        infos: {
          ...prev.infos,
          repasseSelected: false,
        },
        quantites: {
          ...prev.quantites,
          hParPassageRepasse: null,
        },
        prix: {
          ...prev.prix,
          tauxHoraireRepasse: null,
        },
      }));
    } else {
      setNettoyage((prev) => ({
        infos: {
          ...prev.infos,
          repasseSelected: true,
        },
        quantites: {
          ...prev.quantites,
          hParPassageRepasse: proposition.hParPassage,
        },
        prix: {
          ...prev.prix,
          tauxHoraireRepasse: proposition.tauxHoraire,
        },
      }));
    }
  };

  const handleClickSamediProposition = () => {
    if (nettoyage.infos.samediSelected) {
      setNettoyage((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          samediSelected: false,
        },
      }));
    } else {
      setNettoyage((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          samediSelected: true,
        },
      }));
    }
  };

  const handleClickDimancheProposition = () => {
    if (nettoyage.infos.dimancheSelected) {
      setNettoyage((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          dimancheSelected: false,
        },
      }));
    } else {
      setNettoyage((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          dimancheSelected: true,
        },
      }));
    }
  };

  const handleClickVitrerieProposition = (proposition: {
    id: string;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
  }) => {
    if (nettoyage.infos.vitrerieSelected) {
      setNettoyage((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          vitrerieSelected: false,
        },
        prix: {
          ...prev.prix,
          tauxHoraireVitrerie: null,
          minFacturationVitrerie: null,
          fraisDeplacementVitrerie: null,
        },
      }));
    } else {
      setNettoyage((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          vitrerieSelected: true,
        },
        prix: {
          ...prev.prix,
          tauxHoraireVitrerie: proposition.tauxHoraire,
          minFacturationVitrerie: proposition.minFacturation,
          fraisDeplacementVitrerie: proposition.fraisDeplacement,
        },
      }));
    }
  };

  const handleChangeNbPassageVitrerie = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newNbPassageVitrerie = value ? parseInt(value) : 0;
    if (newNbPassageVitrerie > MAX_PASSAGES_VITRERIE)
      newNbPassageVitrerie = MAX_PASSAGES_VITRERIE;
    setNettoyage((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbPassagesVitrerie: newNbPassageVitrerie,
      },
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return isTabletOrMobile ? (
    <NettoyageMobileOptionsPropositions
      repasseProposition={repasseProposition}
      handleClickRepasseProposition={handleClickRepasseProposition}
      samediProposition={samediProposition}
      handleClickSamediProposition={handleClickSamediProposition}
      dimancheProposition={dimancheProposition}
      handleClickDimancheProposition={handleClickDimancheProposition}
      vitrerieProposition={vitrerieProposition}
      handleClickVitrerieProposition={handleClickVitrerieProposition}
      handleChangeNbPassageVitrerie={handleChangeNbPassageVitrerie}
      color={color}
    />
  ) : (
    <NettoyageDesktopOptionsPropositions
      repasseProposition={repasseProposition}
      handleClickRepasseProposition={handleClickRepasseProposition}
      samediProposition={samediProposition}
      handleClickSamediProposition={handleClickSamediProposition}
      dimancheProposition={dimancheProposition}
      handleClickDimancheProposition={handleClickDimancheProposition}
      vitrerieProposition={vitrerieProposition}
      handleClickVitrerieProposition={handleClickVitrerieProposition}
      handleChangeNbPassageVitrerie={handleChangeNbPassageVitrerie}
      color={color}
    />
  );
};
export default NettoyageOptionsPropositions;

//heures  par an = heures par passage * frequence annuelle
//heures  par semaine = heures  par an / (nombre de semaines ouvrées dans l'année: S_OUVREES_PAR_AN = 21.67*12/5)
