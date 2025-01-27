import { Checkbox } from "@/components/ui/checkbox";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { useContext } from "react";

type SnacksFruitsPropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    isSameFournisseur: boolean;
    gamme: GammeType;
    fruitsKgParSemaine: number | null;
    snacksPortionsParSemaine: number | null;
    boissonsConsosParSemaine: number | null;
    gFruitsParSemaineParPersonne: number | null;
    portionsSnacksParSemaineParPersonne: number | null;
    consosBoissonsParSemaineParPersonne: number | null;
    prixKgFruits: number | null;
    prixUnitaireSnacks: number | null;
    prixUnitaireBoissons: number | null;
    prixUnitaireLivraisonSiCafe: number | null;
    prixUnitaireLivraison: number | null;
    seuilFranco: number;
    fraisLivraisonPanier: number | null;
    panierMin: number | null;
    total: number | null;
    totalFruits: number;
    totalSnacks: number;
    totalBoissons: number;
    totalLivraison: number | null;
  };
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    isSameFournisseur: boolean;
    gamme: GammeType;
    fruitsKgParSemaine: number | null;
    snacksPortionsParSemaine: number | null;
    boissonsConsosParSemaine: number | null;
    gFruitsParSemaineParPersonne: number | null;
    portionsSnacksParSemaineParPersonne: number | null;
    consosBoissonsParSemaineParPersonne: number | null;
    prixKgFruits: number | null;
    prixUnitaireSnacks: number | null;
    prixUnitaireBoissons: number | null;
    prixUnitaireLivraisonSiCafe: number | null;
    prixUnitaireLivraison: number | null;
    seuilFranco: number;
    fraisLivraisonPanier: number | null;
    panierMin: number | null;
    total: number | null;
    totalFruits: number;
    totalSnacks: number;
    totalBoissons: number;
    totalLivraison: number | null;
  }) => void;
};

const SnacksFruitsPropositionCard = ({
  proposition,
  handleClickProposition,
}: SnacksFruitsPropositionCardProps) => {
  const { snacksFruits } = useContext(SnacksFruitsContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);

  if (
    snacksFruits.infos.choix.includes("fruits") &&
    !proposition.prixKgFruits
  ) {
    return (
      <div
        className={`flex-1 bg-${color} text-xl font-bold text-slate-200 flex items-center justify-center p-2`}
      >
        <p>Non proposé</p>
      </div>
    );
  }
  if (
    snacksFruits.infos.choix.includes("snacks") &&
    !proposition.prixUnitaireSnacks
  ) {
    return (
      <div
        className={`flex-1 bg-${color} text-xl font-bold text-slate-200 flex items-center justify-center p-2`}
      >
        <p>Non proposé</p>
      </div>
    );
  }
  if (
    snacksFruits.infos.choix.includes("boissons") &&
    !proposition.prixUnitaireBoissons
  ) {
    return (
      <div
        className={`flex-1 bg-${color} text-lg font-bold text-slate-200 flex items-center justify-center p-2`}
      >
        <p>Non proposé</p>
      </div>
    );
  }
  if (!proposition.total) {
    return (
      <div
        className={`flex-1 bg-${color} text-sm font-bold text-slate-200 flex items-center justify-center p-2`}
      >
        <p className="text-center">
          Le panier minimum hebdomadaire du fournisseur n&apos;est pas atteint
        </p>
      </div>
    );
  }
  const prixMensuelText = proposition.total
    ? `${Math.round(proposition.total / 12)} € / mois`
    : "Non proposé";
  const gFruitsParSemaineParPersonneText = snacksFruits.infos.choix.includes(
    "fruits"
  )
    ? `${proposition.gFruitsParSemaineParPersonne} g / personne / semaine`
    : "";
  const portionsSnacksParSemaineParPersonneText =
    snacksFruits.infos.choix.includes("snacks")
      ? `${proposition.portionsSnacksParSemaineParPersonne} portion(s) / personne / semaine`
      : "";
  const consosBoissonsParSemaineParPersonneText =
    snacksFruits.infos.choix.includes("boissons")
      ? `${proposition.consosBoissonsParSemaineParPersonne} boisson(s) / personne / semaine`
      : "";

  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 p-2 cursor-pointer ${
        snacksFruits.infos.fournisseurId === proposition.fournisseurId &&
        snacksFruits.infos.gammeSelected === gamme
          ? "ring-4 ring-inset ring-destructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Checkbox
        checked={
          snacksFruits.infos.fournisseurId === proposition.fournisseurId &&
          snacksFruits.infos.gammeSelected === gamme
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
      />
      <div>
        <p className="font-bold">{prixMensuelText}</p>
        {gFruitsParSemaineParPersonneText ? (
          <p className="text-xs">{gFruitsParSemaineParPersonneText}</p>
        ) : null}
        {portionsSnacksParSemaineParPersonneText ? (
          <p className="text-xs">{portionsSnacksParSemaineParPersonneText}</p>
        ) : null}
        {consosBoissonsParSemaineParPersonneText ? (
          <p className="text-xs">{consosBoissonsParSemaineParPersonneText}</p>
        ) : null}
      </div>
    </div>
  );
};

export default SnacksFruitsPropositionCard;
