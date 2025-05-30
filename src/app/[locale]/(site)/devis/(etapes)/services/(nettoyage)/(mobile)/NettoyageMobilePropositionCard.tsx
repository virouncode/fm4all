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
import { MARGE, S_OUVREES_PAR_AN } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type NettoyageMobilePropositionCardProps = {
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: "essentiel" | "confort" | "excellence";
    totalAnnuel: number | null;
  }) => void;
  proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: "essentiel" | "confort" | "excellence";
    totalAnnuel: number | null;
  };
};

const NettoyageMobilePropositionCard = ({
  proposition,
  handleClickProposition,
}: NettoyageMobilePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tGlobal = useTranslations("Global");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const { nettoyage } = useContext(NettoyageContext);
  const {
    fournisseurId,
    gamme,
    freqAnnuelle,
    hParPassage,
    totalAnnuel,
    ca,
    sloganFournisseur,
    logoUrl,
    nomFournisseur,
    locationUrl,
    anneeCreation,
    effectifFournisseur,
    nbClients,
    noteGoogle,
    nbAvis,
  } = proposition;
  const color = getFm4AllColor(gamme);

  const totalMensuelText = totalAnnuel ? (
    <p className="text-sm font-bold">
      {formatNumber((totalAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
  ) : (
    <p className="text-sm font-bold">{t("non-propose")}</p>
  );

  const hParSemaineText =
    hParPassage && freqAnnuelle ? (
      <li className="list-check">
        {formatNumber((hParPassage * freqAnnuelle) / S_OUVREES_PAR_AN)}{" "}
        {t("h-semaine")}
      </li>
    ) : null;
  const nbPassagesParSemaineText =
    freqAnnuelle && hParPassage ? (
      <li className="list-check">
        {formatNumber(freqAnnuelle / S_OUVREES_PAR_AN)} {t("passage-s-de")}{" "}
        {hParPassage} {t("h-semaine")}
      </li>
    ) : null;
  const infosEssentiel = tNettoyage("entretien-fonctionnel-et-optimise");
  const infosConfort = tNettoyage(
    "equilibre-parfait-entre-qualite-et-efficacite"
  );
  const infosExcellence = tNettoyage("un-standard-de-proprete-exemplaire");

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 w-2/3">
      <li className="list-check">
        {gamme === "essentiel"
          ? infosEssentiel
          : gamme === "confort"
            ? infosConfort
            : infosExcellence}
      </li>
      {hParSemaineText}
      {nbPassagesParSemaineText}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      <li className="list-check">
        {gamme === "essentiel"
          ? infosEssentiel
          : gamme === "confort"
            ? infosConfort
            : infosExcellence}
      </li>
      {hParSemaineText}
      {nbPassagesParSemaineText}
    </ul>
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
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill={true}
        className="object-contain object-center"
        quality={100}
      />
    </div>
  );

  return (
    <CarouselItem>
      <div
        className={`bg-${color} flex flex-col h-56 border border-slate-200 rounded-xl p-4 text-white  ${
          nettoyage.infos.fournisseurId === fournisseurId &&
          nettoyage.infos.gammeSelected === gamme
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <div className="flex items-center h-1/2 gap-2 border-b pb-2 border-slate-200">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl pointer-events-auto">
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
          className="flex h-1/2 pt-2 justify-between"
          onClick={() => handleClickProposition(proposition)}
        >
          {infosProduit}
          <div className="flex flex-col gap-2 items-end">
            {totalMensuelText}
            {totalAnnuel ? (
              <Switch
                className={`${
                  nettoyage.infos.fournisseurId === fournisseurId &&
                  nettoyage.infos.gammeSelected === gamme
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={
                  nettoyage.infos.fournisseurId === fournisseurId &&
                  nettoyage.infos.gammeSelected === gamme
                }
                onCheckedChange={() => handleClickProposition(proposition)}
                onClick={(e) => e.stopPropagation()}
                title={t("selectionnez-cette-proposition")}
              />
            ) : null}
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default NettoyageMobilePropositionCard;
