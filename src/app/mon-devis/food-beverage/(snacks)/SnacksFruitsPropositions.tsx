import { Checkbox } from "@/components/ui/checkbox";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { SelectFruitsTarifsType } from "@/zod-schemas/fruitsTarifs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import Image from "next/image";
import { useContext } from "react";

type SnacksFruitsPropositionsType = {
  formattedPropositions: (SelectFruitsTarifsType & {
    prixAnnuel: number;
    isSameFournisseur: boolean;
    fruitsKgParSemaine: number;
    snacksPortionsParSemaine: number;
    boissonsConsosParSemaine: number;
    prixKgFruits: number;
    prixUnitaireSnacks: number;
    prixUnitaireBoissons: number;
    fraisLivraisonPanier: number;
    seuilFranco: number;
    panierMin: number;
  })[][];
};

const SnacksFruitsPropositions = ({
  formattedPropositions,
}: SnacksFruitsPropositionsType) => {
  const { snacksFruits, setSnacksFruits } = useContext(SnacksFruitsContext);
  const { setTotalSnacksFruits } = useContext(TotalSnacksFruitsContext);

  const handleClickProposition = (
    proposition: SelectFruitsTarifsType & {
      prixAnnuel: number;
      isSameFournisseur: boolean;
      fruitsKgParSemaine: number;
      snacksPortionsParSemaine: number;
      boissonsConsosParSemaine: number;
      prixKgFruits: number;
      prixUnitaireSnacks: number;
      prixUnitaireBoissons: number;
      fraisLivraisonPanier: number;
      seuilFranco: number;
      panierMin: number;
    }
  ) => {
    if (
      snacksFruits.fournisseurId === proposition.fournisseurId &&
      snacksFruits.gammeSelected === proposition.gamme
    ) {
      setSnacksFruits((prev) => ({
        ...prev,
        fournisseurId: null,
        gammeSelected: null,
      }));
      setTotalSnacksFruits((prev) => ({
        ...prev,
        nomFournisseur: null,
        prixFruits: null,
        prixSnacks: null,
        prixBoissons: null,
        prixLivraison: null,
        prixTotal: null,
      }));
      return;
    }
    setSnacksFruits((prev) => ({
      ...prev,
      fournisseurId: proposition.fournisseurId,
      gammeSelected: proposition.gamme,
    }));
    setTotalSnacksFruits((prev) => ({
      ...prev,
      nomFournisseur: proposition.nomEntreprise,
      prixFruits: Math.round(
        52 * proposition.fruitsKgParSemaine * proposition.prixKgFruits
      ),
      prixSnacks: Math.round(
        52 *
          proposition.snacksPortionsParSemaine *
          proposition.prixUnitaireSnacks
      ),
      prixBoissons: Math.round(
        52 *
          proposition.boissonsConsosParSemaine *
          proposition.prixUnitaireBoissons
      ),
      prixLivraison: Math.round(52 * proposition.fraisLivraisonPanier),
      prixTotal: proposition.prixAnnuel,
    }));
  };

  if (snacksFruits.choix.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border rounded-xl overflow-hidden">
        <p>Nous n&apos;avons pas d&apos;offres correspondant à ces critères</p>
        <p>
          Veuillez choisir au moins une valeur parmi &quot;fruits, snacks et
          boissons&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((propositions) => (
            <div
              className="flex border-b flex-1"
              key={propositions[0].fournisseurId}
            >
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex w-1/4 items-center justify-center">
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
              {propositions.map((proposition) => {
                const gamme = proposition.gamme;
                const color =
                  gamme === "essentiel"
                    ? "fm4allessential"
                    : gamme === "confort"
                    ? "fm4allcomfort"
                    : "fm4allexcellence";
                if (
                  snacksFruits.choix.includes("fruits") &&
                  proposition.prixKgFruits === 0
                ) {
                  return (
                    <div
                      key={proposition.id}
                      className={`flex-1 bg-${color} text-xl font-bold text-slate-200 flex items-center justify-center`}
                    >
                      <p>Non proposé</p>
                    </div>
                  );
                }
                if (
                  snacksFruits.choix.includes("snacks") &&
                  proposition.prixUnitaireSnacks === 0
                ) {
                  return (
                    <div
                      key={proposition.id}
                      className={`flex-1 bg-${color} text-xl font-bold text-slate-200 flex items-center justify-center`}
                    >
                      <p>Non proposé</p>
                    </div>
                  );
                }
                if (
                  snacksFruits.choix.includes("boissons") &&
                  proposition.prixUnitaireBoissons === 0
                ) {
                  return (
                    <div
                      key={proposition.id}
                      className={`flex-1 bg-${color} text-lg font-bold text-slate-200 flex items-center justify-center`}
                    >
                      <p>Non proposé</p>
                    </div>
                  );
                }
                const prixAnnuel = proposition.prixAnnuel
                  ? `${formatNumber(proposition.prixAnnuel)} € /an`
                  : "Non proposé";
                const kgFruitsParSemaine = snacksFruits.choix.includes("fruits")
                  ? `${
                      proposition.fruitsKgParSemaine /
                        snacksFruits.nbPersonnes <
                      1
                        ? `${
                            Math.round(
                              ((proposition.fruitsKgParSemaine /
                                snacksFruits.nbPersonnes) *
                                1000) /
                                10
                            ) * 10
                          } g de fruits / personne / semaine`
                        : `${(
                            proposition.fruitsKgParSemaine /
                            snacksFruits.nbPersonnes
                          ).toFixed(2)} kg de fruits / personne / semaine`
                    }`
                  : "";
                const portionsSnacksParSemaine = snacksFruits.choix.includes(
                  "snacks"
                )
                  ? `${Math.round(
                      proposition.snacksPortionsParSemaine /
                        snacksFruits.nbPersonnes
                    )} portions de snacks / personne / semaine`
                  : "";
                const boissonsConsosParSemaine = snacksFruits.choix.includes(
                  "boissons"
                )
                  ? `${Math.round(
                      proposition.boissonsConsosParSemaine /
                        snacksFruits.nbPersonnes
                    )} boissons / personne / semaine`
                  : "";

                return (
                  <div
                    className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                      snacksFruits.fournisseurId ===
                        proposition.fournisseurId &&
                      snacksFruits.gammeSelected === gamme
                        ? "ring-4 ring-inset ring-destructive"
                        : ""
                    }`}
                    key={proposition.id}
                    onClick={() => handleClickProposition(proposition)}
                  >
                    <Checkbox
                      checked={
                        snacksFruits.fournisseurId ===
                          proposition.fournisseurId &&
                        snacksFruits.gammeSelected === gamme
                      }
                      onCheckedChange={() =>
                        handleClickProposition(proposition)
                      }
                      className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    />
                    <div>
                      <p className="font-bold">{prixAnnuel}</p>
                      {kgFruitsParSemaine ? (
                        <p className="text-xs">{kgFruitsParSemaine}</p>
                      ) : null}
                      {portionsSnacksParSemaine ? (
                        <p className="text-xs">{portionsSnacksParSemaine}</p>
                      ) : null}
                      {boissonsConsosParSemaine ? (
                        <p className="text-xs">{boissonsConsosParSemaine}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        : null}
    </div>
  );
};

export default SnacksFruitsPropositions;
