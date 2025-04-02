import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TypesSnacksFruitsType } from "@/constants/typesSnacksFruits";
import { ClientContext } from "@/context/ClientProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { MAX_EFFECTIF } from "../../../locaux/MesLocaux";

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
  const { client } = useContext(ClientContext);
  const { snacksFruits } = useContext(SnacksFruitsContext);
  return (
    <form className="w-2/3 flex items-center gap-8">
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.infos.choix.includes("fruits")}
            onCheckedChange={() => handleCheck("fruits")}
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
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
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            id="snacks"
            aria-label={tSnacks("selectionner-snacks")}
          />
          <Label htmlFor={`snacks`} className="text-sm">
            {tSnacks("snacks")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={snacksFruits.infos.choix.includes("boissons")}
            onCheckedChange={() => handleCheck("boissons")}
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            id="boissons"
            aria-label={tSnacks("selectionner-boissons")}
          />
          <Label htmlFor={`boissons`} className="text-sm">
            {tSnacks("boissons")}
          </Label>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <Input
          className={`w-full max-w-xs min-w-20 ${
            snacksFruits.quantites.nbPersonnes === client.effectif
              ? "text-fm4alldestructive"
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
