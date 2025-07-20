"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type MaintenancePropositionCardProps = {
  proposition: {
    id: number;
    gamme: GammeType;
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  };
  handleClickProposition: (proposition: {
    id: number;
    gamme: GammeType;
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  }) => void;
};

const MaintenancePropositionCard = ({
  proposition,
  handleClickProposition,
}: MaintenancePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tMaintenance = useTranslations("DevisPage.services.maintenance");
  const tGlobal = useTranslations("Global");
  const { maintenance } = useContext(MaintenanceContext);
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
    <p
      className="ml-4 text-xl font-bold"
      data-testid="total-mensuel-maintenance"
    >
      {formatNumber((proposition.totalAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
  );

  const nbPassagesText = (
    <li className="list-check">
      {proposition.freqAnnuelle} {t("passage-s-de")} {proposition.hParPassage}{" "}
      {t("h-an")}
    </li>
  );

  const infosEssentiel = (
    <>
      <li className="list-check">
        {tMaintenance("obligation-legale-et-controles-reglementaires")}
      </li>
      <li className="list-check">{tMaintenance("controle-q18")}</li>
      {nbPassagesText}
    </>
  );
  const infosConfort = (
    <>
      <li className="list-check">
        {tMaintenance(
          "essentiel-recommandations-ars-petits-travaux-dentretien-tous-les-trois-mois",
        )}
      </li>
      <li className="list-check">{tMaintenance("controle-q18")}</li>
      <li className="list-check">{tMaintenance("controle-legionellose")}</li>
      {nbPassagesText}
    </>
  );
  const infosExcellence = (
    <>
      <li className="list-check">
        {tMaintenance(
          "une-a-deux-fois-par-mois-passage-technicien-pour-maintenance-and-petits-travaux-lien-technique-avec-le-gestionnaire-de-limmeuble",
        )}
      </li>
      <li className="list-check">{tMaintenance("controle-q18")}</li>
      <li className="list-check">{tMaintenance("controle-legionellose")}</li>
      <li className="list-check">{tMaintenance("controle-qualite-air")}</li>
      {nbPassagesText}
    </>
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
        src={"/img/services/maintenance.webp"}
        alt={`illustration de maintenance`}
        fill={true}
        className="cursor-pointer object-contain object-center"
        quality={100}
      />
    </div>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} cursor-pointer items-center justify-center gap-4 p-4 text-2xl text-slate-200 ${
        maintenance.infos.fournisseurId === proposition.fournisseurId &&
        maintenance.infos.gammeSelected === proposition.gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={
          maintenance.infos.fournisseurId === proposition.fournisseurId &&
          maintenance.infos.gammeSelected === proposition.gamme
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title={t("selectionnez-cette-proposition")}
        data-testid={"maintenance-switch"}
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
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="ml-4 flex flex-col text-xs">{infosProduit}</ul>
      </div>
    </div>
  );
};

export default MaintenancePropositionCard;
