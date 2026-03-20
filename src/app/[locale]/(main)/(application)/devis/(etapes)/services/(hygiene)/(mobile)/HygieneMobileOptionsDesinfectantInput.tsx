import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_NB_DISTRIB } from "@/constants/constants";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/shallow";
import { HygieneOptionsType } from "../(desktop)/HygieneOptionsPropositions";

type HygieneMobileOptionsDesinfectantInputProps = {
  nbDistribDesinfectant: number;
  handleChangeDistribNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: HygieneOptionsType,
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
};

const HygieneMobileOptionsDesinfectantInput = ({
  nbDistribDesinfectant,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
}: HygieneMobileOptionsDesinfectantInputProps) => {
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const { hygiene, setHygiene } = useHygieneStore(
    useShallow((s) => ({
      hygiene: s.hygiene,
      setHygiene: s.setHygiene,
    })),
  );
  const handleIncrement = () => {
    let newNbDistribDesinfectant = nbDistribDesinfectant + 1;
    if (newNbDistribDesinfectant > MAX_NB_DISTRIB)
      newNbDistribDesinfectant = MAX_NB_DISTRIB;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribDesinfectant: newNbDistribDesinfectant,
      },
    }));
  };
  const handleDecrement = () => {
    let newNbDistribDesinfectant = nbDistribDesinfectant - 1;
    if (newNbDistribDesinfectant < 0) newNbDistribDesinfectant = 0;
    setHygiene((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbDistribDesinfectant: newNbDistribDesinfectant,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold">
        {tHygiene("desinfectant-pour-cuvettes")}
      </p>
      <p>
        {t("indiquez-le-nombre-de")}{" "}
        <strong>{tHygiene("distributeurs-de-desinfectant")}</strong> :{" "}
      </p>
      <div className="flex w-full flex-col gap-2 p-1">
        <Label htmlFor="nbDistribDesinfectant" className="text-sm">
          {tHygiene("nombre-de-distributeurs")}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={nbDistribDesinfectant || ""}
            min={1}
            max={MAX_NB_DISTRIB}
            step={1}
            onChange={(e) => handleChangeDistribNbr(e, "desinfectant")}
            className={`w-16 ${
              hygiene.quantites.nbDistribDesinfectant ===
              hygieneDistribQuantite.nbDistribDesinfectant
                ? "text-destructive"
                : ""
            }`}
            id="nbDistribDesinfectant"
          />
          <Button
            variant="outline"
            title={tHygiene("diminuer-le-nombre-de-distributeurs")}
            onClick={handleDecrement}
            disabled={nbDistribDesinfectant === 0}
          >
            <Minus />
          </Button>
          <Button
            variant="outline"
            title={tHygiene("augmenter-le-nombre-de-distributeurs")}
            onClick={handleIncrement}
            disabled={nbDistribDesinfectant === MAX_NB_DISTRIB}
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

export default HygieneMobileOptionsDesinfectantInput;
