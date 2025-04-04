import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type SnacksFruitsPropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
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
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
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
  const t = useTranslations("DevisPage");
  const tSnacks = useTranslations("DevisPage.foodBeverage.snacks");
  const tGlobal = useTranslations("Global");
  const { snacksFruits } = useContext(SnacksFruitsContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);

  if (
    snacksFruits.infos.choix.includes("fruits") &&
    !proposition.prixKgFruits
  ) {
    return (
      <div
        className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-base gap-4 min-h-36 text-center font-bold`}
      >
        <p>{t("non-propose-pour-ces-criteres")}</p>
      </div>
    );
  }
  if (
    snacksFruits.infos.choix.includes("snacks") &&
    !proposition.prixUnitaireSnacks
  ) {
    return (
      <div
        className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-xl gap-4 min-h-36`}
      >
        <p>{t("non-propose")}</p>
      </div>
    );
  }
  if (
    snacksFruits.infos.choix.includes("boissons") &&
    !proposition.prixUnitaireBoissons
  ) {
    return (
      <div
        className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-xl gap-4 min-h-36`}
      >
        <p>{t("non-propose")}</p>
      </div>
    );
  }
  if (!proposition.total) {
    return (
      <div
        className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-base gap-4 min-h-36 font-bold`}
      >
        <p className="text-center">
          {tSnacks("panier-minimum-hebdomadaire-non-atteint")}
        </p>
      </div>
    );
  }
  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round((proposition.total * MARGE) / 12))}{" "}
      {t("euros-mois")}
    </p>
  );
  const gFruitsParSemaineParPersonneText = snacksFruits.infos.choix.includes(
    "fruits"
  ) ? (
    <li className="list-check">
      {proposition.gFruitsParSemaineParPersonne} {tSnacks("g-personne-semaine")}
    </li>
  ) : null;

  const portionsSnacksParSemaineParPersonneText =
    snacksFruits.infos.choix.includes("snacks") ? (
      <li className="list-check">
        {proposition.portionsSnacksParSemaineParPersonne}{" "}
        {tSnacks("portion-s-personne-semaine")}
      </li>
    ) : null;

  const consosBoissonsParSemaineParPersonneText =
    snacksFruits.infos.choix.includes("boissons") ? (
      <li className="list-check">
        {proposition.consosBoissonsParSemaineParPersonne}{" "}
        {tSnacks("boisson-s-personne-semaine")}
      </li>
    ) : null;

  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {proposition.gamme === "essentiel"
        ? tGlobal("essentiel")
        : proposition.gamme === "confort"
          ? tGlobal("confort")
          : tGlobal("excellence")}
    </p>
  );

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 mx-auto">
      {gFruitsParSemaineParPersonneText}
      {portionsSnacksParSemaineParPersonneText}
      {consosBoissonsParSemaineParPersonneText}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      {gFruitsParSemaineParPersonneText}
      {portionsSnacksParSemaineParPersonneText}
      {consosBoissonsParSemaineParPersonneText}
    </ul>
  );

  const imgProduit = (
    <div className="flex items-center justify-between gap-2">
      <div className="w-full h-40 relative mx-auto rounded-lg border-slate-300 border bg-slate-100 overflow-hidden">
        <Image
          src="/img/services/fruits.webp"
          alt="illustration-corbeille-fruits"
          fill
          quality={100}
          className="object-cover"
        />
      </div>
      <div className="w-full h-40 relative mx-auto rounded-lg border-slate-300 border bg-slate-100 overflow-hidden">
        <Image
          src="/img/services/snacks.webp"
          alt="illustration-snacks"
          fill
          quality={100}
          className="object-cover"
        />
      </div>
      <div className="w-full h-40 relative mx-auto rounded-lg border-slate-300 border bg-slate-100 overflow-hidden">
        <Image
          src="/img/services/boissons.webp"
          alt="illustration-boissons"
          fill
          quality={100}
          className="object-cover"
        />
      </div>
    </div>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 p-4 cursor-pointer min-h-36 ${
        snacksFruits.infos.fournisseurId === proposition.fournisseurId &&
        snacksFruits.infos.gammeSelected === gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={
          snacksFruits.infos.fournisseurId === proposition.fournisseurId &&
          snacksFruits.infos.gammeSelected === gamme
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title={t("selectionnez-cette-proposition")}
      />
      <div>
        <div className="flex gap-2 items-center">
          {totalMensuelText}
          <Dialog>
            <DialogTrigger asChild>
              <Info
                size={16}
                className="cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              {imgProduit}
              <p className="text-xs italic text-end">
                {t("photos-non-contractuelles")}
              </p>
              {infosProduitDialog}
            </DialogContent>
          </Dialog>
        </div>
        {infosProduit}
      </div>
    </div>
  );
};

export default SnacksFruitsPropositionCard;
