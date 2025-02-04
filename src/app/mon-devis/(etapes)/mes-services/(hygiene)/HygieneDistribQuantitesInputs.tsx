"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { locationDistribHygiene } from "@/constants/locationsDistribHygiene";
import { HygieneContext } from "@/context/HygieneProvider";
import { DureeLocationHygieneType } from "@/zod-schemas/dureeLocation";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { useContext } from "react";
import { MAX_NB_EMP, MAX_NB_PH, MAX_NB_SAVON } from "./HygienePropositions";

type HygieneDistribQuantitesInputsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  handleChangeDistribNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => void;
  handleChangeDureeLocation: (value: DureeLocationHygieneType) => void;
  nbDistribEmp: number;
  nbDistribSavon: number;
  nbDistribPh: number;
  dureeLocation: DureeLocationHygieneType;
};

const HygieneDistribQuantitesInputs = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  handleChangeDistribNbr,
  handleChangeDureeLocation,
  nbDistribEmp,
  nbDistribSavon,
  nbDistribPh,
  dureeLocation,
}: HygieneDistribQuantitesInputsProps) => {
  const { hygiene } = useContext(HygieneContext);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={nbDistribEmp}
                min={1}
                max={MAX_NB_EMP}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "emp")}
                className={`w-16 ${
                  hygiene.quantites.nbDistribEmp ===
                  hygieneDistribQuantite?.nbDistribEmp
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribEmp" className="text-sm flex-1">
                distributeurs essuie-main papier
              </Label>
            </div>
            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={nbDistribSavon}
                min={1}
                max={MAX_NB_SAVON}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "savon")}
                className={`w-16 ${
                  hygiene.quantites.nbDistribSavon ===
                  hygieneDistribQuantite?.nbDistribSavon
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribSavon" className="text-sm flex-1">
                distributeurs savon
              </Label>
            </div>
            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={nbDistribPh}
                min={1}
                max={MAX_NB_PH}
                step={1}
                onChange={(e) => handleChangeDistribNbr(e, "ph")}
                className={`w-16 ${
                  hygiene.quantites.nbDistribPh ===
                  hygieneDistribQuantite?.nbDistribPh
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribPh" className="text-sm flex-1">
                distributeurs papier hygiénique
              </Label>
            </div>

            <div>
              <Select
                onValueChange={handleChangeDureeLocation}
                value={dureeLocation}
              >
                <SelectTrigger className={`w-full max-w-xs`}>
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
            <p className="text-xs text-destructive italic px-2 text-center">
              Les quantités sont estimées pour vous mais vous pouvez les changer
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">
          Précisez le nombre de distributeurs et la durée de location minimum
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HygieneDistribQuantitesInputs;
