import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/formatNumber";
import { SelectNettoyageRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectNettoyageVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { useState } from "react";

type TabsContentNettoyageOptionsProps = {
  filteredNettoyageProposition: SelectNettoyageTarifsType & {
    freqAnnuelle: number;
    prixAnnuel: number;
    prixAnnuelSamedi: number;
    prixAnnuelDimanche: number;
  };
  filteredRepasseProposition?: SelectNettoyageRepasseTarifsType & {
    prixAnnuel: number;
    freqAnnuelle: number;
  };
  filteredVitrerieProposition?: SelectNettoyageVitrerieTarifsType & {
    prixVitrerieParPassage: number;
    prixCloisonsParPassage: number;
  };
  selectedSamediPropositionId: number | null;
  selectedDimanchePropositionId: number | null;
  selectedRepassePropositionId: number | null;
  selectedVitreriePropositionId: number | null;
  handleClickOption: (type: string, propositionId: number) => void;
};

const TabsContentNettoyageOptions = ({
  filteredNettoyageProposition,
  filteredRepasseProposition,
  filteredVitrerieProposition,
  selectedRepassePropositionId,
  selectedSamediPropositionId,
  selectedDimanchePropositionId,
  selectedVitreriePropositionId,
  handleClickOption,
}: TabsContentNettoyageOptionsProps) => {
  const [nbDePassagesVitrerie, setNbDePassagesVitrerie] = useState<number>(2);
  const color =
    filteredNettoyageProposition.gamme === "essentiel"
      ? "fm4allessential"
      : filteredNettoyageProposition.gamme === "confort"
      ? "fm4allcomfort"
      : "fm4allexcellence";
  return (
    <TabsContent value="options" className="flex-1">
      <div className="h-full flex flex-col border rounded-xl overflow-hidden">
        {filteredRepasseProposition && (
          <div
            className="flex border-b flex-1"
            key={"repasse" + filteredRepasseProposition.id}
          >
            <div className="flex w-1/4 items-center justify-center text-lg">
              Repasse sanitaire
            </div>
            <div
              className={`flex w-3/4 items-center justify-center ${
                selectedRepassePropositionId === filteredRepasseProposition.id
                  ? "border-2 border-destructive"
                  : ""
              } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
              onClick={() =>
                handleClickOption("repasse", filteredRepasseProposition.id)
              }
            >
              <Checkbox
                checked={
                  selectedRepassePropositionId === filteredRepasseProposition.id
                }
                onCheckedChange={() =>
                  handleClickOption("repasse", filteredRepasseProposition.id)
                }
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p className="font-bold">
                  {formatNumber(filteredRepasseProposition.prixAnnuel)} € / an
                </p>
                <p className="text-base">
                  {formatNumber(
                    ((filteredRepasseProposition.hParPassage / 10000) *
                      filteredRepasseProposition.freqAnnuelle) /
                      10000 /
                      52.008
                  )}{" "}
                  h / semaine en plus*
                </p>
                <p className="text-xs">
                  {formatNumber(
                    filteredRepasseProposition.freqAnnuelle / (10000 * 52.008)
                  )}{" "}
                  passage(s) de {filteredRepasseProposition.hParPassage / 10000}
                  h / semaine
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className="flex border-b flex-1"
          key={"samedi" + filteredNettoyageProposition.id}
        >
          <div className="flex w-1/4 items-center justify-center text-lg">
            Samedi
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              selectedSamediPropositionId === filteredNettoyageProposition.id
                ? "border-2 border-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() =>
              handleClickOption("samedi", filteredNettoyageProposition.id)
            }
          >
            <Checkbox
              checked={
                selectedSamediPropositionId === filteredNettoyageProposition.id
              }
              onCheckedChange={() =>
                handleClickOption("samedi", filteredNettoyageProposition.id)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">
                {formatNumber(filteredNettoyageProposition.prixAnnuelSamedi)} €
                / an
              </p>
              <p className="text-sm">
                1 passage de {filteredNettoyageProposition.hParPassage / 10000}h
                / semaine en plus
              </p>
            </div>
          </div>
        </div>
        <div
          className="flex border-b flex-1"
          key={"dimanche" + filteredNettoyageProposition.id}
        >
          <div className="flex w-1/4 items-center justify-center text-lg">
            Dimanche
          </div>
          <div
            className={`flex w-3/4 items-center justify-center ${
              selectedDimanchePropositionId === filteredNettoyageProposition.id
                ? "border-2 border-destructive"
                : ""
            } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
            onClick={() =>
              handleClickOption("dimanche", filteredNettoyageProposition.id)
            }
          >
            <Checkbox
              checked={
                selectedDimanchePropositionId ===
                filteredNettoyageProposition.id
              }
              onCheckedChange={() =>
                handleClickOption("dimanche", filteredNettoyageProposition.id)
              }
              className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            />
            <div>
              <p className="font-bold">
                {formatNumber(filteredNettoyageProposition.prixAnnuelDimanche)}{" "}
                € / an
              </p>
              <p className="text-sm">
                1 passage de {filteredNettoyageProposition.hParPassage / 10000}h
                / semaine en plus
              </p>
            </div>
          </div>
        </div>
        {filteredVitrerieProposition && (
          <div
            className="flex border-b flex-1"
            key={"vitrerie" + filteredVitrerieProposition.id}
          >
            <div className="flex w-1/4 items-center justify-center">
              <div className="flex flex-col gap-4 items-center justify-center w-full">
                <p className="text-lg">Vitrerie</p>
                <div className="flex flex-col items-center w-full">
                  <Slider
                    value={[nbDePassagesVitrerie]}
                    min={1}
                    max={24}
                    step={1}
                    onValueChange={(number) =>
                      setNbDePassagesVitrerie(number[0])
                    }
                    className="w-3/4"
                  />
                  <label htmlFor="nbDePassagesVitrerie" className="text-sm">
                    {nbDePassagesVitrerie} passages / an
                  </label>
                </div>
              </div>
            </div>
            <div
              className={`flex w-3/4 items-center justify-center ${
                selectedVitreriePropositionId === filteredVitrerieProposition.id
                  ? "border-2 border-destructive"
                  : ""
              } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
              onClick={() =>
                handleClickOption("vitrerie", filteredVitrerieProposition.id)
              }
            >
              <Checkbox
                checked={
                  selectedVitreriePropositionId ===
                  filteredVitrerieProposition.id
                }
                onCheckedChange={() =>
                  handleClickOption("vitrerie", filteredVitrerieProposition.id)
                }
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p className="font-bold">
                  {filteredVitrerieProposition.prixVitrerieParPassage +
                    filteredVitrerieProposition.prixCloisonsParPassage >
                  filteredVitrerieProposition.minFacturation
                    ? formatNumber(
                        (filteredVitrerieProposition.prixVitrerieParPassage /
                          10000 +
                          filteredVitrerieProposition.prixCloisonsParPassage /
                            10000) *
                          nbDePassagesVitrerie
                      )
                    : Math.round(
                        (filteredVitrerieProposition.minFacturation / 10000) *
                          nbDePassagesVitrerie
                      )}{" "}
                  € / an
                </p>
                <p className="text-sm">{nbDePassagesVitrerie} passages / an</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default TabsContentNettoyageOptions;

//heures  par an = heures par passage * frequence annuelle
//heures  par semaine = heures  par an / (nombre de semaines ouvrées dans l'année: 52.008 = 21.67*12/5)
