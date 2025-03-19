import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { useContext } from "react";

type OfficeManagerInputsProps = {
  demiJParSemaineEssentiel: number | null;
  handleChangeDemiJParSemaine: (
    value: number[],
    demiTauxJournalier: number | null
  ) => void;
  demiTjm: number | null;
  demiTjmPremium: number | null;
  handleChangeRemplace: (value: string) => void;
  handleCheckPremium: (checked: boolean) => void;
};

const OfficeManagerInputs = ({
  demiJParSemaineEssentiel,
  handleChangeDemiJParSemaine,
  handleChangeRemplace,
  handleCheckPremium,
  demiTjm,
  demiTjmPremium,
}: OfficeManagerInputsProps) => {
  const { officeManager } = useContext(OfficeManagerContext);
  const tooltipText =
    "Sélectionnez le nombre de jour qui vous convient en fonction des tâches à réaliser";
  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex gap-2 items-center flex-col w-full">
              <Slider
                value={[
                  (officeManager.quantites.demiJParSemaine ||
                    demiJParSemaineEssentiel) ??
                    1,
                ]}
                onValueChange={(value: number[]) =>
                  handleChangeDemiJParSemaine(
                    value,
                    officeManager.infos.premium ? demiTjmPremium : demiTjm
                  )
                }
                min={1}
                max={20}
                step={1}
                title="Nombre de demi-journées par semaine"
              />
              <Label htmlFor="demiJParSemaine" className="text-sm flex-1">
                {officeManager.quantites.demiJParSemaine ??
                  demiJParSemaineEssentiel}{" "}
                demi journée(s) / semaine
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-60">{tooltipText}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex gap-2 justify-center items-center">
        <Checkbox
          id="premium"
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          checked={officeManager.infos.premium}
          onCheckedChange={handleCheckPremium}
          aria-label="Sélectionner l'option premium"
        />
        <Label htmlFor="premium" className="text-sm flex-1">
          Anglais courant ou Expertise Sup.
        </Label>
      </div>
      <div>
        <RadioGroup
          onValueChange={handleChangeRemplace}
          value={officeManager.infos.remplace ? "remplace" : "non remplace"}
          className="flex gap-4 flex-col items-center"
          name="office_manager_remplacement"
        >
          <div className="flex gap-2 items-center">
            <RadioGroupItem
              value={"remplace"}
              title={"Remplacé pendant congés"}
              id={"remplace"}
            />
            <Label htmlFor="remplace">Remplacé pendant congés</Label>
          </div>
          <div className="flex gap-2 items-center">
            <RadioGroupItem
              value={"non remplace"}
              title={"Non remplacé pendant congés"}
              id={"non_remplace"}
            />
            <Label htmlFor="non_remplace">Non remplacé pendant congés</Label>
          </div>
        </RadioGroup>
      </div>
    </>
  );
};

export default OfficeManagerInputs;
