import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { S_OUVREES_PAR_AN } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { ChangeEvent, useContext } from "react";

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
    prixAnnuel: number;
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
  const color =
    nettoyage.infos.gammeSelected === "essentiel"
      ? "fm4allessential"
      : nettoyage.infos.gammeSelected === "confort"
      ? "fm4allcomfort"
      : "fm4allexcellence";

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
          hParPassageRepasse: 0,
        },
        prix: {
          ...prev.prix,
          tauxHoraireRepasse: 0,
        },
      }));
      setTotalNettoyage((prev) => ({
        ...prev,
        totalRepasse: 0,
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
        totalSamedi: 0,
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
        totalDimanche: 0,
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
    prixAnnuel: number;
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
          tauxHoraireVitrerie: 0,
          minFacturationVitrerie: 0,
        },
      }));
      setTotalNettoyage((prev) => ({
        ...prev,
        totalVitrerie: 0,
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
    const newNbPassageVitrerie = value ? parseInt(value) : 2;
    setNettoyage((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbPassagesVitrerie: newNbPassageVitrerie,
      },
    }));
    if (nettoyage.infos.vitrerieSelected) {
      const totalVitrerie = Math.round(
        newNbPassageVitrerie *
          Math.max(
            (nettoyage.quantites.surfaceCloisons /
              nettoyage.quantites.cadenceCloisons +
              nettoyage.quantites.surfaceVitres /
                nettoyage.quantites.cadenceVitres) *
              nettoyage.prix.tauxHoraireVitrerie,
            nettoyage.prix.minFacturationVitrerie
          )
      );
      setTotalNettoyage((prev) => ({
        ...prev,
        totalVitrerie,
      }));
    }
  };

  const repassePrixAnnuelText = repasseProposition?.prixAnnuel
    ? `${formatNumber(repasseProposition.prixAnnuel)} € /an`
    : "Non proposé";
  const repasseHParSemaineText = repasseProposition
    ? `${formatNumber(
        (repasseProposition.hParPassage * nettoyage.quantites.freqAnnuelle) /
          S_OUVREES_PAR_AN
      )} h / semaine en plus*`
    : "";
  const repasseNbPassagesParSemaineText = repasseProposition
    ? `${formatNumber(
        nettoyage.quantites.freqAnnuelle / S_OUVREES_PAR_AN
      )}  passage(s) de ${repasseProposition.hParPassage} h / semaine`
    : "";

  const samediPrixAnnuelText = samediProposition.prixAnnuel
    ? `${formatNumber(samediProposition?.prixAnnuel)} € / an`
    : "Non proposé";
  const samediNbPassagesParSemaineText = `1 passage de ${nettoyage.quantites.hParPassage} h / semaine en plus`;

  const dimanchePrixAnnuel = dimancheProposition.prixAnnuel
    ? `${formatNumber(dimancheProposition.prixAnnuel)} € / an`
    : "Non proposé";
  const diamncheNbPassagesParSemaineText = `1 passage de ${nettoyage.quantites.hParPassage} h / semaine en plus`;

  const vitreriePrixAnnuelText = vitrerieProposition.prixAnnuel
    ? `${formatNumber(vitrerieProposition.prixAnnuel)} € /an`
    : "Non proposé";
  const nbPassagesVitrerieText = `${nettoyage.quantites.nbPassagesVitrerie} passages / an`;

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center text-base p-4">
          Repasse sanitaire
        </div>
        {repasseProposition ? (
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.infos.repasseSelected
                ? "ring-4 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() => handleClickRepasseProposition(repasseProposition)}
          >
            <Checkbox
              checked={nettoyage.infos.repasseSelected}
              onCheckedChange={() =>
                handleClickRepasseProposition(repasseProposition)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">{repassePrixAnnuelText}</p>
              <p className="text-base">{repasseHParSemaineText}</p>
              <p className="text-xs">{repasseNbPassagesParSemaineText}</p>
            </div>
          </div>
        ) : (
          <div
            className={`flex w-3/4 items-center justify-center bg-${color} text-slate-200 items-center justify-center  text-lg gap-4 cursor-pointer`}
          >
            Non proposé pour une frequence annuelle de passage de moins de 260 j
            / an
          </div>
        )}
      </div>

      {samediProposition && (
        <div className="flex border-b flex-1 ">
          <div className="flex w-1/4 items-center justify-center text-base text-center p-4">
            Nettoyage supplémentaire tous les Samedi
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.infos.samediSelected
                ? "ring-4 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() => handleClickSamediProposition(samediProposition)}
          >
            <Checkbox
              checked={nettoyage.infos.samediSelected}
              onCheckedChange={() =>
                handleClickSamediProposition(samediProposition)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">{samediPrixAnnuelText}</p>
              <p className="text-sm">{samediNbPassagesParSemaineText}</p>
            </div>
          </div>
        </div>
      )}
      {dimancheProposition && (
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center text-base text-center p-4">
            Nettoyage supplémentaire tous les Dimanche
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.infos.dimancheSelected
                ? "ring-4 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() => handleClickDimancheProposition(dimancheProposition)}
          >
            <Checkbox
              checked={nettoyage.infos.dimancheSelected}
              onCheckedChange={() =>
                handleClickDimancheProposition(dimancheProposition)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">{dimanchePrixAnnuel}</p>
              <p className="text-sm">{diamncheNbPassagesParSemaineText}</p>
            </div>
          </div>
        </div>
      )}
      {vitrerieProposition && (
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center p-4">
            <div className="flex flex-col gap-2 items-center justify-center w-full">
              <p className="text-base">Lavage Vitrerie*</p>
              <div className="flex gap-4 items-center justify-center w-full">
                <Input
                  type="number"
                  value={nettoyage.quantites.nbPassagesVitrerie}
                  min={1}
                  max={24}
                  step={1}
                  onChange={handleChangeNbPassageVitrerie}
                  className={`w-16 ${
                    nettoyage.quantites.nbPassagesVitrerie === 2
                      ? "text-destructive"
                      : ""
                  }`}
                />
                <Label htmlFor="nbDePassagesVitrerie" className="text-sm">
                  passages / an
                </Label>
              </div>
              <p className="text-xs text-destructive italic px-2 text-center">
                Les quantités sont estimées pour vous mais vous pouvez les
                changer
              </p>
            </div>
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.infos.vitrerieSelected
                ? "ring-4 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() => handleClickVitrerieProposition(vitrerieProposition)}
          >
            <Checkbox
              checked={nettoyage.infos.vitrerieSelected}
              onCheckedChange={() =>
                handleClickVitrerieProposition(vitrerieProposition)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">{vitreriePrixAnnuelText}</p>
              <p className="text-sm">{nbPassagesVitrerieText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default NettoyageOptionsPropositions;

//heures  par an = heures par passage * frequence annuelle
//heures  par semaine = heures  par an / (nombre de semaines ouvrées dans l'année: S_OUVREES_PAR_AN = 21.67*12/5)
