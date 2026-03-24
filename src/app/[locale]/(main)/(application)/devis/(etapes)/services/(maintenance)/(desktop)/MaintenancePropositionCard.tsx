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
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useMaintenanceStore } from "@/stores/devis/maintenanceStore";
import { GammeType } from "@/zod-schemas/gamme.schema";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import PresignedTarifImage from "@/components/devis/PresignedTarifImage";

type MaintenancePropositionCardProps = {
  proposition: {
    id: string;
    gamme: GammeType;
    nomPrestataire: string;
    entrepriseId: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
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
    imageStorageKey: string | null;
    infos: string | null;
  };
  handleClickProposition: (proposition: {
    id: string;
    gamme: GammeType;
    nomPrestataire: string;
    entrepriseId: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
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
    imageStorageKey: string | null;
    infos: string | null;
  }) => void;
};

const MaintenancePropositionCard = ({
  proposition,
  handleClickProposition,
}: MaintenancePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tMaintenance = useTranslations("DevisPage.services.maintenance");
  const tGlobal = useTranslations("Global");
  const maintenance = useMaintenanceStore((s) => s.maintenance);
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
      <PresignedTarifImage
        storageKey={proposition.imageStorageKey}
        fallbackSrc="/img/services/maintenance.webp"
        alt="illustration de maintenance"
        sizes="(min-width:768px) 33vw"
      />
    </div>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} cursor-pointer items-center justify-center gap-4 p-4 text-2xl text-slate-200 ${
        maintenance.infos.entrepriseId === proposition.entrepriseId &&
        maintenance.infos.gammeSelected === proposition.gamme
          ? "ring-destructive ring-4 ring-inset"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={
          maintenance.infos.entrepriseId === proposition.entrepriseId &&
          maintenance.infos.gammeSelected === proposition.gamme
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-destructive"
        title={t("selectionnez-cette-proposition")}
        data-testid={"maintenance-switch"}
      />
      <div>
        <div className="flex items-center gap-2">
          {totalMensuelText}
          <div onClick={(e) => e.stopPropagation()}>
            <Dialog>
              <DialogTrigger asChild>
                <Info
                  size={16}
                  className="cursor-pointer"
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
                    {proposition.infos && (
                      <li className="list-check">{proposition.infos}</li>
                    )}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <ul className="ml-4 flex flex-col text-xs">{infosProduit}</ul>
      </div>
    </div>
  );
};

export default MaintenancePropositionCard;
