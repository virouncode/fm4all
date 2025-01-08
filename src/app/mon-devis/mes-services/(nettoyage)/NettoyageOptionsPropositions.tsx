import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { ChangeEvent, useContext } from "react";

type NettoyageOptionsPropositionsProps = {
  nettoyageProposition?: {
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    id: number;
    nomEntreprise: string;
    slogan: string | null;
    createdAt: Date;
    hParPassage: number;
    tauxHoraire: number;
    surface: number;
    prixAnnuel: number;
    freqAnnuelle: number;
    prixAnnuelSamedi: number;
    prixAnnuelDimanche: number;
  } | null;

  repasseProposition?: {
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    id: number;
    nomEntreprise: string;
    slogan: string | null;
    createdAt: Date;
    hParPassage: number;
    tauxHoraire: number;
    surface: number;
    prixAnnuel: number;
    freqAnnuelle: number;
  } | null;

  vitrerieProposition?: {
    fournisseurId: number;
    id: number;
    nomEntreprise: string;
    slogan: string | null;
    createdAt: Date;
    tauxHoraire: number;
    cadenceVitres: number;
    cadenceCloisons: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixVitrerieParPassage: number;
    prixCloisonsParPassage: number;
  } | null;
};

const NettoyageOptionsPropositions = ({
  nettoyageProposition,
  repasseProposition,
  vitrerieProposition,
}: NettoyageOptionsPropositionsProps) => {
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const { setTotalNettoyage } = useContext(TotalNettoyageContext);
  const color =
    nettoyageProposition?.gamme === "essentiel"
      ? "fm4allessential"
      : nettoyageProposition?.gamme === "confort"
      ? "fm4allcomfort"
      : "fm4allexcellence";

  const handleClickOption = (type: string, propositionId: number) => {
    switch (type) {
      case "repasse":
        if (
          nettoyage.repassePropositionId &&
          nettoyage.repassePropositionId === propositionId
        ) {
          setNettoyage((prev) => ({
            ...prev,
            repassePropositionId: null,
          }));
          setTotalNettoyage((prev) => ({
            ...prev,
            prixRepasse: null,
          }));
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          repassePropositionId: propositionId,
        }));
        setTotalNettoyage((prev) => ({
          ...prev,
          prixRepasse: repasseProposition?.prixAnnuel as number,
        }));
        break;
      case "vitrerie":
        if (
          nettoyage.vitreriePropositionId &&
          nettoyage.vitreriePropositionId === propositionId
        ) {
          setNettoyage((prev) => ({
            ...prev,
            vitreriePropositionId: null,
          }));
          setTotalNettoyage((prev) => ({
            ...prev,
            prixVitrerie: null,
          }));
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          vitreriePropositionId: propositionId,
        }));
        setTotalNettoyage((prev) => ({
          ...prev,
          prixVitrerie: vitrerieProposition
            ? vitrerieProposition.prixVitrerieParPassage +
                vitrerieProposition.prixCloisonsParPassage >
              vitrerieProposition.minFacturation
              ? (vitrerieProposition.prixVitrerieParPassage / 10000 +
                  vitrerieProposition.prixCloisonsParPassage / 10000) *
                nettoyage.nbPassageVitrerie
              : Math.round(
                  (vitrerieProposition.minFacturation / 10000) *
                    nettoyage.nbPassageVitrerie
                )
            : null,
        }));
        break;
      case "samedi":
        if (
          nettoyage.samediPropositionId &&
          nettoyage.samediPropositionId === propositionId
        ) {
          setNettoyage((prev) => ({
            ...prev,
            samediPropositionId: null,
          }));
          setTotalNettoyage((prev) => ({
            ...prev,
            prixSamedi: null,
          }));
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          samediPropositionId: propositionId,
        }));
        setTotalNettoyage((prev) => ({
          ...prev,
          prixSamedi: nettoyageProposition?.prixAnnuelSamedi as number,
        }));
        break;
      case "dimanche":
        if (
          nettoyage.dimanchePropositionId &&
          nettoyage.dimanchePropositionId === propositionId
        ) {
          setNettoyage((prev) => ({
            ...prev,
            dimanchePropositionId: null,
          }));
          setTotalNettoyage((prev) => ({
            ...prev,
            prixDimanche: null,
          }));
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          dimanchePropositionId: propositionId,
        }));
        setTotalNettoyage((prev) => ({
          ...prev,
          prixDimanche: nettoyageProposition?.prixAnnuelDimanche as number,
        }));
        break;
    }
  };

  const handleChangeNbPassageVitrerie = (e: ChangeEvent<HTMLInputElement>) => {
    setNettoyage((prev) => ({
      ...prev,
      nbPassageVitrerie: e.target.value ? parseInt(e.target.value) : 2,
    }));
  };

  const repassePrixAnnuel = repasseProposition?.prixAnnuel
    ? `${formatNumber(repasseProposition.prixAnnuel)} € /an`
    : "Non proposé";
  const repasseHParSemaine =
    repasseProposition?.hParPassage && repasseProposition?.freqAnnuelle
      ? `${formatNumber(
          (repasseProposition.hParPassage * repasseProposition.freqAnnuelle) /
            52.008
        )} h / semaine en plus*`
      : "";
  const repasseNbPassagesParSemaine =
    repasseProposition?.freqAnnuelle && repasseProposition.hParPassage
      ? `${formatNumber(
          repasseProposition.freqAnnuelle / 52.008
        )}  passage(s) de ${repasseProposition.hParPassage} h / semaine`
      : "";
  const samediPrixAnnuel = nettoyageProposition?.prixAnnuelSamedi
    ? `${formatNumber(nettoyageProposition.prixAnnuelSamedi)} € / an`
    : "Non proposé";
  const samediNbPassagesParSemaine = nettoyageProposition?.hParPassage
    ? `1 passage de ${nettoyageProposition.hParPassage} h / semaine en plus`
    : "";
  const dimanchePrixAnnuel = nettoyageProposition?.prixAnnuelDimanche
    ? `${formatNumber(nettoyageProposition.prixAnnuelDimanche)} € / an`
    : "Non proposé";
  const diamncheNbPassagesParSemaine = nettoyageProposition?.hParPassage
    ? `1 passage de ${nettoyageProposition.hParPassage} h / semaine en plus`
    : "";
  let vitreriePrixAnnuel = "";
  if (
    vitrerieProposition?.prixVitrerieParPassage &&
    vitrerieProposition?.prixCloisonsParPassage
  ) {
    vitreriePrixAnnuel =
      vitrerieProposition.prixVitrerieParPassage +
        vitrerieProposition.prixCloisonsParPassage >
      vitrerieProposition.minFacturation
        ? `${formatNumber(
            (vitrerieProposition.prixVitrerieParPassage +
              vitrerieProposition.prixCloisonsParPassage) *
              nettoyage.nbPassageVitrerie
          )} € / an`
        : `${Math.round(
            vitrerieProposition.minFacturation * nettoyage.nbPassageVitrerie
          )} € / an`;
  } else {
    vitreriePrixAnnuel = "Non proposé";
  }

  const nbPassagesVitrerie =
    vitrerieProposition?.prixVitrerieParPassage &&
    vitrerieProposition?.prixCloisonsParPassage
      ? `${nettoyage.nbPassageVitrerie} passages / an`
      : "";

  if (!nettoyage.propositionId) {
    return (
      <div className="h-full flex flex-col border rounded-xl items-center justify-center">
        <p className="text-lg text-center italic">
          Veuillez d&apos;abord choisir une formule Nettoyage et propreté
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {repasseProposition && (
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center text-lg">
            Repasse sanitaire
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.repassePropositionId === repasseProposition.id
                ? "ring-2 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() => handleClickOption("repasse", repasseProposition.id)}
          >
            <Checkbox
              checked={nettoyage.repassePropositionId === repasseProposition.id}
              onCheckedChange={() =>
                handleClickOption("repasse", repasseProposition.id)
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

      {nettoyageProposition && (
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center text-lg">
            Samedi
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.samediPropositionId === nettoyageProposition.id
                ? "ring-2 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() => handleClickOption("samedi", nettoyageProposition.id)}
          >
            <Checkbox
              checked={
                nettoyage.samediPropositionId === nettoyageProposition.id
              }
              onCheckedChange={() =>
                handleClickOption("samedi", nettoyageProposition.id)
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
      {nettoyageProposition && (
        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center text-lg">
            Dimanche
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.dimanchePropositionId === nettoyageProposition.id
                ? "ring-2 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() =>
              handleClickOption("dimanche", nettoyageProposition.id)
            }
          >
            <Checkbox
              checked={
                nettoyage.dimanchePropositionId === nettoyageProposition.id
              }
              onCheckedChange={() =>
                handleClickOption("dimanche", nettoyageProposition.id)
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
          <div className="flex w-1/4 items-center justify-center">
            <div className="flex flex-col gap-4 items-center justify-center w-full">
              <p className="text-lg">Vitrerie*</p>
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
            </div>
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              nettoyage.vitreriePropositionId === vitrerieProposition.id
                ? "ring-2 ring-inset ring-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() =>
              handleClickOption("vitrerie", vitrerieProposition.id)
            }
          >
            <Checkbox
              checked={
                nettoyage.vitreriePropositionId === vitrerieProposition.id
              }
              onCheckedChange={() =>
                handleClickOption("vitrerie", vitrerieProposition.id)
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
//heures  par semaine = heures  par an / (nombre de semaines ouvrées dans l'année: 52.008 = 21.67*12/5)
