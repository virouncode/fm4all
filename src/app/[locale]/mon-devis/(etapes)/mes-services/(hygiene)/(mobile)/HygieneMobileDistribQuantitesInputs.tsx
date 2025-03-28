import { Button } from "@/components/ui/button";
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
import { Minus, Plus } from "lucide-react";
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
  handleIncrement: (type: "emp" | "savon" | "ph") => void;
  handleDecrement: (type: "emp" | "savon" | "ph") => void;
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
  handleIncrement,
  handleDecrement,
}: HygieneMobileDistribQuantitesInputsProps) => {
  const { hygiene } = useContext(HygieneContext);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p>
          Indiquez la <strong>durée d&apos;engagement</strong> souhaitée :{" "}
        </p>
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
        <p>
          Indiquez le nombre de{" "}
          <strong>distributeurs essuie-mains papier</strong> :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribEmp" className="text-sm flex-1">
            Nombre de distributeurs
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={nbDistribEmp || ""}
              min={1}
              max={MAX_NB_EMP}
              step={1}
              onChange={(e) => handleChangeDistribNbr(e, "emp")}
              className={`w-16 ${
                hygiene.quantites.nbDistribEmp ===
                hygieneDistribQuantite?.nbDistribEmp
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbDistribEmp"
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de distributeurs"
              onClick={() => handleDecrement("emp")}
              disabled={nbDistribEmp === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de distributeurs"
              onClick={() => handleIncrement("emp")}
              disabled={nbDistribEmp === MAX_NB_EMP}
            >
              <Plus />
            </Button>
          </div>

          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez le nombre de <strong>distributeurs de savon</strong> :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribSavon" className="text-sm flex-1">
            Nombre de distributeurs
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={nbDistribSavon || ""}
              min={1}
              max={MAX_NB_SAVON}
              step={1}
              onChange={(e) => handleChangeDistribNbr(e, "savon")}
              className={`w-16 ${
                hygiene.quantites.nbDistribSavon ===
                hygieneDistribQuantite?.nbDistribSavon
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbDistribSavon"
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de distributeurs"
              onClick={() => handleDecrement("savon")}
              disabled={nbDistribSavon === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de distributeurs"
              onClick={() => handleIncrement("savon")}
              disabled={nbDistribSavon === MAX_NB_SAVON}
            >
              <Plus />
            </Button>
          </div>

          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez le nombre de{" "}
          <strong>distributeurs de papier hygiénique</strong> :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label htmlFor="nbDistribPh" className="text-sm flex-1">
            Nombre de distributeurs
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={nbDistribPh || ""}
              min={1}
              max={MAX_NB_PH}
              step={1}
              onChange={(e) => handleChangeDistribNbr(e, "ph")}
              className={`w-16 ${
                hygiene.quantites.nbDistribPh ===
                hygieneDistribQuantite?.nbDistribPh
                  ? "text-fm4alldestructive"
                  : ""
              }`}
              id="nbDistribPh"
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de distributeurs"
              onClick={() => handleDecrement("ph")}
              disabled={nbDistribPh === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de distributeurs"
              onClick={() => handleIncrement("ph")}
              disabled={nbDistribPh === MAX_NB_PH}
            >
              <Plus />
            </Button>
          </div>

          <p className="text-xs italic text-fm4alldestructive">
            Les quantités sont estimées pour vous mais vous pouvez les changer
          </p>
        </div>
      </div>
    </div>
  );
};
export default HygieneMobileDistribQuantitesInputs;
