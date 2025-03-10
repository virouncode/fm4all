import { Input } from "@/components/ui/input";
import { HygieneContext } from "@/context/HygieneProvider";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { Label } from "@radix-ui/react-label";
import { ChangeEvent, useContext } from "react";
import { MAX_NB_DISTRIB } from "../(desktop)/HygieneOptionsPropositions";

type HygieneMobileOptionsBalaiInputProps = {
  nbDistribBalai: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
};

const HygieneMobileOptionsBalaiInput = ({
  nbDistribBalai,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
}: HygieneMobileOptionsBalaiInputProps) => {
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold text-xl">Balais WC</p>
      <p>Indiquez le nombre de blocs : </p>
      <div className="flex flex-col w-full p-1 gap-2">
        <Label htmlFor="nbDistribBalai" className="text-sm">
          Nombre de blocs balais WC
        </Label>
        <Input
          type="number"
          value={nbDistribBalai || ""}
          min={1}
          max={MAX_NB_DISTRIB}
          step={1}
          onChange={(e) => handleChangeDistribNbr(e, "parfum")}
          className={`w-full ${
            hygiene.quantites.nbDistribBalai ===
            hygieneDistribQuantite.nbDistribBalai
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

export default HygieneMobileOptionsBalaiInput;
