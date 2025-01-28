import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { ChangeEvent, useContext } from "react";
import NettoyageOptionsDimancheCard from "./NettoyageOptionsDimancheCard";
import NettoyageOptionsRepasseCard from "./NettoyageOptionsRepasseCard";
import NettoyageOptionsSamediCard from "./NettoyageOptionsSamediCard";
import NettoyageOptionsVitrerieCard from "./NettoyageOptionsVitrerieCard";

export const MAX_PASSAGES_VITRERIE = 24;

type NettoyageOptionsPropositionsProps = {
  repasseProposition: {
    id: number;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
  } | null;
  samediProposition: {
    id: number;
    prixAnnuel: number;
  };
  dimancheProposition: {
    id: number;
    prixAnnuel: number;
  };
  vitrerieProposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
  };
};

const NettoyageOptionsPropositions = ({
  repasseProposition,
  samediProposition,
  dimancheProposition,
  vitrerieProposition,
}: NettoyageOptionsPropositionsProps) => {
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const color = getFm4AllColor(nettoyage.infos.gammeSelected);

  const handleClickRepasseProposition = (proposition: {
    id: number;
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
    id: number;
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
    id: number;
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
    id: number;
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
    let newNbPassageVitrerie = value ? parseInt(value) : 2;
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
        ? Math.round(
            newNbPassageVitrerie *
              Math.max(
                (nettoyage.quantites.surfaceCloisons /
                  nettoyage.quantites.cadenceCloisons +
                  nettoyage.quantites.surfaceVitres /
                    nettoyage.quantites.cadenceVitres) *
                  nettoyage.prix.tauxHoraireVitrerie,
                nettoyage.prix.minFacturationVitrerie
              )
          )
        : null;
    setTotalNettoyage((prev) => ({
      ...prev,
      totalVitrerie,
    }));
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-auto">
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
export default NettoyageOptionsPropositions;

//heures  par an = heures par passage * frequence annuelle
//heures  par semaine = heures  par an / (nombre de semaines ouvrées dans l'année: S_OUVREES_PAR_AN = 21.67*12/5)
