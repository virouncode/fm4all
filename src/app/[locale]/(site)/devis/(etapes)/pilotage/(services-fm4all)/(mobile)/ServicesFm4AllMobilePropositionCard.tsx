import FournisseurDialog from "@/app/[locale]/(site)/devis/FournisseurDialog";
import { CarouselItem } from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type ServicesFm4AllMobilePropositionCardProps = {
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

const ServicesFm4AllMobilePropositionCard = ({
  proposition,
  handleClickProposition,
  total,
}: ServicesFm4AllMobilePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tFm4all = useTranslations("DevisPage.pilotage.servicesFm4all");
  const tGlobal = useTranslations("Global");
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const { gamme, totalAnnuelSansRemise } = proposition;
  const color = getFm4AllColor(gamme);

  const totalMensuelSansRemiseText =
    totalAnnuelSansRemise !== proposition.totalAnnuel ? (
      <p className="text-sm font-bold line-through">
        {formatNumber(Math.round(proposition.totalAnnuelSansRemise / 12))}{" "}
        {t("euros-mois")}
      </p>
    ) : null;
  const totalMensuelText = (
    <p className="text-sm font-bold">
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
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-200">
      <Image
        src={"/img/services/fm4all.webp"}
        alt={`illustration de pilotes fm4all`}
        fill
        quality={100}
        className="object-contain cursor-pointer"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="w-full h-60 relative mx-auto rounded-lg border-slate-200 border bg-slate-100">
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
      <ul className="flex flex-col text-xs px-4 w-2/3">
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
      <ul className="flex flex-col text-xs px-4 w-2/3">
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
      <ul className="flex flex-col text-xs px-4 w-2/3">
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
    <CarouselItem>
      <div
        className={`bg-${color} flex flex-col h-[450px] border border-slate-200 rounded-xl p-4 text-white ${
          servicesFm4All.infos.gammeSelected === gamme
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }${!total ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="flex items-center h-1/3 gap-2 border-b pb-2 border-slate-200">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 items-center">
                {imgProduitDialog}
                <p className="text-xs italic text-end">
                  {t("photo-non-contractuelle")}
                </p>
                {infosProduitDialog}
              </div>
            </DialogContent>
          </Dialog>
          <div className="w-2/3 flex flex-col gap-1 h-full">
            <p className="font-bold text-sm">{"fm4all"}</p>
            <Dialog>
              <DialogTrigger asChild>
                <div className="h-10 relative">
                  <Image
                    src={"/img/logo_full_white.webp"}
                    alt={`logo-de-fm4all`}
                    fill={true}
                    className="object-contain object-left cursor-pointer"
                    quality={100}
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle>{"fm4all"}</DialogTitle>
                </DialogHeader>
                <FournisseurDialog
                  sloganFournisseur={tGlobal(
                    "le-facility-management-pour-tous"
                  )}
                  logoUrl={"/img/logo_full_white.webp"}
                  nomFournisseur={"fm4all"}
                  locationUrl={null}
                  anneeCreation={2025}
                  ca={null}
                  effectif={null}
                  nbClients={null}
                  noteGoogle={null}
                  nbAvis={null}
                />
              </DialogContent>
            </Dialog>
            {/* {noteGoogle && nbAvis && (
            <div className="flex items-center gap-1 text-xs">
              <p>{noteGoogle}</p>
              <StarRating score={noteGoogle ? parseFloat(noteGoogle) : 0} />
              <p>({nbAvis})</p>
            </div>
          )} */}
          </div>
        </div>
        <div
          className="flex h-2/3 pt-2 justify-between"
          onClick={() => handleClickProposition(proposition)}
        >
          {infosProduit}
          <div className="flex flex-col gap-2 items-end w-1/3">
            <div className="flex flex-col gap-2">
              {totalMensuelSansRemiseText}
              {totalMensuelText}
            </div>
            {totalMensuelText ? (
              <Switch
                className={`${
                  servicesFm4All.infos.gammeSelected === gamme
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={servicesFm4All.infos.gammeSelected === gamme}
                onCheckedChange={() => handleClickProposition(proposition)}
                title={t("selectionnez-cette-proposition")}
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default ServicesFm4AllMobilePropositionCard;
