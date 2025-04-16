import FournisseurDialog from "@/app/[locale]/(site)/devis/FournisseurDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type OfficeManagerMobilePropositionCardProps = {
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

const OfficeManagerMobilePropositionCard = ({
  proposition,
  handleClickProposition,
  demiJParSemaineConfort,
  demiJParSemaineExcellence,
}: OfficeManagerMobilePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tOfficeManager = useTranslations("DevisPage.pilotage.officeManager");
  const tGlobal = useTranslations("Global");
  const { officeManager } = useContext(OfficeManagerContext);
  const { fournisseurId, totalAnnuel } = proposition;
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

  const totalMensuelText = totalAnnuel ? (
    <p className="text-sm font-bold">
      {formatNumber(Math.round((totalAnnuel * MARGE) / 12))} {t("euros-mois")}*
    </p>
  ) : (
    <p className="text-sm font-bold">{t("non-propose")}</p>
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
        "profil-premium-anglais-ou-exp-longue-logiciel-compta-adv-ou-adc"
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
          "gestion-des-logiciels-internes-badges-flotte-automobile-etc"
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
          "gestion-des-logiciels-internes-badges-flotte-automobile-etc"
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

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 w-2/3">
      {demiJParSemaineText}
      {presenceText}
      {premiumText}
      {proposition.demiJParSemaine !== null &&
      demiJParSemaineConfort !== null &&
      demiJParSemaineExcellence !== null
        ? proposition.demiJParSemaine < demiJParSemaineConfort
          ? infosEssentiel
          : proposition.demiJParSemaine < demiJParSemaineExcellence
            ? infosConfort
            : infosExcellence
        : null}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      {demiJParSemaineText}
      {presenceText}
      {premiumText}
      {proposition.demiJParSemaine !== null &&
      demiJParSemaineConfort !== null &&
      demiJParSemaineExcellence !== null
        ? proposition.demiJParSemaine < demiJParSemaineConfort
          ? infosEssentiel
          : proposition.demiJParSemaine < demiJParSemaineExcellence
            ? infosConfort
            : infosExcellence
        : null}
    </ul>
  );

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
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-100">
      <Image
        src={"/img/services/office-managers.webp"}
        alt={tOfficeManager("illustration-doffice-managers")}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/office-managers.webp"}
        alt={tOfficeManager("illustration-doffice-managers")}
        fill={true}
        className="object-contain object-center"
        quality={100}
      />
    </div>
  );

  return (
    <div
      className={`bg-${color} flex flex-col h-[570px] border border-slate-200 rounded-xl p-4 text-white  ${
        officeManager.infos.fournisseurId === fournisseurId &&
        officeManager.infos.gammeSelected !== null
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
    >
      <div className="flex items-center h-1/4 gap-2 border-b pb-2 border-slate-200">
        <Dialog>
          <DialogTrigger asChild>{imgProduit}</DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {imgProduitDialog}
              <p className="text-xs italic text-end">
                {t("photo-non-contractuelle")}
              </p>
              {infosProduitDialog}
            </div>
          </DialogContent>
        </Dialog>
        <div className="w-2/3 flex flex-col gap-1 h-full">
          <p className="font-bold text-sm">fm4all</p>
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
                <DialogTitle>fm4all</DialogTitle>
              </DialogHeader>
              <FournisseurDialog
                sloganFournisseur={tOfficeManager(
                  "le-facility-management-pour-tous"
                )}
                logoUrl={"/img/logo_full.webp"}
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
        className="flex h-3/4 pt-2 justify-between"
        onClick={
          totalAnnuel ? () => handleClickProposition(proposition) : undefined
        }
      >
        {infosProduit}
        <div className="flex flex-col gap-2 items-end">
          {totalMensuelText}
          {totalAnnuel ? (
            <Switch
              className={`${
                officeManager.infos.fournisseurId === fournisseurId &&
                officeManager.infos.gammeSelected !== null
                  ? "data-[state=checked]:bg-fm4alldestructive"
                  : ""
              }`}
              checked={
                officeManager.infos.fournisseurId === fournisseurId &&
                officeManager.infos.gammeSelected !== null
              }
              onCheckedChange={() => handleClickProposition(proposition)}
              onClick={(e) => e.stopPropagation()}
              title={t("selectionnez-cette-proposition")}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OfficeManagerMobilePropositionCard;
