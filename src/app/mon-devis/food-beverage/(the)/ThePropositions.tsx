import { Checkbox } from "@/components/ui/checkbox";
import { CafeContext } from "@/context/CafeProvider";
import { ClientContext } from "@/context/ClientProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { roundEffectif } from "@/lib/roundEffectif";
import { SelectCafeQuantitesType } from "@/zod-schemas/cafeQuantites";
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
  cafeQuantites: SelectCafeQuantitesType[];
};

const ThePropositions = ({
  theConsoTarifs,
  cafeQuantites,
}: ThePropositionsProps) => {
  const { client } = useContext(ClientContext);
  const { cafe } = useContext(CafeContext);
  const { the, setThe } = useContext(TheContext);
  const { setTotalThe } = useContext(TotalTheContext);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newNbPersonnes = value
      ? parseInt(value)
      : Math.round((client.effectif ?? 0) * 0.15);
    const cafeQuantite = cafeQuantites.find(
      (quantite) => quantite.effectif === roundEffectif(newNbPersonnes / 0.15)
    );
    const nbCafesParAn = cafeQuantite?.nbCafesParAn ?? 0;
    const prixUnitaire =
      theConsoTarifs.find(
        (tarif) =>
          tarif.effectif === roundEffectif(nbPersonnes / 0.15) &&
          tarif.fournisseurId === cafe.infos.fournisseurId &&
          tarif.gamme === the.infos.gammeSelected
      )?.prixUnitaire ?? 0;

    setThe((prev) => ({
      ...prev,
      quantites: {
        ...prev.quantites,
        nbPersonnes: newNbPersonnes,
      },
      prix: {
        prixUnitaire: the.infos.gammeSelected
          ? prixUnitaire
          : prev.prix.prixUnitaire,
      },
    }));
    if (the.infos.gammeSelected) {
      setTotalThe({
        totalService: Math.round(nbCafesParAn * prixUnitaire * 0.15),
      });
    }
  };

  const handleClickProposition = (proposition: {
    prixAnnuel: number;
    infos: string | null;
    prixUnitaire: number;
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    effectif: number;
  }) => {
    const { gamme, prixAnnuel, prixUnitaire } = proposition;
    if (the.infos.gammeSelected === gamme) {
      setThe((prev) => ({
        ...prev,
        infos: {
          gammeSelected: null,
        },
        prix: {
          prixUnitaire: 0,
        },
      }));
      setTotalThe({
        totalService: 0,
      });
      return;
    }
    setThe((prev) => ({
      ...prev,
      infos: {
        gammeSelected: gamme,
      },
      prix: {
        prixUnitaire: prixUnitaire,
      },
    }));
    setTotalThe({
      totalService: prixAnnuel,
    });
  };

  const nbPersonnes = the.quantites.nbPersonnes;
  const nbThesParAn = nbPersonnes * 400 * 0.15;
  const nbTassesParJour = (client.effectif ?? 0) * 2 * 0.15;

  const propositions =
    theConsoTarifs
      ?.filter(
        (tarif) =>
          tarif.effectif === client.effectif &&
          tarif.fournisseurId === cafe.infos.fournisseurId
      )
      .map((tarif) => ({
        ...tarif,
        prixAnnuel: Math.round(nbThesParAn * tarif.prixUnitaire),
      })) ?? [];

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
                        alt={`logo-de-${propositions[0].nomFournisseur}`}
                        fill={true}
                        className="w-full h-full object-contain"
                        quality={100}
                      />
                    </div>
                  ) : (
                    propositions[0].nomFournisseur
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
          {/* <div className="flex flex-col gap-6 w-full p-4">
            <div className="flex gap-4 items-center w-full">
              <Input
                type="number"
                value={(the.quantites.nbPersonnes || nbPersonnes) ?? 0}
                min={1}
                max={300}
                step={1}
                onChange={handleChange}
                className={`w-16 ${
                  the.quantites.nbPersonnes ===
                  Math.round((client.effectif ?? 0) * 0.15)
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
          </div> */}
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
                the.infos.gammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
                  : ""
              } px-8`}
              key={proposition.id}
              onClick={() => handleClickProposition(proposition)}
            >
              <Checkbox
                checked={the.infos.gammeSelected === gamme}
                onCheckedChange={() => handleClickProposition(proposition)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p className="font-bold">{proposition.prixAnnuel} € / an*</p>
                <p className="text-sm">
                  Consommables ~ {nbTassesParJour} tasses / j
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThePropositions;
