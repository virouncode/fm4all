import { Checkbox } from "@/components/ui/checkbox";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import Image from "next/image";
import { useContext } from "react";

type SnacksFruitsPropositionsType = {
  formattedPropositions: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    isSameFournisseur: boolean;
    gamme: "essentiel" | "confort" | "excellence";
    fruitsKgParSemaine: number;
    snacksPortionsParSemaine: number;
    boissonsConsosParSemaine: number;
    gFruitsParSemaineParPersonne: number;
    portionsSnacksParSemaineParPersonne: number;
    consosBoissonsParSemaineParPersonne: number;
    prixKgFruits: number;
    prixUnitaireSnacks: number;
    prixUnitaireBoissons: number;
    prixUnitaireLivraisonSiCafe: number;
    prixUnitaireLivraison: number;
    seuilFranco: number;
    fraisLivraisonPanier: number;
    panierMin: number;
    total: number;
    totalFruits: number;
    totalSnacks: number;
    totalBoissons: number;
    totalLivraison: number;
  }[][];
};

const SnacksFruitsPropositions = ({
  formattedPropositions,
}: SnacksFruitsPropositionsType) => {
  const { snacksFruits, setSnacksFruits } = useContext(SnacksFruitsContext);
  const { setTotalSnacksFruits } = useContext(TotalSnacksFruitsContext);

  const handleClickProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    isSameFournisseur: boolean;
    gamme: "essentiel" | "confort" | "excellence";
    fruitsKgParSemaine: number;
    snacksPortionsParSemaine: number;
    boissonsConsosParSemaine: number;
    gFruitsParSemaineParPersonne: number;
    portionsSnacksParSemaineParPersonne: number;
    consosBoissonsParSemaineParPersonne: number;
    prixKgFruits: number;
    prixUnitaireSnacks: number;
    prixUnitaireBoissons: number;
    prixUnitaireLivraisonSiCafe: number;
    prixUnitaireLivraison: number;
    seuilFranco: number;
    fraisLivraisonPanier: number;
    panierMin: number;
    total: number;
    totalFruits: number;
    totalSnacks: number;
    totalBoissons: number;
    totalLivraison: number;
  }) => {
    const {
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      isSameFournisseur,
      gamme,
      fruitsKgParSemaine,
      snacksPortionsParSemaine,
      boissonsConsosParSemaine,
      prixKgFruits,
      prixUnitaireSnacks,
      prixUnitaireBoissons,
      prixUnitaireLivraisonSiCafe,
      prixUnitaireLivraison,
      seuilFranco,
      panierMin,
      total,
      totalFruits,
      totalSnacks,
      totalBoissons,
      totalLivraison,
    } = proposition;

    if (
      snacksFruits.infos.fournisseurId === proposition.fournisseurId &&
      snacksFruits.infos.gammeSelected === proposition.gamme
    ) {
      setSnacksFruits((prev) => ({
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          isSameFournisseur: false,
          gammeSelected: null,
        },
        quantites: {
          ...prev.quantites,
          fruitsKgParSemaine: 0,
          snacksPortionsParSemaine: 0,
          boissonsConsosParSemaine: 0,
        },
        prix: {
          prixKgFruits: null,
          prixUnitaireSnacks: null,
          prixUnitaireBoissons: null,
          prixUnitaireLivraisonSiCafe: null,
          prixUnitaireLivraison: null,
          seuilFranco: null,
          panierMin: null,
        },
      }));
      setTotalSnacksFruits({
        totalFruits: 0,
        totalSnacks: 0,
        totalBoissons: 0,
        totalLivraison: 0,
        total: 0,
      });
      return;
    }
    setSnacksFruits((prev) => ({
      infos: {
        ...prev.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
        isSameFournisseur,
        gammeSelected: gamme,
      },
      quantites: {
        ...prev.quantites,
        fruitsKgParSemaine,
        snacksPortionsParSemaine,
        boissonsConsosParSemaine,
      },
      prix: {
        prixKgFruits,
        prixUnitaireSnacks,
        prixUnitaireBoissons,
        prixUnitaireLivraisonSiCafe,
        prixUnitaireLivraison,
        seuilFranco,
        panierMin,
      },
    }));
    setTotalSnacksFruits({
      totalFruits,
      totalSnacks,
      totalBoissons,
      totalLivraison,
      total,
    });
  };

  if (snacksFruits.infos.choix.length === 0) {
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
                    <div className="flex w-1/4 items-center justify-center px-4">
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
                  {propositions[0].sloganFournisseur && (
                    <TooltipContent>
                      <p className="text-sm italic">
                        {propositions[0].sloganFournisseur}
                      </p>
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
                  snacksFruits.infos.choix.includes("fruits") &&
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
                  snacksFruits.infos.choix.includes("snacks") &&
                  proposition.prixUnitaireSnacks === 0
                ) {
                  return (
                    <div
                      key={proposition.id}
                      className={`flex-1 bg-${color} text-xl font-bold text-slate-200 flex items-center justify-center p-2`}
                    >
                      <p>Non proposé</p>
                    </div>
                  );
                }
                if (
                  snacksFruits.infos.choix.includes("boissons") &&
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
                const prixAnnuelText = proposition.total
                  ? `${formatNumber(proposition.total)} € /an`
                  : "Non proposé";
                const gFruitsParSemaineParPersonneText =
                  snacksFruits.infos.choix.includes("fruits")
                    ? `${proposition.gFruitsParSemaineParPersonne} g / personne / semaine`
                    : "";
                const portionsSnacksParSemaineParPersonneText =
                  snacksFruits.infos.choix.includes("snacks")
                    ? `${proposition.portionsSnacksParSemaineParPersonne} portions / personne / semaine`
                    : "";
                const consosBoissonsParSemaineParPersonneText =
                  snacksFruits.infos.choix.includes("boissons")
                    ? `${proposition.consosBoissonsParSemaineParPersonne} consos / personne / semaine`
                    : "";

                return (
                  <div
                    className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                      snacksFruits.infos.fournisseurId ===
                        proposition.fournisseurId &&
                      snacksFruits.infos.gammeSelected === gamme
                        ? "ring-4 ring-inset ring-destructive"
                        : ""
                    }`}
                    key={proposition.id}
                    onClick={() => handleClickProposition(proposition)}
                  >
                    <Checkbox
                      checked={
                        snacksFruits.infos.fournisseurId ===
                          proposition.fournisseurId &&
                        snacksFruits.infos.gammeSelected === gamme
                      }
                      onCheckedChange={() =>
                        handleClickProposition(proposition)
                      }
                      className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    />
                    <div>
                      <p className="font-bold">{prixAnnuelText}</p>
                      {gFruitsParSemaineParPersonneText ? (
                        <p className="text-xs">
                          {gFruitsParSemaineParPersonneText}
                        </p>
                      ) : null}
                      {portionsSnacksParSemaineParPersonneText ? (
                        <p className="text-xs">
                          {portionsSnacksParSemaineParPersonneText}
                        </p>
                      ) : null}
                      {consosBoissonsParSemaineParPersonneText ? (
                        <p className="text-xs">
                          {consosBoissonsParSemaineParPersonneText}
                        </p>
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
