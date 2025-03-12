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
import { locationFontaine } from "@/constants/locationFontaine";
import { ClientContext } from "@/context/ClientProvider";
import {
  FontainesContext,
  MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE,
} from "@/context/FontainesProvider";
import { FontaineEspaceType } from "@/zod-schemas/fontaines";
import { Minus, Plus } from "lucide-react";
import { useContext } from "react";

type FontaineMobileEspaceInputsProps = {
  espace: FontaineEspaceType;
  nbPersonnes: number;
  handleChangeNbPersonnes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectDureeLocation: (value: string) => void;
  fontainesEspacesIds: number[];
  handleCheck: (
    checked: boolean,
    type: "Eau froide" | "Eau gazeuse" | "Eau chaude"
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
  const { fontaines } = useContext(FontainesContext);
  const { client } = useContext(ClientContext);
  return (
    <div className="flex flex-col gap-8">
      {espace.infos.espaceId === fontainesEspacesIds[0] && (
        <div className="flex flex-col gap-4">
          <p>
            Indiquez la <strong>durée d&apos;engagement</strong> souhaitée :{" "}
          </p>
          <div className="flex flex-col w-full p-1 gap-2">
            <Label htmlFor="nbDistribPh" className="text-sm flex-1">
              Durée de location
            </Label>
            <Select
              value={fontaines.infos.dureeLocation}
              onValueChange={handleSelectDureeLocation}
              aria-label="Sélectionnez la durée de location"
            >
              <SelectTrigger className={`w-full max-w-xs`}>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {locationFontaine.map((item) => (
                  <SelectItem key={`${location}_${item.id}`} value={item.id}>
                    {item.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <p>
          Indiquez le <strong>type d&apos;eau souhaité</strong> :
        </p>
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
              aria-label="Sélectionner eau froide"
            />
            <Label htmlFor="eau froide" className="text-sm">
              Eau froide
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
              aria-label="Sélectionner eau gazeuse"
            />
            <Label htmlFor="eau gazeuse" className="text-sm">
              Eau gazeuse
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
              aria-label="Sélectionner eau chaude"
            />
            <Label htmlFor="Eau chaude" className="text-sm">
              Eau chaude
            </Label>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p>
          Indiquez le <strong>nombre de personnes</strong> pour l&apos;espace
          fontaine :
        </p>
        <div className="flex flex-col w-full p-1 gap-2">
          <Label
            htmlFor={`nbPersonnes_${espace.infos.espaceId}`}
            className="text-sm flex-1"
          >
            Nombre de personnes
          </Label>
          <div className="flex items-center gap-2">
            <Input
              className={`w-16 max-w-xs min-w-20 ${
                nbPersonnes === client.effectif ? "text-fm4alldestructive" : ""
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
              title="Diminuer le nombre de personnes"
              onClick={handleDecrement}
              disabled={nbPersonnes === 0}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de distributeurs"
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
