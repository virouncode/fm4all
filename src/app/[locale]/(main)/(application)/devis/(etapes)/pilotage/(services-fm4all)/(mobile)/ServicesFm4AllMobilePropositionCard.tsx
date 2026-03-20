import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
import { CarouselItem } from "@/components/ui/carousel";
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
import { useTranslations } from "next-intl";
import Image from "next/image";

type ServicesFm4AllMobilePropositionCardProps = {
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

const ServicesFm4AllMobilePropositionCard = ({
  proposition,
  handleClickProposition,
  total,
}: ServicesFm4AllMobilePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tFm4all = useTranslations("DevisPage.pilotage.servicesFm4all");
  const tGlobal = useTranslations("Global");
  const servicesFm4All = useServicesFm4AllStore((s) => s.servicesFm4All);
  const { gamme, totalAnnuelSansRemise } = proposition;
  const color = getFm4AllColor(gamme);

  const totalMensuelSansRemiseText =
    totalAnnuelSansRemise !== proposition.totalAnnuel ? (
      <p className="text-sm font-bold line-through">
        {formatNumber(proposition.totalAnnuelSansRemise / 12)} {t("euros-mois")}
      </p>
    ) : null;
  const totalMensuelText = (
    <p className="text-sm font-bold">
      {formatNumber(proposition.totalAnnuel / 12)} {t("euros-mois")}
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
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-200">
      <Image
        src={"/img/services/fm4all.webp"}
        alt={`illustration de pilotes fm4all`}
        fill
        className="cursor-pointer object-contain"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="relative mx-auto h-60 w-full rounded-lg border border-slate-200 bg-slate-100">
      <Image
        src={"/img/services/fm4all.webp"}
        alt={`illustration de pilotes fm4all`}
        fill
        className="object-contain"
        sizes="(max-width:768px) 100vw"
      />
    </div>
  );

  const infosProduit =
    gamme === "essentiel" ? (
      <ul className="flex w-2/3 flex-col px-4 text-xs">
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
      <ul className="flex w-2/3 flex-col px-4 text-xs">
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
      <ul className="flex w-2/3 flex-col px-4 text-xs">
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
    <CarouselItem>
      <div
        className={`bg-${color} flex h-[450px] flex-col rounded-xl border border-slate-200 p-4 text-white ${
          servicesFm4All.infos.gammeSelected === gamme
            ? "ring-destructive ring-4 ring-inset"
            : ""
        }${!total ? "pointer-events-none opacity-50" : ""}`}
      >
        <div className="flex h-1/3 items-center gap-2 border-b border-slate-200 pb-2">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                {imgProduitDialog}
                <p className="text-end text-xs italic">
                  {t("photo-non-contractuelle")}
                </p>
                {infosProduitDialog}
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex h-full w-2/3 flex-col gap-1">
            <p className="text-sm font-bold">{"fm4all"}</p>
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative h-10">
                  <Image
                    src={"/img/logo_full.webp"}
                    alt={`logo-de-fm4all`}
                    fill
                    className="cursor-pointer object-contain object-left dark:hidden"
                    sizes="(max-width:768px) 100vw"
                  />
                  <Image
                    src={"/img/logo_full_dark_mode.webp"}
                    alt={`logo-de-fm4all`}
                    fill
                    className="hidden cursor-pointer object-contain object-left dark:block"
                    sizes="(max-width:768px) 100vw"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                <DialogHeader>
                  <DialogTitle>{"fm4all"}</DialogTitle>
                </DialogHeader>
                <FournisseurDialog
                  sloganPrestataire={tGlobal(
                    "le-facility-management-pour-tous",
                  )}
                  logoStorageKey={"/img/logo_full.webp"}
                  darkLogoUrl={"/img/logo_full_dark_mode.webp"}
                  nomPrestataire={"fm4all"}
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
          className="flex h-2/3 justify-between pt-2"
          onClick={() => handleClickProposition(proposition)}
        >
          {infosProduit}
          <div className="flex w-1/3 flex-col items-end gap-2">
            <div className="flex flex-col gap-2">
              {totalMensuelSansRemiseText}
              {totalMensuelText}
            </div>
            {totalMensuelText ? (
              <Switch
                className={`${
                  servicesFm4All.infos.gammeSelected === gamme
                    ? "data-[state=checked]:bg-destructive"
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
