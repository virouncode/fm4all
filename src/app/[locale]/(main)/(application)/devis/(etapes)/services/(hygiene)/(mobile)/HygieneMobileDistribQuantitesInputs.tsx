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
import { MAX_NB_EMP, MAX_NB_PH, MAX_NB_SAVON } from "@/constants/constants";
import { locationDistribHygiene } from "@/constants/locationsDistribHygiene";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

type HygieneMobileDistribQuantitesInputsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  handleChangeDistribNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string,
  ) => void;
  handleChangeDureeLocation: (
    value: "oneShot" | "pa12M" | "pa24M" | "pa36M",
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
  const t = useTranslations("DevisPage");
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const tLocation = useTranslations("DevisPage.location");
  const hygiene = useHygieneStore((s) => s.hygiene);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <p>
          {t("indiquez-la")} <strong>{t("duree-d-engagement")}</strong>{" "}
          {t("souhaitee")}{" "}
        </p>
        <div className="flex w-full flex-col gap-2 p-1">
          <Label htmlFor="nbDistribPh" className="flex-1 text-sm">
            {t("duree-de-location")}
          </Label>
          <Select
            onValueChange={handleChangeDureeLocation}
            value={dureeLocation}
            aria-label={t("selectionnez-la-duree-de-location")}
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
      </div>
      <div className="flex flex-col gap-4">
        <p>
          {t("indiquez-le-nombre-de")}{" "}
          <strong>{tHygiene("distributeurs-essuie-mains-papier")}</strong> :
        </p>
        <div className="flex w-full flex-col gap-2 p-1">
          <Label htmlFor="nbDistribEmp" className="flex-1 text-sm">
            {tHygiene("nombre-de-distributeurs")}
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
                  ? "text-destructive"
                  : ""
              }`}
              id="nbDistribEmp"
            />
            <Button
              variant="outline"
              title={tHygiene("diminuer-le-nombre-de-distributeurs")}
              onClick={() => handleDecrement("emp")}
              disabled={nbDistribEmp === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title={tHygiene("augmenter-le-nombre-de-distributeurs")}
              onClick={() => handleIncrement("emp")}
              disabled={nbDistribEmp === MAX_NB_EMP}
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
      <div className="flex flex-col gap-4">
        <p>
          {t("indiquez-le-nombre-de")}{" "}
          <strong>{tHygiene("distributeurs-de-savon")}</strong> :
        </p>
        <div className="flex w-full flex-col gap-2 p-1">
          <Label htmlFor="nbDistribSavon" className="flex-1 text-sm">
            {tHygiene("nombre-de-distributeurs")}
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
                  ? "text-destructive"
                  : ""
              }`}
              id="nbDistribSavon"
            />
            <Button
              variant="outline"
              title={tHygiene("diminuer-le-nombre-de-distributeurs")}
              onClick={() => handleDecrement("savon")}
              disabled={nbDistribSavon === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title={tHygiene("augmenter-le-nombre-de-distributeurs")}
              onClick={() => handleIncrement("savon")}
              disabled={nbDistribSavon === MAX_NB_SAVON}
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
      <div className="flex flex-col gap-4">
        <p>
          {t("indiquez-le-nombre-de")}{" "}
          <strong>{tHygiene("distributeurs-de-papier-hygienique")}</strong> :
        </p>
        <div className="flex w-full flex-col gap-2 p-1">
          <Label htmlFor="nbDistribPh" className="flex-1 text-sm">
            {tHygiene("nombre-de-distributeurs")}
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
                  ? "text-destructive"
                  : ""
              }`}
              id="nbDistribPh"
            />
            <Button
              variant="outline"
              title={tHygiene("diminuer-le-nombre-de-distributeurs")}
              onClick={() => handleDecrement("ph")}
              disabled={nbDistribPh === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title={tHygiene("augmenter-le-nombre-de-distributeurs")}
              onClick={() => handleIncrement("ph")}
              disabled={nbDistribPh === MAX_NB_PH}
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
    </div>
  );
};
export default HygieneMobileDistribQuantitesInputs;
