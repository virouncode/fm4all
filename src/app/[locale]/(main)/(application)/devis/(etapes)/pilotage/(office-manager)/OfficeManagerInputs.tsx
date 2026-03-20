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
import { useOfficeManagerStore } from "@/stores/devis/officeManagerStore";
import { useTranslations } from "next-intl";

type OfficeManagerInputsProps = {
  demiJParSemaineEssentiel: number | null;
  handleChangeDemiJParSemaine: (value: number[]) => void;
  handleChangeRemplace: (value: string) => void;
  handleCheckPremium: (checked: boolean) => void;
};

const OfficeManagerInputs = ({
  demiJParSemaineEssentiel,
  handleChangeDemiJParSemaine,
  handleChangeRemplace,
  handleCheckPremium,
}: OfficeManagerInputsProps) => {
  const tOfficeManager = useTranslations("DevisPage.pilotage.officeManager");
  const officeManager = useOfficeManagerStore((s) => s.officeManager);
  const tooltipText = tOfficeManager(
    "selectionnez-le-nombre-de-jour-qui-vous-convient-en-fonction-des-taches-a-realiser",
  );
  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex w-full flex-col items-center gap-2">
              <Slider
                value={[
                  (officeManager.quantites.demiJParSemaine ||
                    demiJParSemaineEssentiel) ??
                    1,
                ]}
                onValueChange={(value: number[]) =>
                  handleChangeDemiJParSemaine(value)
                }
                min={1}
                max={20}
                step={1}
                title={tOfficeManager("nombre-de-demi-journees-par-semaine")}
              />
              <Label htmlFor="demiJParSemaine" className="flex-1 text-sm">
                {officeManager.quantites.demiJParSemaine ??
                  demiJParSemaineEssentiel}{" "}
                {tOfficeManager("demi-journee-s-semaine")}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-60">{tooltipText}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-center justify-center gap-2">
        <Checkbox
          id="premium"
          className="bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground font-bold"
          checked={officeManager.infos.premium}
          onCheckedChange={handleCheckPremium}
          aria-label={tOfficeManager("selectionner-loption-premium")}
        />
        <Label htmlFor="premium" className="flex-1 text-sm">
          {tOfficeManager("anglais-courant-ou-expertise-sup")}
        </Label>
      </div>
      <div>
        <RadioGroup
          onValueChange={handleChangeRemplace}
          value={officeManager.infos.remplace ? "remplace" : "non remplace"}
          className="flex flex-col items-center gap-4"
          name="office_manager_remplacement"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem
              value={"remplace"}
              title={tOfficeManager("remplace-pendant-conges")}
              id={"remplace"}
            />
            <Label htmlFor="remplace">
              {tOfficeManager("remplace-pendant-conges")}
            </Label>
          </div>
          <div className="flex items-center gap-2">
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
