import { Input } from "@/components/ui/input";
import { HygieneContext } from "@/context/HygieneProvider";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { Label } from "@radix-ui/react-label";
import { ChangeEvent, useContext } from "react";
import { MAX_NB_DISTRIB } from "../(desktop)/HygieneOptionsPropositions";

type HygieneMobileOptionsPoubelleInputProps = {
  nbDistribPoubelle: number;
  handleChangeDistribNbr: (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
};

const HygieneMobileOptionsPoubelleInput = ({
  nbDistribPoubelle,
  handleChangeDistribNbr,
  hygieneDistribQuantite,
}: HygieneMobileOptionsPoubelleInputProps) => {
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold text-xl">Poubelle hygiène féminine</p>
      <p>Indiquez le nombre de réceptacles : </p>
      <div className="flex flex-col w-full p-1 gap-2">
        <Label htmlFor="nbDistribPoubelle" className="text-sm">
          Nombre de réceptacles
        </Label>
        <Input
          type="number"
          value={nbDistribPoubelle || ""}
          min={1}
          max={MAX_NB_DISTRIB}
          step={1}
          onChange={(e) => handleChangeDistribNbr(e, "poubelle")}
          className={`w-full ${
            hygiene.quantites.nbDistribPoubelle ===
            hygieneDistribQuantite.nbDistribPoubelle
              ? "text-fm4alldestructive"
              : ""
          }`}
          id="nbDistribPoubelle"
        />
        <p className="text-xs italic text-fm4alldestructive">
          Les quantités sont estimées pour vous mais vous pouvez les changer
        </p>
      </div>
    </div>
  );
};

export default HygieneMobileOptionsPoubelleInput;
