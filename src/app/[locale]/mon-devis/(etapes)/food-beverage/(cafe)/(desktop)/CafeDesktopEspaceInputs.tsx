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
import { locationCafeMachine } from "@/constants/locationCafeMachine";
import { typesBoissons } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { CafeEspaceType } from "@/zod-schemas/cafe";
import { useContext } from "react";
import { MAX_EFFECTIF } from "../../../mes-locaux/MesLocaux";

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
                  {typesBoissons.map(({ id, description }) => (
                    <div key={id} className="flex gap-2 items-center">
                      <RadioGroupItem
                        value={id}
                        title={description}
                        id={`${id}_${espace.infos.espaceId}`}
                      />
                      <Label htmlFor={`${id}_${espace.infos.espaceId}`}>
                        {description}
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
                  personnes
                </Label>
              </div>
              {espace.infos.espaceId === cafeEspacesIds[0] && (
                <Select
                  value={cafe.infos.dureeLocation}
                  onValueChange={handleSelectDureeLocation}
                  aria-label="Sélectionnez la durée de location"
                >
                  <SelectTrigger className={`w-full max-w-xs`}>
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationCafeMachine.map((item) => (
                      <SelectItem
                        key={`${location}_${item.id}`}
                        value={item.id}
                      >
                        {item.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </form>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">
          Choisissez le type de boissons avec ou sans lait/cacao, le nombre de
          personnes pour votre espace café et la durée d’engagement
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CafeDesktopEspaceInputs;
