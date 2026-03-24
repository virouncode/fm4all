import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useServicesFm4AllStore } from "@/stores/devis/servicesFm4AllStore";
import { GammeType } from "@/zod-schemas/gamme.schema";
import { ServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4All.schema";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type ServicesFm4AllPropositionCardProps = {
  proposition: {
    id: string;
    gamme: GammeType;
    tauxAssurance: number;
    tauxPlateforme: number;
    tauxSupportAdmin: number;
    tauxSupportOp: number;
    tauxAccountManager: number;
    tauxRemiseCa: number;
    tauxRemiseHof: number;
    prixAssurance: number | null;
    prixPlateforme: number | null;
    prixSupportAdmin: number | null;
    prixSupportOp: number | null;
    prixAccountManager: number | null;
    assurance: ServicesFm4AllOffresType;
    plateforme: ServicesFm4AllOffresType;
    supportAdmin: ServicesFm4AllOffresType;
    supportOp: ServicesFm4AllOffresType;
    accountManager: ServicesFm4AllOffresType;
    audit: ServicesFm4AllOffresType;
    minFacturationPlateforme: number;
    minFacturationSupportOp: number;
    minFacturationAccountManager: number;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  };
  handleClickProposition: (proposition: {
    id: string;
    gamme: GammeType;
    tauxAssurance: number;
    tauxPlateforme: number;
    tauxSupportAdmin: number;
    tauxSupportOp: number;
    tauxAccountManager: number;
    tauxRemiseCa: number;
    tauxRemiseHof: number;
    prixAssurance: number | null;
    prixPlateforme: number | null;
    prixSupportAdmin: number | null;
    prixSupportOp: number | null;
    prixAccountManager: number | null;
    assurance: ServicesFm4AllOffresType;
    plateforme: ServicesFm4AllOffresType;
    supportAdmin: ServicesFm4AllOffresType;
    supportOp: ServicesFm4AllOffresType;
    accountManager: ServicesFm4AllOffresType;
    audit: ServicesFm4AllOffresType;
    minFacturationPlateforme: number;
    minFacturationSupportOp: number;
    minFacturationAccountManager: number;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  }) => void;
  total: number;
};

const ServicesFm4AllPropositionCard = ({
  proposition,
  handleClickProposition,
  total,
}: ServicesFm4AllPropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tFm4all = useTranslations("DevisPage.pilotage.servicesFm4all");
  const tGlobal = useTranslations("Global");
  const servicesFm4All = useServicesFm4AllStore((s) => s.servicesFm4All);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  const totalMensuelSansRemiseText =
    proposition.totalAnnuelSansRemise !== proposition.totalAnnuel ? (
      <p className="ml-4 text-xl font-bold line-through">
        {formatNumber(proposition.totalAnnuelSansRemise / 12)} {t("euros-mois")}
      </p>
    ) : null;
  const totalMensuelText = (
    <p
      className="ml-4 text-xl font-bold"
      data-testid={`total-mensuel-services-fm4all-${gamme}`}
    >
      <span>
        {formatNumber(proposition.totalAnnuel / 12)} {t("euros-mois")}
      </span>
      {proposition.remiseCa ? "\u00B9" : ""}
      {proposition.remiseHof ? "\u00B2" : ""}
    </p>
  );

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
    <div className="relative mx-auto h-64 w-full rounded-lg border border-slate-300 bg-slate-100">
      <Image
        src={"/img/services/fm4all.webp"}
        alt={`illustration de pilotes fm4all`}
        fill
        className="object-contain"
        sizes="(min-width:768px) 33vw"
      />
    </div>
  );

  const infosProduit =
    gamme === "essentiel" ? (
      <ul className="mx-auto flex flex-col px-4 text-xs">
        <li className="list-check">{tFm4all("acces-services")}</li>
        <li className="list-check">
          {tFm4all("frais-bancaires-and-assurance")}
        </li>
        <li className="list-check">{tFm4all("garanties-contractuelles")}</li>
        <li className="list-check">{tFm4all("facturation-centralisee")}</li>
        <li className="list-check">
          {tFm4all("service-support-en-ligne-en-ligne-24-48h")}
        </li>
      </ul>
    ) : gamme === "confort" ? (
      <ul className="mx-auto flex flex-col px-4 text-xs">
        <li className="list-check">{tFm4all("acces-services")}</li>
        <li className="list-check">
          {tFm4all("frais-bancaires-and-assurance")}
        </li>
        <li className="list-check">{tFm4all("garanties-contractuelles")}</li>
        <li className="list-check">{tFm4all("facturation-centralisee")}</li>
        <li className="list-check">
          {tFm4all("service-support-en-ligne-en-ligne-24-48h")}
        </li>
        <li className="list-check">
          {tFm4all("service-support-operationnel-telephonique")}
        </li>
        <li className="list-check">
          {tFm4all("suivi-de-la-realisation-des-interventions")}
        </li>
        <li className="list-check">{tFm4all("reporting-personnalise")}</li>
      </ul>
    ) : (
      <ul className="mx-auto flex flex-col px-4 text-xs">
        <li className="list-check">{tFm4all("acces-services")}</li>
        <li className="list-check">
          {tFm4all("frais-bancaires-and-assurance")}
        </li>
        <li className="list-check">{tFm4all("garanties-contractuelles")}</li>
        <li className="list-check">{tFm4all("facturation-centralisee")}</li>
        <li className="list-check">
          {tFm4all("service-support-en-ligne-en-ligne-24-48h")}
        </li>
        <li className="list-check">
          {tFm4all("service-support-operationnel-telephonique")}
        </li>
        <li className="list-check">
          {tFm4all("suivi-de-la-realisation-des-interventions")}
        </li>
        <li className="list-check">{tFm4all("reporting-personnalise")}</li>
        <li className="list-check">{tFm4all("account-manager-dedie")}</li>
        <li className="list-check">{tFm4all("conseils-achats-audit")}</li>
        <li className="list-check">
          {tFm4all("lien-avec-le-proprietaire-property-manager")}
        </li>
        <li className="list-check">{tFm4all("audit-operationnel")}</li>
      </ul>
    );

  const infosProduitDialog =
    gamme === "essentiel" ? (
      <ul className="mx-auto flex flex-col px-4 text-sm">
        <li className="list-check">{tFm4all("acces-services")}</li>
        <li className="list-check">
          {tFm4all("frais-bancaires-and-assurance")}
        </li>
        <li className="list-check">{tFm4all("garanties-contractuelles")}</li>
        <li className="list-check">{tFm4all("facturation-centralisee")}</li>
        <li className="list-check">
          {tFm4all("service-support-en-ligne-en-ligne-24-48h")}
        </li>
      </ul>
    ) : gamme === "confort" ? (
      <ul className="mx-auto flex flex-col px-4 text-sm">
        <li className="list-check">{tFm4all("acces-services")}</li>
        <li className="list-check">
          {tFm4all("frais-bancaires-and-assurance")}
        </li>
        <li className="list-check">{tFm4all("garanties-contractuelles")}</li>
        <li className="list-check">{tFm4all("facturation-centralisee")}</li>
        <li className="list-check">
          {tFm4all("service-support-en-ligne-en-ligne-24-48h")}
        </li>
        <li className="list-check">
          {tFm4all("service-support-operationnel-telephonique")}
        </li>
        <li className="list-check">
          {tFm4all("suivi-de-la-realisation-des-interventions")}
        </li>
        <li className="list-check">{tFm4all("reporting-personnalise")}</li>
      </ul>
    ) : (
      <ul className="mx-auto flex flex-col px-4 text-sm">
        <li className="list-check">{tFm4all("acces-services")}</li>
        <li className="list-check">
          {tFm4all("frais-bancaires-and-assurance")}
        </li>
        <li className="list-check">{tFm4all("garanties-contractuelles")}</li>
        <li className="list-check">{tFm4all("facturation-centralisee")}</li>
        <li className="list-check">
          {tFm4all("service-support-en-ligne-en-ligne-24-48h")}
        </li>
        <li className="list-check">
          {tFm4all("service-support-operationnel-telephonique")}
        </li>
        <li className="list-check">
          {tFm4all("suivi-de-la-realisation-des-interventions")}
        </li>
        <li className="list-check">{tFm4all("reporting-personnalise")}</li>
        <li className="list-check">{tFm4all("account-manager-dedie")}</li>
        <li className="list-check">{tFm4all("conseils-achats-audit")}</li>
        <li className="list-check">
          {tFm4all("lien-avec-le-proprietaire-property-manager")}
        </li>
        <li className="list-check">{tFm4all("audit-operationnel")}</li>
      </ul>
    );

  return (
    <div
      className={`flex flex-1 bg-${color} cursor-pointer items-center justify-center gap-4 p-4 text-2xl text-slate-200 ${
        servicesFm4All.infos.gammeSelected === gamme
          ? "ring-destructive ring-4 ring-inset"
          : ""
      } ${!total ? "pointer-events-none opacity-50" : ""}`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={servicesFm4All.infos.gammeSelected === gamme}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-destructive"
        title="Sélectionner cette proposition"
        data-testid={`services-fm4all-switch-${gamme}`}
      />
      <div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-2">
            {totalMensuelSansRemiseText}
            {totalMensuelText}
          </div>
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
                {imgProduit}
                <p className="text-end text-xs italic">
                  {t("photo-non-contractuelle")}
                </p>
                {infosProduitDialog}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {infosProduit}
      </div>
    </div>
  );
};

export default ServicesFm4AllPropositionCard;
