import PrestataireDialog from "@/app/[locale]/(main)/(application)/devis/PrestataireDialog";
import StarRating from "@/components/star/StarRating";
import { CarouselItem } from "@/components/ui/carousel";
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
import PresignedLogoImage from "@/components/devis/PresignedLogoImage";
import PresignedTarifImage from "@/components/devis/PresignedTarifImage";
import { useMaintenanceStore } from "@/stores/devis/maintenanceStore";
import { useTranslations } from "next-intl";

type MaintenanceMobilePropositionCardProps = {
  handleClickProposition: (proposition: {
    id: string;
    gamme: "essentiel" | "confort" | "excellence";
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
  proposition: {
    id: string;
    gamme: "essentiel" | "confort" | "excellence";
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
};

const MaintenanceMobilePropositionCard = ({
  proposition,
  handleClickProposition,
}: MaintenanceMobilePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tMaintenance = useTranslations("DevisPage.services.maintenance");
  const tGlobal = useTranslations("Global");
  const maintenance = useMaintenanceStore((s) => s.maintenance);
  const {
    gamme,
    entrepriseId,
    nomPrestataire,
    sloganPrestataire,
    logoStorageKey,
    anneeCreation,
    ca,
    effectifPrestataire,
    nbClients,
    noteGoogle,
    nbAvis,
    hParPassage,
    freqAnnuelle,
    totalAnnuel,
  } = proposition;

  const color = getFm4AllColor(gamme);
  const totalMensuelText = totalAnnuel ? (
    <p className="text-sm font-bold">
      {formatNumber((totalAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
  ) : (
    <p className="text-sm font-bold">{t("non-propose")}</p>
  );
  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {gamme === "essentiel"
        ? tGlobal("essentiel")
        : gamme === "confort"
          ? tGlobal("confort")
          : tGlobal("excellence")}
    </p>
  );
  const imgProduit = (
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-100">
      <PresignedTarifImage
        storageKey={proposition.imageStorageKey}
        fallbackSrc="/img/services/maintenance.webp"
        alt="illustration de maintenance"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <PresignedTarifImage
        storageKey={proposition.imageStorageKey}
        fallbackSrc="/img/services/maintenance.webp"
        alt="illustration de maintenance"
        sizes="(max-width:768px) 100vw"
      />
    </div>
  );
  const nbPassagesText = (
    <li className="list-check">
      {freqAnnuelle} {t("passage-s-de")} {hParPassage} {t("h-an")}
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

  const infosProduit = (
    <ul className="flex flex-col px-4 text-xs">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
          ? infosConfort
          : infosExcellence}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="mx-auto flex flex-col px-4 text-sm">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
          ? infosConfort
          : infosExcellence}
      {proposition.infos && (
        <li className="list-check">{proposition.infos}</li>
      )}
    </ul>
  );

  return (
    <CarouselItem>
      <div
        className={`bg-${color} flex h-72 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          maintenance.infos.entrepriseId === entrepriseId &&
          maintenance.infos.gammeSelected === gamme
            ? "ring-destructive ring-4 ring-inset"
            : ""
        }`}
      >
        <div className="flex h-1/3 items-center gap-2 border-b border-slate-200 pb-2">
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
            <p className="text-sm font-bold">{nomPrestataire}</p>
            <div onClick={(e) => e.stopPropagation()}>
              <Dialog>
                <DialogTrigger asChild>
                  {logoStorageKey ? (
                    <div className="relative h-10">
                      <PresignedLogoImage
                        storageKey={logoStorageKey}
                        alt={`logo-de-${nomPrestataire}`}
                        className="cursor-pointer object-contain object-left"
                        sizes="(max-width:768px) 100vw"
                      />
                    </div>
                  ) : null}
                </DialogTrigger>
                <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                  <DialogHeader>
                    <DialogTitle>{nomPrestataire}</DialogTitle>
                  </DialogHeader>
                  <PrestataireDialog
                    sloganPrestataire={sloganPrestataire}
                    logoStorageKey={logoStorageKey}
                    nomPrestataire={nomPrestataire}
                    anneeCreation={anneeCreation}
                    ca={ca}
                    effectifPrestataire={effectifPrestataire}
                    nbClients={nbClients}
                    noteGoogle={noteGoogle}
                    nbAvis={nbAvis}
                  />
                </DialogContent>
              </Dialog>
            </div>
            {noteGoogle && nbAvis && (
              <div className="flex items-center gap-1 text-xs">
                <p>{noteGoogle}</p>
                <StarRating score={noteGoogle ? parseFloat(noteGoogle) : 0} />
                <p>({nbAvis})</p>
              </div>
            )}
          </div>
        </div>
        <div
          className="flex h-2/3 justify-between pt-2"
          onClick={
            totalMensuelText
              ? () => handleClickProposition(proposition)
              : undefined
          }
        >
          {infosProduit}
          <div className="flex w-1/3 flex-col items-end gap-2">
            {totalMensuelText}
            {totalMensuelText ? (
              <Switch
                className={`${
                  maintenance.infos.entrepriseId === entrepriseId &&
                  maintenance.infos.gammeSelected === gamme
                    ? "data-[state=checked]:bg-destructive"
                    : ""
                }`}
                checked={
                  maintenance.infos.entrepriseId === entrepriseId &&
                  maintenance.infos.gammeSelected === gamme
                }
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

export default MaintenanceMobilePropositionCard;
