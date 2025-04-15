import { Button } from "@/components/ui/button";
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
import { MAX_EFFECTIF } from "@/constants/constants";
import { locationCafeMachine } from "@/constants/locationCafeMachine";
import { typesBoissons } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useContext } from "react";

type CafeMobileEspaceInputsProps = {
  espace: CafeEspaceType;
  handleChangeTypeBoissons: (value: string) => void;
  nbPersonnes: number;
  handleChangeNbPersonnes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectDureeLocation: (value: string) => void;
  cafeEspacesIds: number[];
  handleIncrement: () => void;
  handleDecrement: () => void;
};

const CafeMobileEspaceInputs = ({
  espace,
  handleChangeTypeBoissons,
  nbPersonnes,
  handleChangeNbPersonnes,
  handleSelectDureeLocation,
  cafeEspacesIds,
  handleIncrement,
  handleDecrement,
}: CafeMobileEspaceInputsProps) => {
  const t = useTranslations("DevisPage");
  const tCafe = useTranslations("DevisPage.foodBeverage.cafe");
  const tTypeBoisson = useTranslations("DevisPage.foodBeverage.cafe.types");
  const tLocation = useTranslations("DevisPage.location");
  const { client } = useContext(ClientContext);
  const { cafe } = useContext(CafeContext);

  return (
    <div className="flex flex-col gap-8">
      {espace.infos.espaceId === cafeEspacesIds[0] && (
        <div className="flex flex-col gap-4">
          <p>
            {t("indiquez-la")} <strong>{t("duree-d-engagement")}</strong>{" "}
            {t("souhaitee")}:{" "}
          </p>
          <div className="flex flex-col w-full p-1 gap-2">
            <Label htmlFor="nbDistribPh" className="text-sm flex-1">
              {t("duree-de-location")}
            </Label>
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
                  <SelectItem key={`${location}_${item.id}`} value={item.id}>
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
          {t("indiquez-le")}{" "}
          <strong>{tCafe("type-de-boissons").toLowerCase()}</strong> :
        </p>
        <RadioGroup
          onValueChange={handleChangeTypeBoissons}
          value={espace.infos.typeBoissons}
          className="flex flex-col gap-4"
          name="typeBoissons"
        >
          {typesBoissons.map(({ id }) => (
            <div key={id} className="flex gap-2 items-center">
              <RadioGroupItem
                value={id}
                title={tTypeBoisson(id)}
                id={`${id}_${espace.infos.espaceId}`}
              />
              <Label
                htmlFor={`${id}_${espace.infos.espaceId}`}
                className="text-base"
              >
                {tTypeBoisson(id)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          {t("indiquez-le")}{" "}
          <strong>{t("nombre-de-personnes").toLowerCase()}</strong>{" "}
          {tCafe("pour-lespace-cafe")}
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label
            htmlFor={`nbPersonnes_${espace.infos.espaceId}`}
            className="text-sm flex-1"
          >
            {t("nombre-de-personnes")}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              className={`w-16 max-w-xs min-w-20 ${
                nbPersonnes === client.effectif ? "text-fm4alldestructive" : ""
              }`}
              type="number"
              min={1}
              max={MAX_EFFECTIF}
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
              disabled={nbPersonnes === MAX_EFFECTIF}
            >
              <Plus />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeMobileEspaceInputs;
