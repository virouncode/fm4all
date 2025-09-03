import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type NettoyageOptionsSamediCardProps = {
  samediProposition: {
    id: number;
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
  };
  handleClickSamediProposition: (samediProposition: {
    id: number;
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

const NettoyageOptionsSamediCard = ({
  samediProposition,
  handleClickSamediProposition,
  color,
}: NettoyageOptionsSamediCardProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const { nettoyage } = useContext(NettoyageContext);

  const samediPrixMensuelText = samediProposition.prixAnnuel ? (
    <p className="ml-4 text-xl font-bold" data-testid="total-mensuel-samedi">
      {formatNumber((samediProposition?.prixAnnuel * MARGE) / 12)}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="text-base font-bold">{t("non-propose")}</p>
  );

  const samediNbPassagesParSemaineText = (
    <li className="list-check">
      {t("1-passage-de")} {nettoyage.quantites.hParPassage}{" "}
      {tNettoyage("h-semaine-en-plus")}
    </li>
  );
  const infosProduit = (
    <li className="list-check">
      {tNettoyage("ajoute-une-journee-a-la-frequence-de-nettoyage")}
    </li>
  );
  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {tNettoyage("nettoyage-supplementaire-tous-les-samedis")}
    </p>
  );
  const imgProduit = (
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
    <div className="flex flex-1 border-b">
      <div className="flex w-1/4 items-center justify-center p-4 text-center text-base">
        {tNettoyage("nettoyage-supplementaire-tous-les-samedis")}
      </div>
      <div
        className={`flex w-3/4 items-center justify-center p-4 ${
          nettoyage.infos.samediSelected
            ? "ring-fm4alldestructive ring-4 ring-inset"
            : ""
        } bg-${color} cursor-pointer items-center justify-center gap-4 text-2xl text-slate-200`}
        onClick={
          samediProposition.prixAnnuel
            ? () => handleClickSamediProposition(samediProposition)
            : undefined
        }
      >
        {samediProposition.prixAnnuel ? (
          <Switch
            checked={nettoyage.infos.samediSelected}
            onCheckedChange={() =>
              handleClickSamediProposition(samediProposition)
            }
            className="data-[state=checked]:bg-fm4alldestructive"
            title={t("selectionnez-cette-proposition")}
            data-testid="samedi-switch"
          />
        ) : null}
        <div>
          <div className="flex items-center gap-2">
            {samediPrixMensuelText}
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
                    {infosProduit}
                    {samediNbPassagesParSemaineText}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ul className="ml-4 flex flex-col text-xs">
            {infosProduit}
            {samediNbPassagesParSemaineText}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NettoyageOptionsSamediCard;
