import PrestataireDialog from "@/app/[locale]/(main)/(application)/devis/PrestataireDialog";
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
import PresignedTarifImage from "@/components/devis/PresignedTarifImage";
import { useOfficeManagerStore } from "@/stores/devis/officeManagerStore";
import { useTranslations } from "next-intl";
import Image from "next/image";

type OfficeManagerMobilePropositionCardProps = {
  proposition: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
    imageStorageKey: string | null;
  };
  handleClickProposition: (proposition: {
    id: string;
    entrepriseId: string;
    nomPrestataire: string;
    sloganPrestataire: string | null;
    logoStorageKey: string | null;
    totalAnnuel: number | null;
    demiJParSemaine: number | null;
    demiTjm: number;
    demiTjmPremium: number;
    imageStorageKey: string | null;
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
  const officeManager = useOfficeManagerStore((s) => s.officeManager);
  const { entrepriseId, totalAnnuel } = proposition;
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
      {formatNumber((totalAnnuel * MARGE) / 12)} {t("euros-mois")}*
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

  const infosProduit = (
    <ul className="flex w-2/3 flex-col px-4 text-xs">
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
    <ul className="mx-auto flex flex-col px-4 text-sm">
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
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-100">
      <PresignedTarifImage
        storageKey={proposition.imageStorageKey}
        fallbackSrc="/img/services/office-managers.webp"
        alt={tOfficeManager("illustration-doffice-managers")}
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <PresignedTarifImage
        storageKey={proposition.imageStorageKey}
        fallbackSrc="/img/services/office-managers.webp"
        alt={tOfficeManager("illustration-doffice-managers")}
        sizes="(max-width:768px) 100vw"
      />
    </div>
  );

  return (
    <div
      className={`bg-${color} flex h-[570px] flex-col rounded-xl border border-slate-200 p-4 text-white ${
        officeManager.infos.entrepriseId === entrepriseId &&
        officeManager.infos.gammeSelected !== null
          ? "ring-destructive ring-4 ring-inset"
          : ""
      }`}
    >
      <div className="flex h-1/4 items-center gap-2 border-b border-slate-200 pb-2">
        <div onClick={(e) => e.stopPropagation()}>
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
        </div>
        <div className="flex h-full w-2/3 flex-col gap-1">
          <p className="text-sm font-bold">fm4all</p>
          <div onClick={(e) => e.stopPropagation()}>
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
                  <DialogTitle>fm4all</DialogTitle>
                </DialogHeader>
                <PrestataireDialog
                  sloganPrestataire={tOfficeManager(
                    "le-facility-management-pour-tous",
                  )}
                  logoStorageKey={"/img/logo_full.webp"}
                  darkLogoUrl={"/img/logo_full_dark_mode.webp"}
                  nomPrestataire={"fm4all"}
                  locationUrl={null}
                  anneeCreation={2025}
                  ca={null}
                  effectifPrestataire={null}
                  nbClients={null}
                  noteGoogle={null}
                  nbAvis={null}
                />
              </DialogContent>
            </Dialog>
          </div>
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
        className="flex h-3/4 justify-between pt-2"
        onClick={
          totalAnnuel ? () => handleClickProposition(proposition) : undefined
        }
      >
        {infosProduit}
        <div className="flex flex-col items-end gap-2">
          {totalMensuelText}
          {totalAnnuel ? (
            <Switch
              className={`${
                officeManager.infos.entrepriseId === entrepriseId &&
                officeManager.infos.gammeSelected !== null
                  ? "data-[state=checked]:bg-destructive"
                  : ""
              }`}
              checked={
                officeManager.infos.entrepriseId === entrepriseId &&
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
