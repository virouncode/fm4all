import FournisseurDialog from "@/app/[locale]/(site)/devis/FournisseurDialog";
import StarRating from "@/components/star/StarRating";
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
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type NettoyageMobileOptionsRepasseCardProps = {
  repasseProposition: {
    id: number;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  } | null;
  handleClickRepasseProposition: (proposition: {
    id: number;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  }) => void;
  color: string;
};

const NettoyageMobileOptionsRepasseCard = ({
  repasseProposition,
  handleClickRepasseProposition,
  color,
}: NettoyageMobileOptionsRepasseCardProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const tGlobal = useTranslations("Global");
  const { nettoyage } = useContext(NettoyageContext);
  const { gammeSelected: gamme, nomFournisseur } = nettoyage.infos;
  const totalMensuelText = repasseProposition?.prixAnnuel ? (
    <p className="text-end text-sm font-bold">
      {formatNumber((repasseProposition.prixAnnuel * MARGE) / 12)}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="text-end text-xs font-bold">
      {tNettoyage(
        "non-propose-pour-une-frequence-inferieure-a-5-passages-semaine",
      )}
    </p>
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

  const repasseHParSemaineText =
    repasseProposition && nettoyage.quantites.freqAnnuelle ? (
      <li className="list-check">
        {formatNumber(
          (repasseProposition.hParPassage * nettoyage.quantites.freqAnnuelle) /
            S_OUVREES_PAR_AN,
        )}{" "}
        {tNettoyage("h-semaine-en-plus")}
      </li>
    ) : null;
  const repasseNbPassagesParSemaineText =
    repasseProposition && nettoyage.quantites.freqAnnuelle ? (
      <li className="list-check">
        {formatNumber(nettoyage.quantites.freqAnnuelle / S_OUVREES_PAR_AN)}{" "}
        {t("passage-s-de")} {repasseProposition.hParPassage} {t("h-semaine")}
      </li>
    ) : null;

  const infosProduit = (
    <ul className="flex w-2/3 flex-col px-4 text-xs">
      <li className="list-check">
        {tNettoyage(
          "second-passage-dans-la-meme-journee-pour-entretenir-sanitaires-et-zones-sensibles",
        )}
      </li>
      {repasseHParSemaineText}
      {repasseNbPassagesParSemaineText}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="mx-auto flex flex-col px-4 text-sm">
      <li className="list-check">
        {tNettoyage(
          "second-passage-dans-la-meme-journee-pour-entretenir-sanitaires-et-zones-sensibles",
        )}
      </li>
      {repasseHParSemaineText}
      {repasseNbPassagesParSemaineText}
    </ul>
  );

  const imgProduit = (
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-100">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill={true}
        className="cursor-pointer object-contain"
        quality={100}
      />
    </div>
  );
  const imgProduitDialog = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill={true}
        className="cursor-pointer object-contain object-center"
        quality={100}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xl font-bold">{tNettoyage("repasse-sanitaire")}</p>
      <div
        className={`bg-${color} flex h-64 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          nettoyage.infos.repasseSelected && repasseProposition
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <div className="flex h-1/2 items-center gap-2 border-b border-slate-200 pb-2">
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
          <div className="flex h-full w-2/3 flex-col gap-1">
            <p className="text-sm font-bold">{nomFournisseur}</p>
            {repasseProposition ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    {nettoyage.infos.logoUrl ? (
                      <div className="relative h-10">
                        <Image
                          src={nettoyage.infos.logoUrl}
                          alt={`logo-de-${nettoyage.infos.nomFournisseur}`}
                          fill={true}
                          className="cursor-pointer object-contain object-left"
                          quality={100}
                        />
                      </div>
                    ) : null}
                  </DialogTrigger>
                  <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
                    <DialogHeader>
                      <DialogTitle>{nomFournisseur}</DialogTitle>
                    </DialogHeader>
                    <FournisseurDialog
                      sloganFournisseur={repasseProposition.slogan}
                      logoUrl={repasseProposition.logoUrl}
                      nomFournisseur={repasseProposition.nomFournisseur}
                      locationUrl={repasseProposition.locationUrl}
                      anneeCreation={repasseProposition.anneeCreation}
                      ca={repasseProposition.ca}
                      effectif={repasseProposition.effectif}
                      nbClients={repasseProposition.nbClients}
                      noteGoogle={repasseProposition.noteGoogle}
                      nbAvis={repasseProposition.nbAvis}
                    />
                  </DialogContent>
                </Dialog>
                {repasseProposition.noteGoogle && repasseProposition.nbAvis && (
                  <div className="flex items-center gap-1 text-xs">
                    <p>{repasseProposition.noteGoogle}</p>
                    <StarRating
                      score={
                        repasseProposition.noteGoogle
                          ? parseFloat(repasseProposition.noteGoogle)
                          : 0
                      }
                    />
                    <p>({repasseProposition.nbAvis})</p>
                  </div>
                )}
              </>
            ) : nettoyage.infos.logoUrl ? (
              <div className="relative h-10">
                <Image
                  src={nettoyage.infos.logoUrl}
                  alt={`logo-de-${nettoyage.infos.nomFournisseur}`}
                  fill={true}
                  className="cursor-pointer object-contain object-left"
                  quality={100}
                />
              </div>
            ) : null}
          </div>
        </div>
        <div
          className="flex h-1/2 justify-between gap-6 pt-2"
          onClick={
            repasseProposition
              ? () => handleClickRepasseProposition(repasseProposition)
              : undefined
          }
        >
          {infosProduit}
          <div className="flex w-1/3 flex-col items-end gap-2">
            {totalMensuelText}
            {repasseProposition ? (
              <Switch
                className={`${
                  nettoyage.infos.repasseSelected
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={nettoyage.infos.repasseSelected}
                onCheckedChange={() =>
                  handleClickRepasseProposition(repasseProposition)
                }
                title={t("selectionnez-cette-proposition")}
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NettoyageMobileOptionsRepasseCard;
