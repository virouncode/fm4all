import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { MAX_EFFECTIF } from "@/constants/constants";
import { locationCafeMachine } from "@/constants/locationCafeMachine";
import { typesBoissons } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { useTranslations } from "next-intl";
import { useContext } from "react";

type CafeDesktopEspaceInputsProps = {
  espace: CafeEspaceType;
  handleChangeTypeBoissons: (value: string) => void;
  nbPersonnes: number;
  handleChangeNbPersonnes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectDureeLocation: (value: string) => void;
  cafeEspacesIds: number[];
};

const CafeDesktopEspaceInputs = ({
  espace,
  handleChangeTypeBoissons,
  nbPersonnes,
  handleChangeNbPersonnes,
  handleSelectDureeLocation,
  cafeEspacesIds,
}: CafeDesktopEspaceInputsProps) => {
  const tTypeBoisson = useTranslations("DevisPage.foodBeverage.cafe.types");
  const tLocation = useTranslations("DevisPage.location");
  const t = useTranslations("DevisPage");
  const tCafe = useTranslations("DevisPage.foodBeverage.cafe");
  const { client } = useContext(ClientContext);
  const { cafe } = useContext(CafeContext);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <form className="w-2/3">
            <div className="flex gap-8 items-center mb-4">
              <div>
                <RadioGroup
                  onValueChange={handleChangeTypeBoissons}
                  value={espace.infos.typeBoissons}
                  className="flex gap-4 items-center"
                  name="typeBoissons"
                >
                  {typesBoissons.map(({ id }) => (
                    <div key={id} className="flex gap-2 items-center">
                      <RadioGroupItem
                        value={id}
                        title={tTypeBoisson(id)}
                        id={`${id}_${espace.infos.espaceId}`}
                      />
                      <Label htmlFor={`${id}_${espace.infos.espaceId}`}>
                        {tTypeBoisson(id)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
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
                  max={MAX_EFFECTIF}
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
              {espace.infos.espaceId === cafeEspacesIds[0] && (
                <Select
                  value={cafe.infos.dureeLocation}
                  onValueChange={handleSelectDureeLocation}
                  aria-label={t("selectionnez-la-duree-de-location")}
                >
                  <SelectTrigger className={`w-full max-w-xs`}>
                    <SelectValue placeholder={t("choisir")} />
                  </SelectTrigger>
                  <SelectContent>
                    {locationCafeMachine.map((item) => (
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
          {tCafe(
            "choisissez-le-type-de-boissons-avec-ou-sans-lait-cacao-le-nombre-de-personnes-pour-votre-espace-cafe-et-la-duree-dengagement"
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CafeDesktopEspaceInputs;
