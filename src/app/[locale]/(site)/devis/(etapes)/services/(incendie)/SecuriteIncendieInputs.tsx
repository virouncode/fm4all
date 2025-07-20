import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MAX_NB_BAES, MAX_NB_EXTINCTEURS } from "@/constants/constants";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { useTranslations } from "next-intl";
import Image from "next/image";

type SecuriteIncendieInputsProps = {
  nbExtincteurs: number;
  nbBaes: number;
  nbTelBaes: number;
  handleChangeNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "extincteur" | "baes" | "telBaes",
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
    <div className="flex w-3/4 flex-col gap-6">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex w-full items-center gap-4">
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
              <Label htmlFor="nbExtincteurs" className="flex-1 text-sm">
                {tIncendie("extincteurs").toLowerCase()}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-60">
            <div className="relative h-60 w-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
              <Image
                src={"/img/services/extincteur.webp"}
                alt={`illustration de nettoyage`}
                fill={true}
                className="cursor-pointer object-contain object-center"
                quality={100}
              />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex w-full items-center gap-4">
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
              <Label htmlFor="nbBaes" className="flex-1 text-sm">
                {tIncendie(
                  "baes-blocs-autonomes-d-eclairage-de-securite",
                ).toLowerCase()}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-60">
            <div className="relative h-60 w-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
              <Image
                src={"/img/services/baes.webp"}
                alt={tIncendie(
                  "illustration-de-bloc-autonome-declairage-de-securite",
                )}
                fill={true}
                className="cursor-pointer object-contain object-center"
                quality={100}
              />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex w-full items-center gap-4">
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
              <Label htmlFor="nbTelBaes" className="flex-1 text-sm">
                {tIncendie("telecommandes-baes").toLowerCase()}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-60">
            <div className="relative h-60 w-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
              <Image
                src={"/img/services/tel_baes.webp"}
                alt={tIncendie(
                  "illustration-de-telecommande-de-bloc-autonome-declairage-de-securite",
                )}
                fill={true}
                className="cursor-pointer object-contain object-center"
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
