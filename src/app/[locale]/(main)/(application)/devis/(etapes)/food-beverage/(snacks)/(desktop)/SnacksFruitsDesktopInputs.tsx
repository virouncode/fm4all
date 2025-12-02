import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_EFFECTIF } from "@/constants/constants";
import { TypesSnacksFruitsType } from "@/constants/typesSnacksFruits";
import { useProspectStore } from "@/stores/prospectStore";
import { useSnacksFruitsStore } from "@/stores/snacksFruitsStore";
import { useTranslations } from "next-intl";

type SnacksFruitsDesktopInputsProps = {
  handleCheck: (type: TypesSnacksFruitsType) => void;
  handleChangeNbPersonnes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nbPersonnes: number;
};

const SnacksFruitsDesktopInputs = ({
  handleCheck,
  handleChangeNbPersonnes,
  nbPersonnes,
}: SnacksFruitsDesktopInputsProps) => {
  const t = useTranslations("DevisPage");
  const tSnacks = useTranslations("DevisPage.foodBeverage.snacks");
  const prospect = useProspectStore((s) => s.prospect);
  const snacksFruits = useSnacksFruitsStore((s) => s.snacksFruits);
  return (
    <form className="flex w-2/3 items-center gap-8 py-1">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.infos.choix.includes("fruits")}
            onCheckedChange={() => handleCheck("fruits")}
            className="bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground font-bold"
            id="fruits"
            aria-label={tSnacks("selectionner-fruits")}
          />
          <Label htmlFor={`fruits`} className="text-sm">
            {tSnacks("fruits")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.infos.choix.includes("snacks")}
            onCheckedChange={() => handleCheck("snacks")}
            className="bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground font-bold"
            id="snacks"
            aria-label={tSnacks("selectionner-snacks")}
            data-testid="snacks-checkbox"
          />
          <Label htmlFor={`snacks`} className="text-sm">
            {tSnacks("snacks")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.infos.choix.includes("boissons")}
            onCheckedChange={() => handleCheck("boissons")}
            className="bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground font-bold"
            id="boissons"
            aria-label={tSnacks("selectionner-boissons")}
            data-testid="boissons-checkbox"
          />
          <Label htmlFor={`boissons`} className="text-sm">
            {tSnacks("boissons")}
          </Label>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          className={`w-full max-w-xs min-w-20 ${
            snacksFruits.quantites.nbPersonnes === prospect.effectif
              ? "text-destructive"
              : ""
          }`}
          type="number"
          min={1}
          max={MAX_EFFECTIF}
          step={1}
          value={nbPersonnes || ""}
          onChange={handleChangeNbPersonnes}
          id={`nbPersonnesFood`}
        />
        <Label htmlFor={`nbPersonnesFood`} className="text-sm">
          {t("personnes")}
        </Label>
      </div>
    </form>
  );
};

export default SnacksFruitsDesktopInputs;
