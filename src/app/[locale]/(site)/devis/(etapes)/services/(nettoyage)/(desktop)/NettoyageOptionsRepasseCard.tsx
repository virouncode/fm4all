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
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type NettoyageOptionsRepasseCardProps = {
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
  handleClickRepasseProposition: (repasseProposition: {
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

const NettoyageOptionsRepasseCard = ({
  repasseProposition,
  handleClickRepasseProposition,
  color,
}: NettoyageOptionsRepasseCardProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const { nettoyage } = useContext(NettoyageContext);
  const totalMensuelText = repasseProposition?.prixAnnuel ? (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round((repasseProposition.prixAnnuel * MARGE) / 12))}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="font-bold text-base">
      {tNettoyage(
        "non-propose-pour-une-frequence-inferieure-a-5-passages-semaine"
      )}
    </p>
  );

  const repasseHParSemaineText =
    repasseProposition && nettoyage.quantites.freqAnnuelle ? (
      <li className="list-check">
        {formatNumber(
          (repasseProposition.hParPassage * nettoyage.quantites.freqAnnuelle) /
            S_OUVREES_PAR_AN
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
    <li className="list-check">
      {tNettoyage(
        "second-passage-dans-la-meme-journee-pour-entretenir-sanitaires-et-zones-sensibles"
      )}
    </li>
  );
  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {tNettoyage("repasse-sanitaire")}
    </p>
  );

  const imgProduit = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill={true}
        className="object-contain object-center cursor-pointer"
        quality={100}
      />
    </div>
  );

  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center text-base p-4">
        {tNettoyage("repasse-sanitaire")}
      </div>
      <div
        className={`flex w-3/4 items-center justify-center p-4 ${
          nettoyage.infos.repasseSelected && repasseProposition
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
        onClick={
          repasseProposition
            ? () => handleClickRepasseProposition(repasseProposition)
            : undefined
        }
      >
        {repasseProposition ? (
          <Switch
            checked={nettoyage.infos.repasseSelected}
            onCheckedChange={() =>
              handleClickRepasseProposition(repasseProposition)
            }
            className="data-[state=checked]:bg-fm4alldestructive"
            title={t("selectionnez-cette-proposition")}
          />
        ) : null}
        <div>
          <div className="flex gap-2 items-center">
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
                  <p className="text-xs italic text-end">
                    {t("photo-non-contractuelle")}
                  </p>
                  <ul className="flex flex-col text-sm px-4 mx-auto">
                    {infosProduit}
                    {repasseHParSemaineText}
                    {repasseNbPassagesParSemaineText}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ul className="flex flex-col text-xs ml-4 max-w-72">
            {infosProduit}
            {repasseHParSemaineText}
            {repasseNbPassagesParSemaineText}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NettoyageOptionsRepasseCard;
