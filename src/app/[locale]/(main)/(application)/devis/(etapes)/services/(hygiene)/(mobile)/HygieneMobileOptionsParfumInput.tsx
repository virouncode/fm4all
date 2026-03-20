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

type HygieneMobileOptionsParfumInputProps = {
  nbDistribParfum: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: HygieneOptionsType,
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
};

const HygieneMobileOptionsParfumInput = ({
  nbDistribParfum,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
}: HygieneMobileOptionsParfumInputProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const { hygiene, setHygiene } = useHygieneStore(
    useShallow((s) => ({
      hygiene: s.hygiene,
      setHygiene: s.setHygiene,
    })),
  );
  const handleIncrement = () => {
    let newNbDistribParfum = nbDistribParfum + 1;
    if (newNbDistribParfum > MAX_NB_DISTRIB)
      newNbDistribParfum = MAX_NB_DISTRIB;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribParfum: newNbDistribParfum,
      },
    }));
  };
  const handleDecrement = () => {
    let newNbDistribParfum = nbDistribParfum - 1;
    if (newNbDistribParfum < 0) newNbDistribParfum = 0;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribParfum: newNbDistribParfum,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold">{tHygiene("parfum")}</p>
      <p>
        {t("indiquez-le-nombre-de")}{" "}
        <strong>{tHygiene("diffuseurs").toLowerCase()}</strong> :
      </p>
      <div className="flex w-full flex-col gap-2 p-1">
        <Label htmlFor="nbDistribParfum" className="text-sm">
          {tHygiene("nombre-de-diffuseurs")}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={nbDistribParfum || ""}
            min={1}
            max={MAX_NB_DISTRIB}
            step={1}
            onChange={(e) => handleChangeDistribNbr(e, "parfum")}
            className={`w-16 ${
              hygiene.quantites.nbDistribParfum ===
              hygieneDistribQuantite.nbDistribParfum
                ? "text-destructive"
                : ""
            }`}
            id="nbDistribParfum"
          />
          <Button
            variant="outline"
            title={tHygiene("diminuer-le-nombre-de-distributeurs")}
            onClick={handleDecrement}
            disabled={nbDistribParfum === 0}
          >
            <Minus />
          </Button>
          <Button
            variant="outline"
            title={tHygiene("augmenter-le-nombre-de-distributeurs")}
            onClick={handleIncrement}
            disabled={nbDistribParfum === MAX_NB_DISTRIB}
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

export default HygieneMobileOptionsParfumInput;
