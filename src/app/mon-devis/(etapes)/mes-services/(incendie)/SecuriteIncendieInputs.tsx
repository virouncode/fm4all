import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import {
  MAX_NB_BAES,
  MAX_NB_EXTINCTEURS,
} from "./SecuriteIncendiePropositions";

type SecuriteIncendieInputsProps = {
  nbExtincteurs: number;
  nbBaes: number;
  nbTelBaes: number;
  handleChangeNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "extincteur" | "baes" | "telBaes"
  ) => void;
  incendieQuantite: SelectIncendieQuantitesType;
};

const SecuriteIncendieInputs = ({
  nbExtincteurs,
  nbBaes,
  nbTelBaes,
  handleChangeNbr,
  incendieQuantite,
}: SecuriteIncendieInputsProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-6 w-3/4">
            <div className="flex gap-4 items-center  w-full">
              <Input
                type="number"
                value={nbExtincteurs}
                min={0}
                max={MAX_NB_EXTINCTEURS}
                step={1}
                onChange={(e) => handleChangeNbr(e, "extincteur")}
                className={`w-16 ${
                  nbExtincteurs === incendieQuantite.nbExtincteurs
                    ? "text-fm4alldestructive"
                    : ""
                }`}
                id="nbExtincteurs"
              />
              <Label htmlFor="nbExtincteurs" className="text-sm flex-1">
                extincteur(s)
              </Label>
            </div>

            <div className="flex gap-4 items-center w-full">
              <Input
                id="nbBaes"
                type="number"
                value={nbBaes}
                min={0}
                max={MAX_NB_BAES}
                step={1}
                onChange={(e) => handleChangeNbr(e, "baes")}
                className={`w-16 ${
                  nbBaes === Math.ceil(incendieQuantite.nbExtincteurs * 2.3)
                    ? "text-fm4alldestructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbBaes" className="text-sm flex-1">
                BAES (blocs autonomes d’éclairage de sécurité)
              </Label>
            </div>

            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={nbTelBaes}
                min={0}
                max={MAX_NB_BAES}
                step={1}
                onChange={(e) => handleChangeNbr(e, "telBaes")}
                className={`w-16 ${
                  nbTelBaes === 1 ? "text-fm4alldestructive" : ""
                }`}
                id="nbTelBaes"
              />
              <Label htmlFor="nbTelBaes" className="text-sm flex-1">
                télécommande(s) BAES
              </Label>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">
          Précisez le nombre d’équipements
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SecuriteIncendieInputs;
