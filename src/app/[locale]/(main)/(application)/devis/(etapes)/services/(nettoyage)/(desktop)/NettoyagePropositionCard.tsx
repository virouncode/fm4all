"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE, S_OUVREES_PAR_AN } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useNettoyageStore } from "@/stores/nettoyageStore";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type NettoyagePropositionCardProps = {
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
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: GammeType;
    totalAnnuel: number | null;
  }) => void;
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
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: GammeType;
    totalAnnuel: number | null;
  };
};

const NettoyagePropositionCard = ({
  handleClickProposition,
  proposition,
}: NettoyagePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const tGlobal = useTranslations("Global");
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);

  if (!proposition.totalAnnuel) {
    return (
      <div
        className={`flex flex-1 bg-${color} items-center justify-center gap-4 p-4 text-2xl text-slate-200`}
      >
        {t("non-propose")}
      </div>
    );
  }
  const totalMensuelText = (
    <p className="ml-4 text-xl font-bold" data-testid="total-mensuel-nettoyage">
      {formatNumber((proposition.totalAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
  );
  const hParSemaineText =
    proposition.hParPassage && proposition.freqAnnuelle ? (
      <li className="list-check">
        {formatNumber(
          (proposition.hParPassage * proposition.freqAnnuelle) /
            S_OUVREES_PAR_AN,
        )}{" "}
        {t("h-semaine")}
      </li>
    ) : null;

  const nbPassagesParSemaineText =
    proposition.freqAnnuelle && proposition.hParPassage ? (
      <li className="list-check">
        {formatNumber(proposition.freqAnnuelle / S_OUVREES_PAR_AN)}{" "}
        {t("passage-s-de")} {proposition.hParPassage}
        {t("h-semaine")}
      </li>
    ) : null;

  const infosEssentiel = (
    <li className="list-check">
      {tNettoyage("entretien-fonctionnel-et-optimise")}
    </li>
  );
  const infosConfort = (
    <li className="list-check">
      {tNettoyage("equilibre-parfait-entre-qualite-et-efficacite")}
    </li>
  );
  const infosExcellence = (
    <li className="list-check">
      {tNettoyage("un-standard-de-proprete-exemplaire")}
    </li>
  );
  const infosProduit =
    gamme === "essentiel"
      ? infosEssentiel
      : gamme === "confort"
        ? infosConfort
        : infosExcellence;

  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {proposition.gamme === "essentiel"
        ? tGlobal("essentiel")
        : proposition.gamme === "confort"
          ? tGlobal("confort")
          : tGlobal("excellence")}
    </p>
  );

  const imgProduit = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill
        className="cursor-pointer object-contain object-center"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} cursor-pointer items-center justify-center gap-4 p-4 text-2xl text-slate-200 ${
        nettoyage.infos.fournisseurId === proposition.fournisseurId &&
        nettoyage.infos.gammeSelected === proposition.gamme
          ? "ring-fm4alldestructive ring-4 ring-inset"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={
          nettoyage.infos.fournisseurId === proposition.fournisseurId &&
          nettoyage.infos.gammeSelected === proposition.gamme
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title={t("selectionnez-cette-proposition")}
        data-testid="nettoyage-proposition-switch"
      />
      <div>
        <div className="flex items-center gap-2">
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
              <div className="flex flex-col gap-4">
                {imgProduit}
                <p className="text-end text-xs italic">
                  {t("photo-non-contractuelle")}
                </p>
                <ul className="mx-auto flex flex-col px-4 text-sm">
                  {infosProduit}
                  {hParSemaineText}
                  {nbPassagesParSemaineText}
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="ml-4 flex flex-col text-xs">
          {infosProduit}
          {hParSemaineText}
          {nbPassagesParSemaineText}
        </ul>
      </div>
    </div>
  );
};

export default NettoyagePropositionCard;
