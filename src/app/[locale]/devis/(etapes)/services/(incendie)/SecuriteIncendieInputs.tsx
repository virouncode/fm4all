import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { useTranslations } from "next-intl";
import Image from "next/image";
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
  const tIncendie = useTranslations("DevisPage.services.incendie");
  return (
    <div className="flex flex-col gap-6 w-3/4">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex gap-4 items-center  w-full">
              <Input
                type="number"
                value={nbExtincteurs || ""}
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
                {tIncendie("extincteurs").toLowerCase()}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-60">
            <div className="w-40 h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
              <Image
                src={"/img/services/extincteur.webp"}
                alt={`illustration de nettoyage`}
                fill={true}
                className="object-contain object-center cursor-pointer"
                quality={100}
              />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex gap-4 items-center w-full">
              <Input
                id="nbBaes"
                type="number"
                value={nbBaes || ""}
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
                {tIncendie(
                  "baes-blocs-autonomes-d-eclairage-de-securite"
                ).toLowerCase()}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-60">
            <div className="w-40 h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
              <Image
                src={"/img/services/baes.webp"}
                alt={tIncendie(
                  "illustration-de-bloc-autonome-declairage-de-securite"
                )}
                fill={true}
                className="object-contain object-center cursor-pointer"
                quality={100}
              />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={nbTelBaes || ""}
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
                {tIncendie("telecommandes-baes").toLowerCase()}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-60">
            <div className="w-40 h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
              <Image
                src={"/img/services/tel_baes.webp"}
                alt={tIncendie(
                  "illustration-de-telecommande-de-bloc-autonome-declairage-de-securite"
                )}
                fill={true}
                className="object-contain object-center cursor-pointer"
                quality={100}
              />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SecuriteIncendieInputs;
