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
import { MAX_NB_EMP, MAX_NB_PH, MAX_NB_SAVON } from "@/constants/constants";
import { locationDistribHygiene } from "@/constants/locationsDistribHygiene";
import { useHygieneStore } from "@/stores/hygieneStore";
import { DureeLocationHygieneType } from "@/zod-schemas/dureeLocation";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { useTranslations } from "next-intl";

type HygieneDistribQuantitesInputsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  handleChangeDistribNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
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
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const tLocation = useTranslations("DevisPage.location");
  const hygiene = useHygieneStore((s) => s.hygiene);
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full items-center gap-4">
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
              ? "text-destructive"
              : ""
          }`}
          id="nbDistribEmp"
        />
        <Label htmlFor="nbDistribEmp" className="flex-1 text-sm">
          {tHygiene("distributeurs-essuie-mains-papier")}
        </Label>
      </div>
      <div className="flex w-full items-center gap-4">
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
              ? "text-destructive"
              : ""
          }`}
          id="nbDistribSavon"
        />
        <Label htmlFor="nbDistribSavon" className="flex-1 text-sm">
          {tHygiene("distributeurs-de-savon")}
        </Label>
      </div>
      <div className="flex w-full items-center gap-4">
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
              ? "text-destructive"
              : ""
          }`}
          id="nbDistribPh"
        />
        <Label htmlFor="nbDistribPh" className="flex-1 text-sm">
          {tHygiene("distributeurs-de-papier-hygienique")}
        </Label>
      </div>
      <div>
        <Select
          onValueChange={handleChangeDureeLocation}
          value={dureeLocation}
          aria-label={t("selectionnez-la-duree-de-location")}
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
                  ["pa12M", "pa24M", "pa36M"].some(
                    (key) =>
                      tarif[key as keyof typeof tarif] &&
                      item.id.toString() === key,
                  ),
                );
                return (
                  <SelectItem
                    key={`dureeLoc_${item.id}`}
                    value={item.id.toString() ?? ""}
                    disabled={isDisabled}
                  >
                    {tLocation(item.id)}
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
      </div>
      <p className="text-destructive px-2 text-center text-xs italic">
        {t(
          "les-quantites-sont-estimees-pour-vous-mais-vous-pouvez-les-changer",
        )}
      </p>
    </div>
  );
};

export default HygieneDistribQuantitesInputs;
