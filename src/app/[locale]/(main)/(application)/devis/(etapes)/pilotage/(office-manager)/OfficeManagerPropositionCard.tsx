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
import { useOfficeManagerStore } from "@/stores/devis/officeManagerStore";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type OfficeManagerPropositionCardProps = {
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
  };
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
  }) => void;
  demiJParSemaineConfort: number | null;
  demiJParSemaineExcellence: number | null;
};

const OfficeManagerPropositionCard = ({
  proposition,
  handleClickProposition,
  demiJParSemaineConfort,
  demiJParSemaineExcellence,
}: OfficeManagerPropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tOfficeManager = useTranslations("DevisPage.pilotage.officeManager");
  const tGlobal = useTranslations("Global");
  const officeManager = useOfficeManagerStore((s) => s.officeManager);
  const color =
    proposition.demiJParSemaine !== null &&
    demiJParSemaineConfort !== null &&
    demiJParSemaineExcellence !== null
      ? proposition.demiJParSemaine < demiJParSemaineConfort
        ? "fm4allessential"
        : proposition.demiJParSemaine < demiJParSemaineExcellence
          ? "fm4allcomfort"
          : "fm4allexcellence"
      : "";

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
      data-testid={`total-mensuel-office-manager`}
    >
      {formatNumber((proposition.totalAnnuel * MARGE) / 12)} {t("euros-mois")}*
    </p>
  );

  const demiJParSemaineText =
    proposition.demiJParSemaine !== null ? (
      <li className="list-check">
        {proposition.demiJParSemaine / 2} {tOfficeManager("j-semaine")}
      </li>
    ) : null;

  const presenceText = (
    <li className="list-check">
      {tOfficeManager("present")} {officeManager.infos.remplace ? "52" : "47"}{" "}
      {tOfficeManager("semaines-an")}
    </li>
  );

  const premiumText = officeManager.infos.premium ? (
    <li className="list-check">
      {tOfficeManager(
        "profil-premium-anglais-ou-exp-longue-logiciel-compta-adv-ou-adc",
      )}
    </li>
  ) : null;

  const infosEssentiel = (
    <>
      <li className="list-check">
        {tOfficeManager("coordination-technique-des-locaux")}
      </li>
      <li className="list-check">{tOfficeManager("suivi-sous-traitants")}</li>
      <li className="list-check">
        {tOfficeManager("controle-et-gestion-prestataires")}
      </li>
      <li className="list-check">{tOfficeManager("lien-avec-fm4all")}</li>
      <li className="list-check">
        {tOfficeManager("lien-avec-proprietaire-property-ou-asset-manager")}
      </li>
    </>
  );

  const infosConfort = (
    <>
      <li className="list-check">
        {tOfficeManager("coordination-technique-des-locaux")}
      </li>
      <li className="list-check">{tOfficeManager("suivi-sous-traitants")}</li>
      <li className="list-check">
        {tOfficeManager("controle-et-gestion-prestataires")}
      </li>
      <li className="list-check">{tOfficeManager("lien-avec-fm4all")}</li>
      <li className="list-check">
        {tOfficeManager("lien-avec-proprietaire-property-ou-asset-manager")}
      </li>
      <li className="list-check">
        {tOfficeManager("gestion-des-contrats-de-services-tiers")}
      </li>
      <li className="list-check">{tOfficeManager("accueil-des-locaux")}</li>
      <li className="list-check">
        {tOfficeManager("support-administratif-aux-equipes")}
      </li>
      <li className="list-check">
        {tOfficeManager(
          "gestion-des-logiciels-internes-badges-flotte-automobile-etc",
        )}
      </li>
    </>
  );

  const infosExcellence = (
    <>
      <li className="list-check">
        {tOfficeManager("coordination-technique-des-locaux")}
      </li>
      <li className="list-check">{tOfficeManager("suivi-sous-traitants")}</li>
      <li className="list-check">
        {tOfficeManager("controle-et-gestion-prestataires")}
      </li>
      <li className="list-check">{tOfficeManager("lien-avec-fm4all")}</li>
      <li className="list-check">
        {tOfficeManager("lien-avec-proprietaire-property-ou-asset-manager")}
      </li>
      <li className="list-check">
        {tOfficeManager("gestion-des-contrats-de-services-tiers")}
      </li>
      <li className="list-check">{tOfficeManager("accueil-des-locaux")}</li>
      <li className="list-check">
        {tOfficeManager("support-administratif-aux-equipes")}
      </li>
      <li className="list-check">
        {tOfficeManager(
          "gestion-des-logiciels-internes-badges-flotte-automobile-etc",
        )}
      </li>
      <li className="list-check">
        {tOfficeManager("animation-du-site-orga-events-dej-soirees")}
      </li>
      <li className="list-check">
        {tOfficeManager("onboarding-nouveaux-collaborateurs")}
      </li>
      <li className="list-check">
        {tOfficeManager("creation-d-un-environnement-travail-positif")}
      </li>
      <li className="list-check">
        {tOfficeManager("gestion-de-lexperience-utilisateur")}
      </li>
    </>
  );

  const infosProduit =
    proposition.demiJParSemaine !== null &&
    demiJParSemaineConfort !== null &&
    demiJParSemaineExcellence !== null
      ? proposition.demiJParSemaine < demiJParSemaineConfort
        ? infosEssentiel
        : proposition.demiJParSemaine < demiJParSemaineExcellence
          ? infosConfort
          : infosExcellence
      : null;

  const dialogTitle =
    proposition.demiJParSemaine !== null &&
    demiJParSemaineConfort !== null &&
    demiJParSemaineExcellence !== null ? (
      <p className={`text-${color} text-center`}>
        {proposition.demiJParSemaine < demiJParSemaineConfort
          ? tGlobal("essentiel")
          : proposition.demiJParSemaine < demiJParSemaineExcellence
            ? tGlobal("confort")
            : tGlobal("excellence")}
      </p>
    ) : null;

  const imgProduit = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/office-managers.webp"}
        alt={tOfficeManager("illustration-doffice-managers")}
        fill={true}
        className="cursor-pointer object-contain object-center"
        sizes="(min-width:768px) 33vw"
      />
    </div>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} cursor-pointer items-center justify-center gap-4 p-4 text-2xl text-slate-200 ${
        officeManager.infos.fournisseurId === proposition.fournisseurId &&
        officeManager.infos.gammeSelected !== null
          ? "ring-destructive ring-4 ring-inset"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={
          officeManager.infos.fournisseurId === proposition.fournisseurId &&
          officeManager.infos.gammeSelected !== null
        }
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-destructive"
        title={t("selectionnez-cette-proposition")}
        data-testid={`office-manager-switch`}
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
                  {demiJParSemaineText}
                  {presenceText}
                  {premiumText}
                  {infosProduit}
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="ml-4 flex flex-col text-xs">
          {demiJParSemaineText}
          {presenceText}
          {premiumText}
          {infosProduit}
        </ul>
      </div>
    </div>
  );
};

export default OfficeManagerPropositionCard;
