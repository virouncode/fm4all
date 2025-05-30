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
import { useTranslations } from "next-intl";
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
  const tOfficeManager = useTranslations("DevisPage.pilotage.officeManager");
  const { officeManager } = useContext(OfficeManagerContext);
  const tooltipText = tOfficeManager(
    "selectionnez-le-nombre-de-jour-qui-vous-convient-en-fonction-des-taches-a-realiser"
  );
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
                title={tOfficeManager("nombre-de-demi-journees-par-semaine")}
              />
              <Label htmlFor="demiJParSemaine" className="text-sm flex-1">
                {officeManager.quantites.demiJParSemaine ??
                  demiJParSemaineEssentiel}{" "}
                {tOfficeManager("demi-journee-s-semaine")}
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
          aria-label={tOfficeManager("selectionner-loption-premium")}
        />
        <Label htmlFor="premium" className="text-sm flex-1">
          {tOfficeManager("anglais-courant-ou-expertise-sup")}
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
              title={tOfficeManager("remplace-pendant-conges")}
              id={"remplace"}
            />
            <Label htmlFor="remplace">
              {tOfficeManager("remplace-pendant-conges")}
            </Label>
          </div>
          <div className="flex gap-2 items-center">
            <RadioGroupItem
              value={"non remplace"}
              title={tOfficeManager("non-remplace-pendant-conges")}
              id={"non_remplace"}
            />
            <Label htmlFor="non_remplace">
              {tOfficeManager("non-remplace-pendant-conges")}
            </Label>
          </div>
        </RadioGroup>
      </div>
    </>
  );
};

export default OfficeManagerInputs;
