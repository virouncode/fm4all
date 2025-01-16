import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { S_OUVREES_PAR_AN } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { ChangeEvent, useContext } from "react";

type NettoyageOptionsPropositionsProps = {
  repasseProposition:
    | (SelectRepasseTarifsType & {
        freqAnnuelle: number;
        prixAnnuel: number;
      })
    | null;
  samediDimancheProposition:
    | (SelectNettoyageTarifsType & {
        prixAnnuelSamedi: number;
        prixAnnuelDimanche: number;
      })
    | null;
  vitrerieProposition:
    | (SelectVitrerieTarifsType & {
        prixParPassage: number;
      })
    | null;
};

const NettoyageOptionsPropositions = ({
  samediDimancheProposition,
  repasseProposition,
  vitrerieProposition,
}: NettoyageOptionsPropositionsProps) => {
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const color =
    samediDimancheProposition?.gamme === "essentiel"
      ? "fm4allessential"
      : samediDimancheProposition?.gamme === "confort"
      ? "fm4allcomfort"
      : "fm4allexcellence";

  const handleClickProposition = (type: string, prixAnnuel: number) => {
    switch (type) {
      case "repasse":
        if (nettoyage.repasseSelected) {
          setNettoyage((prev) => ({
            ...prev,
            repasseSelected: false,
          }));
          setTotalNettoyage((prev) => ({
            ...prev,
            prixRepasse: null,
          }));
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          repasseSelected: true,
        }));
        setTotalNettoyage((prev) => ({
          ...prev,
          prixRepasse: prixAnnuel,
        }));
        break;
      case "vitrerie":
        if (nettoyage.vitrerieSelected) {
          setNettoyage((prev) => ({
            ...prev,
            vitrerieSelected: false,
          }));
          setTotalNettoyage((prev) => ({
            ...prev,
            prixVitrerie: null,
          }));
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          vitrerieSelected: true,
        }));
        setTotalNettoyage((prev) => ({
          ...prev,
          prixVitrerie: prixAnnuel,
        }));
        break;
      case "samedi":
        if (nettoyage.samediSelected) {
          setNettoyage((prev) => ({
            ...prev,
            samediSelected: false,
          }));
          setTotalNettoyage((prev) => ({
            ...prev,
            prixSamedi: null,
          }));
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          samediSelected: true,
        }));
        setTotalNettoyage((prev) => ({
          ...prev,
          prixSamedi: prixAnnuel,
        }));
        break;
      case "dimanche":
        if (nettoyage.dimancheSelected) {
          setNettoyage((prev) => ({
            ...prev,
            dimancheSelected: false,
          }));
          setTotalNettoyage((prev) => ({
            ...prev,
            prixDimanche: null,
          }));
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          dimancheSelected: true,
        }));
        setTotalNettoyage((prev) => ({
          ...prev,
          prixDimanche: prixAnnuel,
        }));
        break;
    }
  };

  const handleChangeNbPassageVitrerie = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newNbPassageVitrerie = value ? parseInt(value) : 2;
    setNettoyage((prev) => ({
      ...prev,
      nbPassageVitrerie: newNbPassageVitrerie,
    }));
    if (nettoyage.vitrerieSelected) {
      const prixVitrerie = Math.round(
        vitrerieProposition?.prixParPassage
          ? vitrerieProposition.prixParPassage * newNbPassageVitrerie
          : 0
      );
      setTotalNettoyage((prev) => ({
        ...prev,
        prixVitrerie,
      }));
    }
  };

  const repassePrixAnnuel = repasseProposition?.prixAnnuel
    ? `${formatNumber(repasseProposition.prixAnnuel)} € /an`
    : "Non proposé";
  const repasseHParSemaine =
    repasseProposition?.hParPassage && repasseProposition?.freqAnnuelle
      ? `${formatNumber(
          (repasseProposition.hParPassage * repasseProposition.freqAnnuelle) /
            S_OUVREES_PAR_AN
        )} h / semaine en plus*`
      : "";
  const repasseNbPassagesParSemaine =
    repasseProposition?.freqAnnuelle && repasseProposition.hParPassage
      ? `${formatNumber(
          repasseProposition.freqAnnuelle / S_OUVREES_PAR_AN
        )}  passage(s) de ${repasseProposition.hParPassage} h / semaine`
      : "";
  const samediPrixAnnuel = samediDimancheProposition?.prixAnnuelSamedi
    ? `${formatNumber(samediDimancheProposition.prixAnnuelSamedi)} € / an`
    : "Non proposé";
  const samediNbPassagesParSemaine = samediDimancheProposition?.hParPassage
    ? `1 passage de ${samediDimancheProposition.hParPassage} h / semaine en plus`
    : "";
  const dimanchePrixAnnuel = samediDimancheProposition?.prixAnnuelDimanche
    ? `${formatNumber(samediDimancheProposition.prixAnnuelDimanche)} € / an`
    : "Non proposé";
  const diamncheNbPassagesParSemaine = samediDimancheProposition?.hParPassage
    ? `1 passage de ${samediDimancheProposition.hParPassage} h / semaine en plus`
    : "";

  const vitreriePrixAnnuel = vitrerieProposition?.prixParPassage
    ? `${formatNumber(
        vitrerieProposition.prixParPassage * nettoyage.nbPassageVitrerie
      )} € /an`
    : "Non proposé";
  const nbPassagesVitrerie = vitrerieProposition?.prixParPassage
    ? `${nettoyage.nbPassageVitrerie} passages / an`
    : "";

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {repasseProposition && (
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center text-base p-4">
            Repasse sanitaire
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.repasseSelected
                ? "ring-4 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() =>
              handleClickProposition("repasse", repasseProposition.prixAnnuel)
            }
          >
            <Checkbox
              checked={nettoyage.repasseSelected}
              onCheckedChange={() =>
                handleClickProposition("repasse", repasseProposition.prixAnnuel)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">{repassePrixAnnuel}</p>
              <p className="text-base">{repasseHParSemaine}</p>
              <p className="text-xs">{repasseNbPassagesParSemaine}</p>
            </div>
          </div>
        </div>
      )}

      {samediDimancheProposition && (
        <div className="flex border-b flex-1 ">
          <div className="flex w-1/4 items-center justify-center text-base text-center p-4">
            Nettoyage supplémentaire tous les Samedi
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.samediSelected
                ? "ring-4 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() =>
              handleClickProposition(
                "samedi",
                samediDimancheProposition.prixAnnuelSamedi
              )
            }
          >
            <Checkbox
              checked={nettoyage.samediSelected}
              onCheckedChange={() =>
                handleClickProposition(
                  "samedi",
                  samediDimancheProposition.prixAnnuelSamedi
                )
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">{samediPrixAnnuel}</p>
              <p className="text-sm">{samediNbPassagesParSemaine}</p>
            </div>
          </div>
        </div>
      )}
      {samediDimancheProposition && (
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center text-base text-center p-4">
            Nettoyage supplémentaire tous les Dimanche
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.dimancheSelected
                ? "ring-4 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() =>
              handleClickProposition(
                "dimanche",
                samediDimancheProposition.prixAnnuelDimanche
              )
            }
          >
            <Checkbox
              checked={nettoyage.dimancheSelected}
              onCheckedChange={() =>
                handleClickProposition(
                  "dimanche",
                  samediDimancheProposition.prixAnnuelDimanche
                )
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">{dimanchePrixAnnuel}</p>
              <p className="text-sm">{diamncheNbPassagesParSemaine}</p>
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
                  value={nettoyage.nbPassageVitrerie}
                  min={1}
                  max={24}
                  step={1}
                  onChange={handleChangeNbPassageVitrerie}
                  className={`w-16 ${
                    nettoyage.nbPassageVitrerie === 2 ? "text-destructive" : ""
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
              nettoyage.vitrerieSelected
                ? "ring-4 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() =>
              handleClickProposition(
                "vitrerie",
                vitrerieProposition.prixParPassage * nettoyage.nbPassageVitrerie
              )
            }
          >
            <Checkbox
              checked={nettoyage.vitrerieSelected}
              onCheckedChange={() =>
                handleClickProposition(
                  "vitrerie",
                  vitrerieProposition.prixParPassage *
                    nettoyage.nbPassageVitrerie
                )
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">{vitreriePrixAnnuel}</p>
              <p className="text-sm">{nbPassagesVitrerie}</p>
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
