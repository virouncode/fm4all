import PrestataireDialog from "@/app/[locale]/(main)/(application)/devis/PrestataireDialog";
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
import { formatNumber } from "@/lib/utils/formatNumber";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { useTranslations } from "next-intl";
import PresignedLogoImage from "@/components/devis/PresignedLogoImage";
import Image from "next/image";

type NettoyageMobileOptionsRepasseCardProps = {
  repasseProposition: {
    id: string;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  } | null;
  handleClickRepasseProposition: (proposition: {
    id: string;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifPrestataire: string | null;
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
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const { gammeSelected: gamme, nomPrestataire } = nettoyage.infos;
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
        fill
        className="cursor-pointer object-contain"
        sizes="(max-width:768px) 33vw"
      />
    </div>
  );
  const imgProduitDialog = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill
        className="cursor-pointer object-contain object-center"
        sizes="(max-width:768px) 100vw"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xl font-bold">{tNettoyage("repasse-sanitaire")}</p>
      <div
        className={`bg-${color} flex h-64 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          nettoyage.infos.repasseSelected && repasseProposition
            ? "ring-destructive ring-4 ring-inset"
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
            <p className="text-sm font-bold">{nomPrestataire}</p>
            {repasseProposition ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    {nettoyage.infos.logoStorageKey ? (
                      <div className="relative h-10">
                        <PresignedLogoImage
                          storageKey={nettoyage.infos.logoStorageKey}
                          alt={`logo-de-${nettoyage.infos.nomPrestataire}`}
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
                      sloganPrestataire={repasseProposition.slogan}
                      logoStorageKey={repasseProposition.logoStorageKey}
                      nomPrestataire={repasseProposition.nomPrestataire}
                      locationUrl={null}
                      anneeCreation={repasseProposition.anneeCreation}
                      ca={repasseProposition.ca}
                      effectifPrestataire={repasseProposition.effectifPrestataire}
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
            ) : nettoyage.infos.logoStorageKey ? (
              <div className="relative h-10">
                <PresignedLogoImage
                  storageKey={nettoyage.infos.logoStorageKey}
                  alt={`logo-de-${nettoyage.infos.nomPrestataire}`}
                  className="cursor-pointer object-contain object-left"
                  sizes="(max-width:768px) 100vw"
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
                    ? "data-[state=checked]:bg-destructive"
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
