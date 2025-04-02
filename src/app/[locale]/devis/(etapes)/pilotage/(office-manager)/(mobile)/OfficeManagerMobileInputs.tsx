import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("DevisPage");
  const tOfficeManager = useTranslations("DevisPage.pilotage.officeManager");
  const { officeManager } = useContext(OfficeManagerContext);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p>
          {tOfficeManager("loffice-manager-doit-il")}{" "}
          <strong>
            {tOfficeManager(
              "parler-langlais-et-avoir-une-expertise-superieure"
            )}
          </strong>{" "}
          ?
        </p>
        <div className="flex items-center gap-2">
          <Checkbox
            id="premium"
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            checked={officeManager.infos.premium}
            onCheckedChange={handleCheckPremium}
            aria-label={tOfficeManager("selectionner-loption-premium")}
          />
          <Label htmlFor="premium" className="text-base flex-1">
            {tOfficeManager("anglais-courant-ou-expertise-sup")}
          </Label>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          {tOfficeManager("loffice-manager-doit-il-etre")}{" "}
          <strong>{tOfficeManager("remplace-pendant-ses-conges")}</strong> ?
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
              title={tOfficeManager("remplace-pendant-conges")}
              id={"remplace"}
            />
            <Label htmlFor="remplace" className="text-base">
              {tOfficeManager("remplace-pendant-conges")}
            </Label>
          </div>
          <div className="flex gap-2 items-center">
            <RadioGroupItem
              value={"non remplace"}
              title={tOfficeManager("non-remplace-pendant-conges")}
              id={"non_remplace"}
            />
            <Label htmlFor="non_remplace" className="text-base">
              {tOfficeManager("non-remplace-pendant-conges")}
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          {t("indiquez-le")}{" "}
          <strong>
            {tOfficeManager(
              "nombre-de-demi-journees-par-semaine"
            ).toLowerCase()}
          </strong>{" "}
          :
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
            title={tOfficeManager("nombre-de-demi-journees-par-semaine")}
            className="w-1/2"
          />
          <Label htmlFor="demiJParSemaine" className="text-base w-1/2">
            {officeManager.quantites.demiJParSemaine ??
              demiJParSemaineEssentiel}{" "}
            {tOfficeManager("demi-journee-s")}
          </Label>
        </div>
      </div>
    </div>
  );
};

export default OfficeManagerMobileInputs;
