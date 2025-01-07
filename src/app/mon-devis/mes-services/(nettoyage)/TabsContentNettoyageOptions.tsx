import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

type TabsContentNettoyageOptionsProps = {
  nettoyageProposition: {
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
  };

  repasseProposition: {
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
  };

  vitrerieProposition: {
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
  };
};

const TabsContentNettoyageOptions = ({
  nettoyageProposition,
  repasseProposition,
  vitrerieProposition,
}: TabsContentNettoyageOptionsProps) => {
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
  const color =
    nettoyageProposition.gamme === "essentiel"
      ? "fm4allessential"
      : nettoyageProposition.gamme === "confort"
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
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          repassePropositionId: propositionId,
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
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          vitreriePropositionId: propositionId,
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
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          samediPropositionId: propositionId,
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
          return;
        }
        setNettoyage((prev) => ({
          ...prev,
          dimanchePropositionId: propositionId,
        }));
        break;
    }
  };

  const handleChangeNbPassageVitrerie = (value: number[]) => {
    setNettoyage((prev) => ({
      ...prev,
      nbPassageVitrerie: value[0],
    }));
  };

  return (
    <TabsContent value="options" className="flex-1">
      <div className="h-full flex flex-col border rounded-xl overflow-hidden">
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
              <p className="font-bold">
                {formatNumber(repasseProposition.prixAnnuel)} € / an
              </p>
              <p className="text-base">
                {formatNumber(
                  ((repasseProposition.hParPassage / 10000) *
                    repasseProposition.freqAnnuelle) /
                    10000 /
                    52.008
                )}{" "}
                h / semaine en plus*
              </p>
              <p className="text-xs">
                {formatNumber(
                  repasseProposition.freqAnnuelle / (10000 * 52.008)
                )}{" "}
                passage(s) de {repasseProposition.hParPassage / 10000}h /
                semaine
              </p>
            </div>
          </div>
        </div>

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
              <p className="font-bold">
                {formatNumber(nettoyageProposition.prixAnnuelSamedi)} € / an
              </p>
              <p className="text-sm">
                1 passage de {nettoyageProposition.hParPassage / 10000}h /
                semaine en plus
              </p>
            </div>
          </div>
        </div>
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
              <p className="font-bold">
                {formatNumber(nettoyageProposition.prixAnnuelDimanche)} € / an
              </p>
              <p className="text-sm">
                1 passage de {nettoyageProposition.hParPassage / 10000}h /
                semaine en plus
              </p>
            </div>
          </div>
        </div>

        <div className="flex border-b flex-1">
          <div className="flex w-1/4 items-center justify-center">
            <div className="flex flex-col gap-4 items-center justify-center w-full">
              <p className="text-lg">Vitrerie</p>
              <div className="flex flex-col items-center w-full">
                <Slider
                  value={[nettoyage.nbPassageVitrerie]}
                  min={1}
                  max={24}
                  step={1}
                  onValueChange={handleChangeNbPassageVitrerie}
                  className="w-3/4"
                />
                <label htmlFor="nbDePassagesVitrerie" className="text-sm">
                  {nettoyage.nbPassageVitrerie} passages / an
                </label>
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
              <p className="font-bold">
                {vitrerieProposition.prixVitrerieParPassage +
                  vitrerieProposition.prixCloisonsParPassage >
                vitrerieProposition.minFacturation
                  ? formatNumber(
                      (vitrerieProposition.prixVitrerieParPassage / 10000 +
                        vitrerieProposition.prixCloisonsParPassage / 10000) *
                        nettoyage.nbPassageVitrerie
                    )
                  : Math.round(
                      (vitrerieProposition.minFacturation / 10000) *
                        nettoyage.nbPassageVitrerie
                    )}{" "}
                € / an
              </p>
              <p className="text-sm">
                {nettoyage.nbPassageVitrerie} passages / an
              </p>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

export default TabsContentNettoyageOptions;

//heures  par an = heures par passage * frequence annuelle
//heures  par semaine = heures  par an / (nombre de semaines ouvrées dans l'année: 52.008 = 21.67*12/5)
