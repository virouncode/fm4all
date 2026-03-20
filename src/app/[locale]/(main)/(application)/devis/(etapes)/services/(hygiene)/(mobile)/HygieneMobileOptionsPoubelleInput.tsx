import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_NB_DISTRIB } from "@/constants/constants";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent } from "react";
import { useShallow } from "zustand/shallow";
import { HygieneOptionsType } from "../(desktop)/HygieneOptionsPropositions";

type HygieneMobileOptionsPoubelleInputProps = {
  nbDistribPoubelle: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: HygieneOptionsType,
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
};

const HygieneMobileOptionsPoubelleInput = ({
  nbDistribPoubelle,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
}: HygieneMobileOptionsPoubelleInputProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const { hygiene, setHygiene } = useHygieneStore(
    useShallow((s) => ({
      hygiene: s.hygiene,
      setHygiene: s.setHygiene,
    })),
  );
  const handleIncrement = () => {
    let newNbDistribPoubelle = nbDistribPoubelle + 1;
    if (newNbDistribPoubelle > MAX_NB_DISTRIB)
      newNbDistribPoubelle = MAX_NB_DISTRIB;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribPoubelle: newNbDistribPoubelle,
      },
    }));
  };
  const handleDecrement = () => {
    let newNbDistribPoubelle = nbDistribPoubelle - 1;
    if (newNbDistribPoubelle < 0) newNbDistribPoubelle = 0;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribPoubelle: newNbDistribPoubelle,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold">
        {tHygiene("poubelle-hygiene-feminine")}
      </p>
      <p>
        {t("indiquez-le-nombre-de")}{" "}
        <strong>{tHygiene("receptacles").toLowerCase()}</strong> :
      </p>
      <div className="flex w-full flex-col gap-2 p-1">
        <Label htmlFor="nbDistribPoubelle" className="text-sm">
          {tHygiene("nombre-de-receptacles")}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={nbDistribPoubelle || ""}
            min={1}
            max={MAX_NB_DISTRIB}
            step={1}
            onChange={(e) => handleChangeDistribNbr(e, "poubelle")}
            className={`w-16 ${
              hygiene.quantites.nbDistribPoubelle ===
              hygieneDistribQuantite.nbDistribPoubelle
                ? "text-destructive"
                : ""
            }`}
            id="nbDistribPoubelle"
          />
          <Button
            variant="outline"
            title={tHygiene("diminuer-le-nombre-de-distributeurs")}
            onClick={handleDecrement}
            disabled={nbDistribPoubelle === 0}
          >
            <Minus />
          </Button>
          <Button
            variant="outline"
            title={tHygiene("augmenter-le-nombre-de-distributeurs")}
            onClick={handleIncrement}
            disabled={nbDistribPoubelle === MAX_NB_DISTRIB}
          >
            <Plus />
          </Button>
        </div>

        <p className="text-destructive text-xs italic">
          {t(
            "les-quantites-sont-estimees-pour-vous-mais-vous-pouvez-les-changer",
          )}
        </p>
      </div>
    </div>
  );
};

export default HygieneMobileOptionsPoubelleInput;
