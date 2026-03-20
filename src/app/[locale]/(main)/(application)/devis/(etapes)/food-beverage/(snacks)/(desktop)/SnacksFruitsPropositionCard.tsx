import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE, S_PAR_MOIS } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useSnacksFruitsStore } from "@/stores/devis/snacksFruitsStore";
import { GammeType } from "@/zod-schemas/gamme.schema";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export type SnacksFruitsPropositionItem = {
  id: string;
  entrepriseId: string;
  nomPrestataire: string;
  sloganPrestataire: string | null;
  logoStorageKey: string | null;
  anneeCreation: number | null;
  ca: string | null;
  effectifFournisseur: string | null;
  nbClients: number | null;
  noteGoogle: string | null;
  nbAvis: number | null;
  isSamePrestataire: boolean;
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
  totalSansRemise: number | null;
  totalFruits: number;
  totalSnacks: number;
  totalBoissons: number;
  totalLivraison: number | null;
};

type SnacksFruitsPropositionCardProps = {
  proposition: SnacksFruitsPropositionItem;
  handleClickProposition: (proposition: SnacksFruitsPropositionItem) => void;
};

const SnacksFruitsPropositionCard = ({
  proposition,
  handleClickProposition,
}: SnacksFruitsPropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tSnacks = useTranslations("DevisPage.foodBeverage.snacks");
  const tGlobal = useTranslations("Global");
  const snacksFruits = useSnacksFruitsStore((s) => s.snacksFruits);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);

  if (
    snacksFruits.infos.choix.includes("fruits") &&
    !proposition.prixKgFruits
  ) {
    return (
      <div
        className={`flex flex-1 bg-${color} min-h-36 items-center justify-center gap-4 p-4 text-center text-base font-bold text-slate-200`}
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
        className={`flex flex-1 bg-${color} min-h-36 items-center justify-center gap-4 p-4 text-xl text-slate-200`}
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
        className={`flex flex-1 bg-${color} min-h-36 items-center justify-center gap-4 p-4 text-xl text-slate-200`}
      >
        <p>{t("non-propose")}</p>
      </div>
    );
  }
  if (!proposition.total) {
    return (
      <div
        className={`flex flex-1 bg-${color} min-h-36 items-center justify-center gap-4 p-4 text-base font-bold text-slate-200`}
      >
        <p className="text-center">
          {tSnacks("panier-minimum-hebdomadaire-non-atteint", {
            panierMin: proposition.panierMin
              ? `(${Math.round(proposition.panierMin * MARGE * S_PAR_MOIS)} ${t("euros-mois")} ${tSnacks("cafe-compris")})`
              : "",
          })}
        </p>
      </div>
    );
  }
  const totalMensuelSansRemiseText =
    proposition.totalSansRemise &&
    proposition.totalSansRemise !== proposition.total ? (
      <p className="ml-4 text-xl font-bold line-through">
        {formatNumber((proposition.totalSansRemise * MARGE) / 12)}{" "}
        {t("euros-mois")}
      </p>
    ) : null;
  const totalMensuelText = (
    <p className="ml-4 text-xl font-bold">
      {formatNumber((proposition.total * MARGE) / 12)} {t("euros-mois")}
      {totalMensuelSansRemiseText ? "*" : null}
    </p>
  );
  const gFruitsParSemaineParPersonneText = snacksFruits.infos.choix.includes(
    "fruits",
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
    <ul className="mx-auto flex flex-col px-4 text-xs">
      {gFruitsParSemaineParPersonneText}
      {portionsSnacksParSemaineParPersonneText}
      {consosBoissonsParSemaineParPersonneText}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="mx-auto flex flex-col px-4 text-sm">
      {gFruitsParSemaineParPersonneText}
      {portionsSnacksParSemaineParPersonneText}
      {consosBoissonsParSemaineParPersonneText}
    </ul>
  );

  const imgProduit = (
    <div className="flex items-center justify-between gap-2">
      <div className="relative mx-auto h-40 w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
        <Image
          src="/img/services/fruits.webp"
          alt="illustration-corbeille-fruits"
          fill
          className="object-cover"
          sizes="(min-width:768px) 20vw"
        />
      </div>
      <div className="relative mx-auto h-40 w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
        <Image
          src="/img/services/snacks.webp"
          alt="illustration-snacks"
          fill
          className="object-cover"
          sizes="(min-width:768px) 20vw"
        />
      </div>
      <div className="relative mx-auto h-40 w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
        <Image
          src="/img/services/boissons.webp"
          alt="illustration-boissons"
          fill
          className="object-cover"
          sizes="(min-width:768px) 20vw"
        />
      </div>
    </div>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} min-h-36 cursor-pointer items-center justify-center gap-4 p-4 text-2xl text-slate-200 ${
        snacksFruits.infos.entrepriseId === proposition.entrepriseId &&
        snacksFruits.infos.gammeSelected === gamme
          ? "ring-destructive ring-4 ring-inset"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={
          snacksFruits.infos.entrepriseId === proposition.entrepriseId &&
          snacksFruits.infos.gammeSelected === gamme
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-destructive"
        title={t("selectionnez-cette-proposition")}
        data-testid="snacksfruits-switch"
      />
      <div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            {totalMensuelSansRemiseText}
            <span data-testid="total-mensuel-snacksfruits">
              {totalMensuelText}
            </span>
          </div>

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
              <p className="text-end text-xs italic">
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
