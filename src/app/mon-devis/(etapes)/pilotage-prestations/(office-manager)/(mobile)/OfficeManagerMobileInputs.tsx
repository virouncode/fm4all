import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { useContext } from "react";

type OfficeManagerMobileInputsProps = {
  demiJParSemaineEssentiel: number | null;
  handleChangeDemiJParSemaine: (
    value: number[],
    demiTauxJournalier: number | null
  ) => void;
  handleChangeRemplace: (value: string) => void;
  handleCheckPremium: (checked: boolean) => void;
};

const OfficeManagerMobileInputs = ({
  demiJParSemaineEssentiel,
  handleChangeDemiJParSemaine,
  handleChangeRemplace,
  handleCheckPremium,
}: OfficeManagerMobileInputsProps) => {
  const { officeManager } = useContext(OfficeManagerContext);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p>
          Indiquez le <strong>nombre de demi-journées par semaine</strong>{" "}
          souhaité :
        </p>
        <div className="flex w-full p-2 gap-2">
          <Slider
            value={[
              (officeManager.quantites.demiJParSemaine ||
                demiJParSemaineEssentiel) ??
                1,
            ]}
            onValueChange={(value: number[]) =>
              handleChangeDemiJParSemaine(
                value,
                officeManager.infos.premium
                  ? officeManager.prix.demiTjmPremium
                  : officeManager.prix.demiTjm
              )
            }
            min={1}
            max={20}
            step={1}
            title="Nombre de demi-journées par semaine"
            className="w-1/2"
          />
          <Label htmlFor="demiJParSemaine" className="text-sm w-1/2">
            {officeManager.quantites.demiJParSemaine ??
              demiJParSemaineEssentiel}{" "}
            demi journée(s)
          </Label>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          L&apos;office manager doit-il{" "}
          <strong>
            parler l&apos;anglais et avoir une expertise supérieure
          </strong>{" "}
          ?
        </p>
        <div className="flex items-center gap-2">
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
      </div>
      <div className="flex flex-col gap-4">
        <p>
          L&apos;office manager doit-il être{" "}
          <strong>remplacé pendant ses congés</strong> ?
        </p>
        <RadioGroup
          onValueChange={handleChangeRemplace}
          value={officeManager.infos.remplace ? "remplace" : "non remplace"}
          className="flex gap-4 flex-col"
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
    </div>
  );
};

export default OfficeManagerMobileInputs;
