import FournisseurDialog from "@/app/[locale]/(site)/devis/FournisseurDialog";
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
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type MaintenanceMobilePropositionCardProps = {
  handleClickProposition: (proposition: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
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
  proposition: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
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
};

const MaintenanceMobilePropositionCard = ({
  proposition,
  handleClickProposition,
}: MaintenanceMobilePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tMaintenance = useTranslations("DevisPage.services.maintenance");
  const tGlobal = useTranslations("Global");
  const { maintenance } = useContext(MaintenanceContext);
  const {
    gamme,
    fournisseurId,
    nomFournisseur,
    sloganFournisseur,
    logoUrl,
    locationUrl,
    anneeCreation,
    ca,
    effectifFournisseur,
    nbClients,
    noteGoogle,
    nbAvis,
    hParPassage,
    freqAnnuelle,
    totalAnnuel,
  } = proposition;

  const color = getFm4AllColor(gamme);
  const totalMensuelText = totalAnnuel ? (
    <p className="font-bold text-sm">
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
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-100">
      <Image
        src={`${"/img/services/maintenance.webp"}`}
        alt={`illustration de maintenance`}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={`${"/img/services/maintenance.webp"}`}
        alt={`illustration de maintenance`}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );
  const nbPassagesText = (
    <li className="list-check ">
      {freqAnnuelle} {t("passage-s-de")} {hParPassage} {t("h-an")}
    </li>
  );
  const infosEssentiel = (
    <>
      <li className="list-check ">
        {tMaintenance("obligation-legale-et-controles-reglementaires")}
      </li>
      <li className="list-check">{tMaintenance("controle-q18")}</li>
      {nbPassagesText}
    </>
  );
  const infosConfort = (
    <>
      <li className="list-check ">
        {tMaintenance(
          "essentiel-recommandations-ars-petits-travaux-dentretien-tous-les-trois-mois"
        )}
      </li>
      <li className="list-check ">{tMaintenance("controle-q18")}</li>
      <li className="list-check ">{tMaintenance("controle-legionellose")}</li>
      {nbPassagesText}
    </>
  );
  const infosExcellence = (
    <>
      <li className="list-check ">
        {tMaintenance(
          "une-a-deux-fois-par-mois-passage-technicien-pour-maintenance-and-petits-travaux-lien-technique-avec-le-gestionnaire-de-limmeuble"
        )}
      </li>
      <li className="list-check ">{tMaintenance("controle-q18")}</li>
      <li className="list-check ">{tMaintenance("controle-legionellose")}</li>
      <li className="list-check ">{tMaintenance("controle-qualite-air")}</li>
      {nbPassagesText}
    </>
  );

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
          ? infosConfort
          : infosExcellence}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
          ? infosConfort
          : infosExcellence}
    </ul>
  );

  return (
    <CarouselItem>
      <div
        className={`bg-${color} flex flex-col h-72 border border-slate-200 rounded-xl p-4 text-white  ${
          maintenance.infos.fournisseurId === fournisseurId &&
          maintenance.infos.gammeSelected === gamme
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <div className="flex items-center h-1/3 gap-2 border-b pb-2 border-slate-200">
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
            <p className="font-bold text-sm">{nomFournisseur}</p>
            <Dialog>
              <DialogTrigger asChild>
                {logoUrl ? (
                  <div className="h-10 relative">
                    <Image
                      src={logoUrl}
                      alt={`logo-de-${nomFournisseur}`}
                      fill={true}
                      className="object-contain object-left cursor-pointer"
                      quality={100}
                    />
                  </div>
                ) : null}
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle>{nomFournisseur}</DialogTitle>
                </DialogHeader>
                <FournisseurDialog
                  sloganFournisseur={sloganFournisseur}
                  logoUrl={logoUrl}
                  nomFournisseur={nomFournisseur}
                  locationUrl={locationUrl}
                  anneeCreation={anneeCreation}
                  ca={ca}
                  effectif={effectifFournisseur}
                  nbClients={nbClients}
                  noteGoogle={noteGoogle}
                  nbAvis={nbAvis}
                />
              </DialogContent>
            </Dialog>
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
          className="flex h-2/3 pt-2 justify-between"
          onClick={
            totalMensuelText
              ? () => handleClickProposition(proposition)
              : undefined
          }
        >
          {infosProduit}
          <div className="flex flex-col gap-2 items-end w-1/3">
            {totalMensuelText}
            {totalMensuelText ? (
              <Switch
                className={`${
                  maintenance.infos.fournisseurId === fournisseurId &&
                  maintenance.infos.gammeSelected === gamme
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={
                  maintenance.infos.fournisseurId === fournisseurId &&
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
