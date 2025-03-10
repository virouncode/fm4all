import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HygieneContext } from "@/context/HygieneProvider";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { useContext } from "react";
import { MAX_NB_DISTRIB } from "../(desktop)/HygieneOptionsPropositions";

type HygieneMobileOptionsDesinfectantInputProps = {
  nbDistribDesinfectant: number;
  handleChangeDistribNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
};

const HygieneMobileOptionsDesinfectantInput = ({
  nbDistribDesinfectant,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
}: HygieneMobileOptionsDesinfectantInputProps) => {
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold text-xl">Désinfectant cuvettes</p>
      <p>Indiquez le nombre de distributeurs de désinfectant : </p>
      <div className="flex flex-col w-full p-1 gap-2">
        <Label htmlFor="nbDistribDesinfectant" className="text-sm">
          Nombre de distributeurs
        </Label>
        <Input
          type="number"
          value={nbDistribDesinfectant || ""}
          min={1}
          max={MAX_NB_DISTRIB}
          step={1}
          onChange={(e) => handleChangeDistribNbr(e, "desinfectant")}
          className={`w-full ${
            hygiene.quantites.nbDistribDesinfectant ===
            hygieneDistribQuantite.nbDistribDesinfectant
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

export default HygieneMobileOptionsDesinfectantInput;
