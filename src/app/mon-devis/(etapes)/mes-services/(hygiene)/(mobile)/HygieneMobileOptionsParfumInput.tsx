import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HygieneContext } from "@/context/HygieneProvider";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { ChangeEvent, useContext } from "react";
import { MAX_NB_DISTRIB } from "../(desktop)/HygieneOptionsPropositions";

type HygieneMobileOptionsParfumInputProps = {
  nbDistribParfum: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
};

const HygieneMobileOptionsParfumInput = ({
  nbDistribParfum,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
}: HygieneMobileOptionsParfumInputProps) => {
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold text-xl">Parfum</p>
      <p>Indiquez le nombre de diffuseurs de parfum : </p>
      <div className="flex flex-col w-full p-1 gap-2">
        <Label htmlFor="nbDistribParfum" className="text-sm">
          Nombre de distributeurs
        </Label>
        <Input
          type="number"
          value={nbDistribParfum || ""}
          min={1}
          max={MAX_NB_DISTRIB}
          step={1}
          onChange={(e) => handleChangeDistribNbr(e, "parfum")}
          className={`w-full ${
            hygiene.quantites.nbDistribParfum ===
            hygieneDistribQuantite.nbDistribParfum
              ? "text-fm4alldestructive"
              : ""
          }`}
          id="nbDistribDesinfectant"
        />
        <p className="text-xs italic text-fm4alldestructive">
          Les quantités sont estimées pour vous mais vous pouvez les changer
        </p>
      </div>
    </div>
  );
};

export default HygieneMobileOptionsParfumInput;
