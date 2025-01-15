import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { roundEffectif } from "@/lib/roundEffectif";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectTheConsoTarifsType } from "@/zod-schemas/theConsoTarifs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import Image from "next/image";
import { ChangeEvent, useContext } from "react";

type ThePropositionsProps = {
  theConsoTarifs: SelectTheConsoTarifsType[];
};

const ThePropositions = ({ theConsoTarifs }: ThePropositionsProps) => {
  const { client } = useContext(ClientContext);
  const { the, setThe } = useContext(TheContext);
  const { setTotalCafe } = useContext(TotalCafeContext);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newNbPersonnes = value
      ? parseInt(value)
      : Math.round((client.effectif ?? 0) * 0.15);
    setThe((prev) => ({ ...prev, nbPersonnes: newNbPersonnes }));
    if (the.theGammeSelected) {
      const proposition = propositions.find(
        (proposition) => proposition.gamme === the.theGammeSelected
      );
      setTotalCafe((prev) => ({
        ...prev,
        prixThe: (proposition?.prixUnitaire ?? 0) * newNbPersonnes * 400,
      }));
    }
  };
  const nbPersonnes = the.nbPersonnes;
  const nbThesParAn = nbPersonnes * 400;

  const propositions =
    theConsoTarifs
      ?.filter((tarif) => tarif.effectif === roundEffectif(nbPersonnes))
      .map((tarif) => ({
        ...tarif,
        prixAnnuel: Math.round(nbThesParAn * tarif.prixUnitaire),
      })) ?? [];

  const handleClickProposition = (
    gamme: GammeType,
    prixAnnuel: number | null
  ) => {
    if (the.theGammeSelected === gamme) {
      setThe((prev) => ({ ...prev, theGammeSelected: null }));
      setTotalCafe((prev) => ({
        ...prev,
        prixThe: null,
      }));
      return;
    }
    setThe((prev) => ({ ...prev, theGammeSelected: gamme }));
    setTotalCafe((prev) => ({
      ...prev,
      prixThe: prixAnnuel,
    }));
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      <div className="flex border-b flex-1">
        <div className="flex w-1/4 items-center justify-center flex-col">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center h-1/4 w-full py-2 px-4">
                  {getLogoFournisseurUrl(propositions[0].fournisseurId) ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={
                          getLogoFournisseurUrl(
                            propositions[0].fournisseurId
                          ) as string
                        }
                        alt={`logo-de-${propositions[0].nomEntreprise}`}
                        fill={true}
                        className="w-full h-full object-contain"
                        quality={100}
                      />
                    </div>
                  ) : (
                    propositions[0].nomEntreprise
                  )}
                </div>
              </TooltipTrigger>
              {propositions[0].slogan && (
                <TooltipContent>
                  <p className="text-sm italic">{propositions[0].slogan}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <div className="flex flex-col gap-6 w-full p-4">
            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={(the.nbPersonnes || nbPersonnes) ?? 0}
                min={1}
                max={300}
                step={1}
                onChange={handleChange}
                className={`w-16 ${
                  the.nbPersonnes === Math.round((client.effectif ?? 0) * 0.15)
                    ? "text-destructive"
                    : ""
                }`}
              />
              <Label htmlFor="nbDistribEmp" className="text-sm flex-1">
                personnes
              </Label>
            </div>
            <p className="text-xs text-destructive italic px-2 text-center">
              Les quantités sont estimées pour vous (environ 15% de votre
              effectif) mais vous pouvez les changer
            </p>
          </div>
        </div>

        {propositions.map((proposition) => {
          const gamme = proposition.gamme;
          const color =
            gamme === "essentiel"
              ? "fm4allessential"
              : gamme === "confort"
              ? "fm4allcomfort"
              : "fm4allexcellence";

          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                the.theGammeSelected === gamme
                  ? "ring-2 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={proposition.id}
              onClick={() =>
                handleClickProposition(gamme, proposition.prixAnnuel)
              }
            >
              <Checkbox
                checked={the.theGammeSelected === gamme}
                onCheckedChange={() =>
                  handleClickProposition(gamme, proposition.prixAnnuel)
                }
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p className="font-bold">{proposition.prixAnnuel} € / an</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThePropositions;
