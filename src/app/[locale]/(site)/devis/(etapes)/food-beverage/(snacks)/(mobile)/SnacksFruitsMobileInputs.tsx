import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_EFFECTIF } from "@/constants/constants";
import { TypesSnacksFruitsType } from "@/constants/typesSnacksFruits";
import { ClientContext } from "@/context/ClientProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useContext } from "react";

type SnacksFruitsMobileInputsProps = {
  handleCheck: (type: TypesSnacksFruitsType) => void;
  handleChangeNbPersonnes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nbPersonnes: number;
  handleIncrement: () => void;
  handleDecrement: () => void;
};

const SnacksFruitsMobileInputs = ({
  handleCheck,
  handleChangeNbPersonnes,
  nbPersonnes,
  handleIncrement,
  handleDecrement,
}: SnacksFruitsMobileInputsProps) => {
  const t = useTranslations("DevisPage");
  const tSnacks = useTranslations("DevisPage.foodBeverage.snacks");
  const { client } = useContext(ClientContext);
  const { snacksFruits } = useContext(SnacksFruitsContext);

  return (
    <div className="flex flex-col gap-8">
      <p className="font-bold text-xl hyphens-auto">
        {tSnacks("fruits-snacks-et-boissons")}
      </p>
      <div className="flex flex-col gap-4">
        <p>
          {t("indiquez-les")}{" "}
          <strong>{tSnacks("produits-que-vous-souhaitez-recevoir")}</strong>{" "}
          {tSnacks("dans-votre-panier-hebdomadaire")}
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <div className="flex gap-4 ">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={snacksFruits.infos.choix.includes("fruits")}
                onCheckedChange={() => handleCheck("fruits")}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                id="fruits"
                aria-label={tSnacks("selectionner-fruits")}
              />
              <Label htmlFor={`fruits`} className="text-base">
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
              <Label htmlFor={`snacks`} className="text-base">
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
              <Label htmlFor={`boissons`} className="text-base">
                {tSnacks("boissons")}
              </Label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          {t("indiquez-le")}{" "}
          <strong>{t("nombre-de-personnes").toLowerCase()}</strong> :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbPersonnesFood" className="text-sm flex-1">
            {t("nombre-de-personnes")}
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
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
              <Button
                variant="outline"
                title={t("diminuer-le-nombre-de-personnes")}
                onClick={handleDecrement}
                disabled={nbPersonnes === 0}
              >
                <Minus />
              </Button>
              <Button
                variant="outline"
                title={t("augmenter-le-nombre-de-personnes")}
                onClick={handleIncrement}
                disabled={nbPersonnes === MAX_EFFECTIF}
              >
                <Plus />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnacksFruitsMobileInputs;
