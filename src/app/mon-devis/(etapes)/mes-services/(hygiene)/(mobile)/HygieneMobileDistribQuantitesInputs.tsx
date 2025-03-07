import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locationDistribHygiene } from "@/constants/locationsDistribHygiene";
import { HygieneContext } from "@/context/HygieneProvider";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import React, { useContext } from "react";
import { MAX_NB_EMP, MAX_NB_PH, MAX_NB_SAVON } from "../HygienePropositions";

type HygieneMobileDistribQuantitesInputsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  handleChangeDistribNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  handleChangeDureeLocation: (
    value: "oneShot" | "pa12M" | "pa24M" | "pa36M"
  ) => void;
  nbDistribEmp: number;
  nbDistribSavon: number;
  nbDistribPh: number;
  dureeLocation: "oneShot" | "pa12M" | "pa24M" | "pa36M";
};

const HygieneMobileDistribQuantitesInputs = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  handleChangeDistribNbr,
  handleChangeDureeLocation,
  nbDistribEmp,
  nbDistribSavon,
  nbDistribPh,
  dureeLocation,
}: HygieneMobileDistribQuantitesInputsProps) => {
  const { hygiene } = useContext(HygieneContext);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p>Indiquez la durée d&apos;engagement souhaitée : </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribPh" className="text-sm flex-1">
            Durée de location
          </Label>
          <Select
            onValueChange={handleChangeDureeLocation}
            value={dureeLocation}
            aria-label="Sélectionnez la durée de location"
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locationDistribHygiene
                .filter(({ id }) => id !== "oneShot")
                .map((item) => {
                  // Check if there is any tarif for the current item's id
                  const isDisabled = !hygieneDistribTarifs.some((tarif) =>
                    ["pa12M", "pa24M", "pa36M", "oneShot"].some(
                      (key) =>
                        tarif[key as keyof typeof tarif] &&
                        item.id.toString() === key
                    )
                  );
                  return (
                    <SelectItem
                      key={`dureeLoc_${item.id}`}
                      value={item.id.toString() ?? ""}
                      disabled={isDisabled}
                    >
                      {item.description}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>Indiquez le nombre de distributeurs essuie-mains papier : </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribEmp" className="text-sm flex-1">
            Nombre de distributeurs
          </Label>
          <Input
            type="number"
            value={nbDistribEmp || ""}
            min={1}
            max={MAX_NB_EMP}
            step={1}
            onChange={(e) => handleChangeDistribNbr(e, "emp")}
            className={`w-full ${
              hygiene.quantites.nbDistribEmp ===
              hygieneDistribQuantite?.nbDistribEmp
                ? "text-fm4alldestructive"
                : ""
            }`}
            id="nbDistribEmp"
          />
          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>Indiquez le nombre de distributeurs de savon : </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribSavon" className="text-sm flex-1">
            Nombre de distributeurs
          </Label>
          <Input
            type="number"
            value={nbDistribSavon || ""}
            min={1}
            max={MAX_NB_SAVON}
            step={1}
            onChange={(e) => handleChangeDistribNbr(e, "savon")}
            className={`w-full ${
              hygiene.quantites.nbDistribSavon ===
              hygieneDistribQuantite?.nbDistribSavon
                ? "text-fm4alldestructive"
                : ""
            }`}
            id="nbDistribSavon"
          />
          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>Indiquez le nombre de distributeurs de papier hygiénique : </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribPh" className="text-sm flex-1">
            Nombre de distributeurs
          </Label>
          <Input
            type="number"
            value={nbDistribPh || ""}
            min={1}
            max={MAX_NB_PH}
            step={1}
            onChange={(e) => handleChangeDistribNbr(e, "ph")}
            className={`w-full ${
              hygiene.quantites.nbDistribPh ===
              hygieneDistribQuantite?.nbDistribPh
                ? "text-fm4alldestructive"
                : ""
            }`}
            id="nbDistribPh"
          />
          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
    </div>
  );
};
export default HygieneMobileDistribQuantitesInputs;
