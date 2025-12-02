import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE } from "@/constants/constants";
import { locationFontaine } from "@/constants/locationFontaine";
import { useFontainesStore } from "@/stores/fontainesStore";
import { useProspectStore } from "@/stores/prospectStore";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

type FontaineMobileEspaceInputsProps = {
  espace: FontaineEspaceType;
  nbPersonnes: number;
  handleChangeNbPersonnes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectDureeLocation: (value: string) => void;
  fontainesEspacesIds: number[];
  handleCheck: (
    checked: boolean,
    type: "Eau froide" | "Eau gazeuse" | "Eau chaude",
  ) => void;
  handleIncrement: () => void;
  handleDecrement: () => void;
};

const FontaineMobileEspaceInputs = ({
  espace,
  nbPersonnes,
  handleChangeNbPersonnes,
  handleSelectDureeLocation,
  fontainesEspacesIds,
  handleCheck,
  handleIncrement,
  handleDecrement,
}: FontaineMobileEspaceInputsProps) => {
  const t = useTranslations("DevisPage");
  const tFontaines = useTranslations("DevisPage.foodBeverage.fontaines");
  const tLocation = useTranslations("DevisPage.location");

  const fontaines = useFontainesStore((s) => s.fontaines);
  const prospect = useProspectStore((s) => s.prospect);
  return (
    <div className="flex flex-col gap-8">
      {espace.infos.espaceId === fontainesEspacesIds[0] && (
        <div className="flex flex-col gap-4">
          <p>
            {t("indiquez-la")} <strong>{t("duree-d-engagement")}</strong>{" "}
            {t("souhaitee")} :{" "}
          </p>
          <div className="flex w-full flex-col gap-2 p-1">
            <Label htmlFor="nbDistribPh" className="flex-1 text-sm">
              {t("duree-de-location")}
            </Label>
            <Select
              value={fontaines.infos.dureeLocation}
              onValueChange={handleSelectDureeLocation}
              aria-label={t("selectionnez-la-duree-de-location")}
            >
              <SelectTrigger className={`w-full max-w-xs`}>
                <SelectValue placeholder={t("choisir")} />
              </SelectTrigger>
              <SelectContent>
                {locationFontaine.map((item) => (
                  <SelectItem key={`location_${item.id}`} value={item.id}>
                    {tLocation(item.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <p>
          {t("indiquez-le")} <strong>{tFontaines("type-deau")}</strong> :
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={espace.infos.typeEau.includes("Eau froide")}
              onCheckedChange={(checked: boolean) =>
                handleCheck(checked, "Eau froide")
              }
              disabled={true}
              className="bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground font-bold"
              id="eau froide"
              aria-label={tFontaines("selectionner-eau-froide")}
            />
            <Label htmlFor="eau froide" className="text-sm">
              {tFontaines("eau-froide")}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={espace.infos.typeEau.includes("Eau gazeuse")}
              onCheckedChange={(checked: boolean) =>
                handleCheck(checked, "Eau gazeuse")
              }
              className="bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground font-bold"
              id="eau gazeuse"
              aria-label={tFontaines("selectionner-eau-gazeuse")}
            />
            <Label htmlFor="eau gazeuse" className="text-sm">
              {tFontaines("eau-gazeuse")}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={espace.infos.typeEau.includes("Eau chaude")}
              onCheckedChange={(checked: boolean) =>
                handleCheck(checked, "Eau chaude")
              }
              className="bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground font-bold"
              id="eau chaude"
              aria-label={tFontaines("selectionner-eau-chaude")}
            />
            <Label htmlFor="Eau chaude" className="text-sm">
              {tFontaines("eau-chaude")}
            </Label>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          {t("indiquez-le")}{" "}
          <strong>{t("nombre-de-personnes").toLowerCase()}</strong>{" "}
          {tFontaines("pour-lespace-fontaine")}
        </p>
        <div className="flex w-full flex-col gap-2 p-1">
          <Label
            htmlFor={`nbPersonnes_${espace.infos.espaceId}`}
            className="flex-1 text-sm"
          >
            {t("nombre-de-personnes")}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              className={`w-16 max-w-xs min-w-20 ${
                nbPersonnes === prospect.effectif ? "text-destructive" : ""
              }`}
              type="number"
              min={1}
              max={MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE}
              step={1}
              value={nbPersonnes || ""}
              onChange={handleChangeNbPersonnes}
              id={`nbPersonnes_${espace.infos.espaceId}`}
            />
            <Button
              variant="outline"
              title={t("diminuer-le-nombre-de-personnes")}
              onClick={handleDecrement}
              disabled={nbPersonnes === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title={t("augmenter-le-nombre-de-personnes")}
              onClick={handleIncrement}
              disabled={nbPersonnes === MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE}
            >
              <Plus />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontaineMobileEspaceInputs;
