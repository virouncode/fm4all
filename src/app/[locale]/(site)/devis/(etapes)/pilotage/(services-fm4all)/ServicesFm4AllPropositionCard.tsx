import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type ServicesFm4AllPropositionCardProps = {
  proposition: {
    id: number;
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
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    totalAnnuel: number;
    totalAnnuelSansRemise: number;
  };
  handleClickProposition: (proposition: {
    id: number;
    gamme: "essentiel" | "excellence" | "confort";
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
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  const totalMensuelSansRemiseText =
    proposition.totalAnnuelSansRemise !== proposition.totalAnnuel ? (
      <p className="font-bold text-xl ml-4 line-through">
        {formatNumber(Math.round(proposition.totalAnnuelSansRemise / 12))}{" "}
        {t("euros-mois")}
      </p>
    ) : null;
  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round(proposition.totalAnnuel / 12))} {t("euros-mois")}
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
    <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
      <Image
        src={"/img/services/fm4all.webp"}
        alt={`illustration de pilotes fm4all`}
        fill
        quality={100}
        className="object-contain"
      />
    </div>
  );

  const infosProduit =
    gamme === "essentiel" ? (
      <ul className="flex flex-col text-xs px-4 mx-auto">
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
      <ul className="flex flex-col text-xs px-4 mx-auto">
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
      <ul className="flex flex-col text-xs px-4 mx-auto">
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
      <ul className="flex flex-col text-sm px-4 mx-auto">
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
      <ul className="flex flex-col text-sm px-4 mx-auto">
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
      <ul className="flex flex-col text-sm px-4 mx-auto">
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
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
        servicesFm4All.infos.gammeSelected === gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      } ${!total ? "opacity-50 pointer-events-none" : ""}`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={servicesFm4All.infos.gammeSelected === gamme}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title="Sélectionner cette proposition"
      />
      <div>
        <div className="flex gap-2 items-center">
          <div className="flex flex-col gap-2">
            {totalMensuelSansRemiseText}
            {totalMensuelText}
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
              <p className="text-xs italic text-end">
                {t("photo-non-contractuelle")}
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

export default ServicesFm4AllPropositionCard;
