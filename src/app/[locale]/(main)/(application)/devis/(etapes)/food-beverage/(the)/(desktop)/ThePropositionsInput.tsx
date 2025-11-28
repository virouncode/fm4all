import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_EFFECTIF } from "@/constants/constants";
import { useTranslations } from "next-intl";
import React from "react";

type ThePropositionsInputProps = {
  nbPersonnes: number;
  effectif: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ThePropositionsInput = ({
  nbPersonnes,
  effectif,
  handleChange,
}: ThePropositionsInputProps) => {
  const t = useTranslations("DevisPage");
  const tThe = useTranslations("DevisPage.foodBeverage.the");
  return (
    <div className="flex w-full flex-col gap-6 p-4">
      <div className="flex w-full items-center justify-center gap-4">
        <Input
          type="number"
          value={nbPersonnes || ""}
          min={1}
          max={MAX_EFFECTIF}
          step={1}
          onChange={handleChange}
          className={`w-16 ${
            nbPersonnes === Math.round(effectif * 0.15)
              ? "text-destructive"
              : ""
          }`}
        />
        <Label htmlFor="nbDistribEmp" className="text-sm">
          {t("personnes")}
        </Label>
      </div>
      <p className="text-destructive px-2 text-center text-xs italic">
        {tThe(
          "les-quantites-sont-estimees-pour-vous-environ-15-de-votre-effectif-mais-vous-pouvez-les-changer",
        )}
      </p>
    </div>
  );
};

export default ThePropositionsInput;
