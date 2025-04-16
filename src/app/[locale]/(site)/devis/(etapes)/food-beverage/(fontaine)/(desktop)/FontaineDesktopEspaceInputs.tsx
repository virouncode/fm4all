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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE } from "@/constants/constants";
import { locationFontaine } from "@/constants/locationFontaine";
import { ClientContext } from "@/context/ClientProvider";
import { FontainesContext } from "@/context/FontainesProvider";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { useTranslations } from "next-intl";
import { useContext } from "react";

type FontaineDesktopEspaceInputsProps = {
  espace: FontaineEspaceType;
  nbPersonnes: number;
  handleChangeNbPersonnes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectDureeLocation: (value: string) => void;
  fontainesEspacesIds: number[];
  handleCheck: (
    checked: boolean,
    type: "Eau froide" | "Eau gazeuse" | "Eau chaude"
  ) => void;
};

const FontaineDesktopEspaceInputs = ({
  espace,
  nbPersonnes,
  handleChangeNbPersonnes,
  handleSelectDureeLocation,
  fontainesEspacesIds,
  handleCheck,
}: FontaineDesktopEspaceInputsProps) => {
  const { fontaines } = useContext(FontainesContext);
  const { client } = useContext(ClientContext);
  const t = useTranslations("DevisPage");
  const tFontaines = useTranslations("DevisPage.foodBeverage.fontaines");
  const tLocation = useTranslations("DevisPage.location");
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <form className="w-2/3">
            <div className="flex gap-8 items-center mb-4">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={espace.infos.typeEau.includes("Eau froide")}
                    onCheckedChange={(checked: boolean) =>
                      handleCheck(checked, "Eau froide")
                    }
                    disabled={true}
                    className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
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
                    className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
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
                    className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    id="boissons"
                    aria-label={tFontaines("selectionner-eau-chaude")}
                  />
                  <Label htmlFor="Eau chaude" className="text-sm">
                    {tFontaines("eau-chaude")}
                  </Label>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  className={`w-full max-w-xs min-w-20 ${
                    nbPersonnes === client.effectif
                      ? "text-fm4alldestructive"
                      : ""
                  }`}
                  type="number"
                  min={1}
                  max={MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE}
                  step={1}
                  value={nbPersonnes || ""}
                  onChange={handleChangeNbPersonnes}
                  id={`nbPersonnes_${espace.infos.espaceId}`}
                />
                <Label
                  htmlFor={`nbPersonnes_${espace.infos.espaceId}`}
                  className="text-base"
                >
                  {t("personnes")}
                </Label>
              </div>
              {espace.infos.espaceId === fontainesEspacesIds[0] && (
                <Select
                  value={fontaines.infos.dureeLocation}
                  onValueChange={handleSelectDureeLocation}
                  aria-label={t("selectionnez-la-duree-de-location")}
                >
                  <SelectTrigger className={" max-w-xs w-1/4"}>
                    <SelectValue placeholder={t("choisir")} />
                  </SelectTrigger>
                  <SelectContent>
                    {locationFontaine.map((item) => (
                      <SelectItem
                        key={`${location}_${item.id}`}
                        value={item.id}
                      >
                        {tLocation(item.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </form>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">
          <div>
            <p>
              {tFontaines(
                "pour-votre-espace-fontaine-a-eau-veuillez-selectionner"
              )}
            </p>
            <ul className="ml-10">
              <li className="list-disc">{tFontaines("le-type-deau")}</li>
              <li className="list-disc">
                {tFontaines("le-nombre-de-personnes-max-110")}
              </li>
              {fontainesEspacesIds[0] === espace.infos.espaceId && (
                <li className="list-disc">
                  {tFontaines("la-duree-de-location")}
                </li>
              )}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FontaineDesktopEspaceInputs;
