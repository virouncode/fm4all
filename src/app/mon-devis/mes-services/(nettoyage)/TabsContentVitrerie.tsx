import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/formatNumber";
import { SelectNettoyageVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { useState } from "react";

type TabsContentVitrerieProps = {
  filteredVitrerieProposition: SelectNettoyageVitrerieTarifsType & {
    prixVitrerieParPassage: number;
    prixCloisonsParPassage: number;
  };
  handleClickProposition: (propositionId: number) => void;
  selectedVitreriePropositionId: number | null;
};

const TabsContentVitrerie = ({
  filteredVitrerieProposition,
  handleClickProposition,
  selectedVitreriePropositionId,
}: TabsContentVitrerieProps) => {
  const [nbDePassagesVitrerie, setNbDePassagesVitrerie] = useState<number>(2);

  return (
    <TabsContent value="vitrerie" className="flex-1">
      <div className="w-1/3 flex gap-4 mb-2 items-center ml-auto justify-end">
        <Slider
          value={[nbDePassagesVitrerie]}
          min={1}
          max={24}
          step={1}
          onValueChange={(number) => setNbDePassagesVitrerie(number[0])}
          className="flex-1"
        />
        <label htmlFor="nbDePassagesVitrerie">
          {nbDePassagesVitrerie} passages par an
        </label>
      </div>

      <div className="h-full flex flex-col border rounded-xl overflow-hidden">
        <div
          className="flex border-b flex-1"
          key={filteredVitrerieProposition.fournisseurId}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex w-1/4 items-center justify-center">
                  {filteredVitrerieProposition.nomEntreprise}
                </div>
              </TooltipTrigger>
              {filteredVitrerieProposition.slogan && (
                <TooltipContent>
                  <p className="text-sm italic">
                    {filteredVitrerieProposition.slogan}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <div
            className={`flex flex-1 ${
              selectedVitreriePropositionId === filteredVitrerieProposition.id
                ? "border border-destructive"
                : ""
            } bg-slate-200 text-foreground items-center justify-center  text-2xl gap-4 cursor-pointer `}
            onClick={() =>
              handleClickProposition(filteredVitrerieProposition.id)
            }
            key={filteredVitrerieProposition.id}
          >
            <Checkbox
              checked={
                selectedVitreriePropositionId === filteredVitrerieProposition.id
              }
              onCheckedChange={() =>
                handleClickProposition(filteredVitrerieProposition.id)
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
      </div>
    </TabsContent>
  );
};

export default TabsContentVitrerie;

//heures  par an = heures par passage * frequence annuelle
//heures  par semaine = heures  par an / (nombre de semaines ouvrées dans l'année: 52.008 = 21.67*12/5)
