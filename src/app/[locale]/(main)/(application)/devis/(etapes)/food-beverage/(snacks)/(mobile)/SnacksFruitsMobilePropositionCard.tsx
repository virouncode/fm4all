import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
import StarRating from "@/components/star/StarRating";
import { CarouselItem } from "@/components/ui/carousel";
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
import { useSnacksFruitsStore } from "@/stores/snacksFruitsStore";
import { useTranslations } from "next-intl";
import Image from "next/image";

type SnacksFruitsMobilePropositionCardProps = {
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
    gamme: "essentiel" | "confort" | "excellence";
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
    gamme: "essentiel" | "confort" | "excellence";
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
  }) => void;
};

const SnacksFruitsMobilePropositionCard = ({
  proposition,
  handleClickProposition,
}: SnacksFruitsMobilePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tSnacks = useTranslations("DevisPage.foodBeverage.snacks");
  const tGlobal = useTranslations("Global");
  const snacksFruits = useSnacksFruitsStore((s) => s.snacksFruits);
  const {
    gamme,
    fournisseurId,
    nomFournisseur,
    sloganFournisseur,
    logoUrl,
    locationUrl,
    anneeCreation,
    ca,
    effectifFournisseur,
    nbClients,
    noteGoogle,
    nbAvis,
    total,
  } = proposition;

  const color = getFm4AllColor(gamme);
  const isClickable =
    (snacksFruits.infos.choix.includes("fruits") &&
      !proposition.prixKgFruits) ||
    (snacksFruits.infos.choix.includes("snacks") &&
      !proposition.prixUnitaireSnacks) ||
    (snacksFruits.infos.choix.includes("boissons") &&
      !proposition.prixUnitaireBoissons)
      ? false
      : total
        ? true
        : false;

  const totalMensuelSansRemiseText =
    proposition.totalSansRemise &&
    proposition.totalSansRemise !== proposition.total ? (
      <p className="text-end text-sm font-bold line-through">
        {formatNumber((proposition.totalSansRemise * MARGE) / 12)}{" "}
        {t("euros-mois")}
      </p>
    ) : null;
  const totalMensuelText =
    snacksFruits.infos.choix.includes("fruits") && !proposition.prixKgFruits ? (
      <p className="text-end text-sm font-bold">
        {t("non-propose-pour-ces-criteres")}
      </p>
    ) : snacksFruits.infos.choix.includes("snacks") &&
      !proposition.prixUnitaireSnacks ? (
      <p className="text-end text-sm font-bold">
        {t("non-propose-pour-ces-criteres")}
      </p>
    ) : snacksFruits.infos.choix.includes("boissons") &&
      !proposition.prixUnitaireBoissons ? (
      <p className="text-end text-sm font-bold">
        {t("non-propose-pour-ces-criteres")}
      </p>
    ) : total ? (
      <div className="flex flex-col">
        {totalMensuelSansRemiseText}
        <p className="text-end text-sm font-bold">
          {formatNumber((total * MARGE) / 12)} {t("euros-mois")}
          {totalMensuelSansRemiseText ? "*" : null}
        </p>
      </div>
    ) : (
      <p className="text-end text-sm font-bold">
        {tSnacks("panier-minimum-hebdomadaire-non-atteint", {
          panierMin: proposition.panierMin
            ? `(${Math.round(proposition.panierMin * MARGE * S_PAR_MOIS)} ${t("euros-mois")} ${tSnacks("cafe-compris")})`
            : "",
        })}
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
    <ul className="flex w-2/3 flex-col px-4 text-xs">
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
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-100">
      <Image
        src={"/img/services/snacks-fruits.webp"}
        alt={`illustration de nettoyage`}
        fill
        className="cursor-pointer object-contain"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="flex items-center justify-between gap-2">
      <div className="relative mx-auto h-40 w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
        <Image
          src="/img/services/fruits.webp"
          alt="illustration-corbeille-fruits"
          fill
          className="object-cover"
          sizes="(max-width:768px) 33vw"
        />
      </div>
      <div className="relative mx-auto h-40 w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
        <Image
          src="/img/services/snacks.webp"
          alt="illustration-snacks"
          fill
          className="object-cover"
          sizes="(max-width:768px) 33vw"
        />
      </div>
      <div className="relative mx-auto h-40 w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
        <Image
          src="/img/services/boissons.webp"
          alt="illustration-boissons"
          fill
          className="object-cover"
          sizes="(max-width:768px) 33vw"
        />
      </div>
    </div>
  );

  return (
    <CarouselItem>
      <div
        className={`bg-${color} flex h-56 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          snacksFruits.infos.fournisseurId === fournisseurId &&
          snacksFruits.infos.gammeSelected === gamme
            ? "ring-fm4alldestructive ring-4 ring-inset"
            : ""
        }`}
      >
        <div className="flex h-1/2 items-center gap-2 border-b border-slate-200 pb-2">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {imgProduitDialog}
                <p className="text-end text-xs italic">
                  {t("photo-non-contractuelle")}
                </p>
                {infosProduitDialog}
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex h-full w-2/3 flex-col gap-1">
            <p className="text-sm font-bold">{nomFournisseur}</p>
            <Dialog>
              <DialogTrigger asChild>
                {logoUrl ? (
                  <div className="relative h-10">
                    <Image
                      src={logoUrl}
                      alt={`logo-de-${nomFournisseur}`}
                      fill={true}
                      className="cursor-pointer object-contain object-left"
                      sizes="(max-width:768px) 100vw"
                    />
                  </div>
                ) : null}
              </DialogTrigger>
              <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                <DialogHeader>
                  <DialogTitle>{nomFournisseur}</DialogTitle>
                </DialogHeader>
                <FournisseurDialog
                  sloganFournisseur={sloganFournisseur}
                  logoUrl={logoUrl}
                  nomFournisseur={nomFournisseur}
                  locationUrl={locationUrl}
                  anneeCreation={anneeCreation}
                  ca={ca}
                  effectif={effectifFournisseur}
                  nbClients={nbClients}
                  noteGoogle={noteGoogle}
                  nbAvis={nbAvis}
                />
              </DialogContent>
            </Dialog>
            {noteGoogle && nbAvis && (
              <div className="flex items-center gap-1 text-xs">
                <p>{noteGoogle}</p>
                <StarRating score={noteGoogle ? parseFloat(noteGoogle) : 0} />
                <p>({nbAvis})</p>
              </div>
            )}
          </div>
        </div>
        <div
          className="flex h-1/2 justify-between pt-2"
          onClick={
            isClickable ? () => handleClickProposition(proposition) : undefined
          }
        >
          {infosProduit}
          <div className="flex w-1/3 flex-col items-end gap-2">
            {totalMensuelText}
            {isClickable ? (
              <Switch
                className={`${
                  snacksFruits.infos.fournisseurId === fournisseurId &&
                  snacksFruits.infos.gammeSelected === gamme
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={
                  snacksFruits.infos.fournisseurId === fournisseurId &&
                  snacksFruits.infos.gammeSelected === gamme
                }
                onCheckedChange={() => handleClickProposition(proposition)}
                onClick={(e) => e.stopPropagation()}
                title={t("selectionnez-cette-proposition")}
              />
            ) : null}
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default SnacksFruitsMobilePropositionCard;
