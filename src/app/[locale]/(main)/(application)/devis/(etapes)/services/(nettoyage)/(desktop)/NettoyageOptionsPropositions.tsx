import { MAX_PASSAGES_VITRERIE } from "@/constants/constants";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { useTotalNettoyageStore } from "@/stores/devis/totalNettoyageStore";
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
    effectif: string | null;
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
    effectif: string | null;
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
    effectif: string | null;
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
    effectif: string | null;
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
  const setTotalNettoyage = useTotalNettoyageStore((s) => s.setTotalNettoyage);
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
      setTotalNettoyage((prev) => ({
        ...prev,
        totalRepasse: null,
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
      setTotalNettoyage((prev) => ({
        ...prev,
        totalRepasse: proposition.prixAnnuel,
      }));
    }
  };

  const handleClickSamediProposition = (proposition: {
    id: string;
    prixAnnuel: number;
  }) => {
    if (nettoyage.infos.samediSelected) {
      setNettoyage((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          samediSelected: false,
        },
      }));
      setTotalNettoyage((prev) => ({
        ...prev,
        totalSamedi: null,
      }));
    } else {
      setNettoyage((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          samediSelected: true,
        },
      }));
      setTotalNettoyage((prev) => ({
        ...prev,
        totalSamedi: proposition.prixAnnuel,
      }));
    }
  };

  const handleClickDimancheProposition = (proposition: {
    id: string;
    prixAnnuel: number;
  }) => {
    if (nettoyage.infos.dimancheSelected) {
      setNettoyage((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          dimancheSelected: false,
        },
      }));
      setTotalNettoyage((prev) => ({
        ...prev,
        totalDimanche: null,
      }));
    } else {
      setNettoyage((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          dimancheSelected: true,
        },
      }));
      setTotalNettoyage((prev) => ({
        ...prev,
        totalDimanche: proposition.prixAnnuel,
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
      setTotalNettoyage((prev) => ({
        ...prev,
        totalVitrerie: null,
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
      setTotalNettoyage((prev) => ({
        ...prev,
        totalVitrerie: proposition.prixAnnuel,
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

    const totalVitrerie =
      nettoyage.infos.vitrerieSelected &&
      nettoyage.quantites.surfaceCloisons !== null &&
      nettoyage.quantites.cadenceCloisons !== null &&
      nettoyage.quantites.surfaceVitres !== null &&
      nettoyage.quantites.cadenceVitres !== null &&
      nettoyage.prix.tauxHoraireVitrerie !== null &&
      nettoyage.prix.minFacturationVitrerie !== null
        ? newNbPassageVitrerie *
          Math.max(
            (nettoyage.quantites.surfaceCloisons /
              nettoyage.quantites.cadenceCloisons +
              nettoyage.quantites.surfaceVitres /
                nettoyage.quantites.cadenceVitres) *
              nettoyage.prix.tauxHoraireVitrerie,
            nettoyage.prix.minFacturationVitrerie,
          )
        : null;
    setTotalNettoyage((prev) => ({
      ...prev,
      totalVitrerie,
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
