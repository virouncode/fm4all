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
import { MARGE } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type NettoyageMobileOptionsSamediPropositionsProps = {
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
  handleClickSamediProposition: (proposition: {
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

const NettoyageMobileOptionsSamediCard = ({
  samediProposition,
  handleClickSamediProposition,
  color,
}: NettoyageMobileOptionsSamediPropositionsProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const tGlobal = useTranslations("Global");
  const { nettoyage } = useContext(NettoyageContext);
  const { gammeSelected: gamme, nomFournisseur } = nettoyage.infos;
  const samediPrixMensuelText = samediProposition.prixAnnuel ? (
    <p className="text-sm font-bold text-end">
      {formatNumber(Math.round((samediProposition?.prixAnnuel * MARGE) / 12))}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="text-xs font-bold text-end">{t("non-propose")}</p>
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
  const samediNbPassagesParSemaineText = (
    <li className="list-check">
      {t("1-passage-de")} {nettoyage.quantites.hParPassage}{" "}
      {tNettoyage("h-semaine-en-plus")}
    </li>
  );
  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 w-2/3">
      <li className="list-check">
        {tNettoyage("ajoute-une-journee-a-la-frequence-de-nettoyage")}
      </li>
      {samediNbPassagesParSemaineText}
    </ul>
  );
  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      <li className="list-check">
        {tNettoyage("ajoute-une-journee-a-la-frequence-de-nettoyage")}
      </li>
      {samediNbPassagesParSemaineText}
    </ul>
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
        className="object-contain object-center cursor-pointer"
        quality={100}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-1">
      <p className="font-bold text-xl">
        {tNettoyage("nettoyage-supplementaire-tous-les-samedis")}
      </p>
      <div
        className={`bg-${color} flex flex-col h-64 border border-slate-200 rounded-xl p-4 text-white  ${
          nettoyage.infos.samediSelected
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <div className="flex items-center h-1/2 gap-2 border-b pb-2 border-slate-200">
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
            {samediProposition.prixAnnuel ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    {nettoyage.infos.logoUrl ? (
                      <div className="h-10 relative">
                        <Image
                          src={nettoyage.infos.logoUrl}
                          alt={`logo-de-${nettoyage.infos.nomFournisseur}`}
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
                      sloganFournisseur={samediProposition.slogan}
                      logoUrl={samediProposition.logoUrl}
                      nomFournisseur={samediProposition.nomFournisseur}
                      locationUrl={samediProposition.locationUrl}
                      anneeCreation={samediProposition.anneeCreation}
                      ca={samediProposition.ca}
                      effectif={samediProposition.effectif}
                      nbClients={samediProposition.nbClients}
                      noteGoogle={samediProposition.noteGoogle}
                      nbAvis={samediProposition.nbAvis}
                    />
                  </DialogContent>
                </Dialog>
                {samediProposition.noteGoogle && samediProposition.nbAvis && (
                  <div className="flex items-center gap-1 text-xs">
                    <p>{samediProposition.noteGoogle}</p>
                    <StarRating
                      score={
                        samediProposition.noteGoogle
                          ? parseFloat(samediProposition.noteGoogle)
                          : 0
                      }
                    />
                    <p>({samediProposition.nbAvis})</p>
                  </div>
                )}
              </>
            ) : nettoyage.infos.logoUrl ? (
              <div className="h-10 relative">
                <Image
                  src={nettoyage.infos.logoUrl}
                  alt={`logo-de-${nettoyage.infos.nomFournisseur}`}
                  fill={true}
                  className="object-contain object-left cursor-pointer"
                  quality={100}
                />
              </div>
            ) : null}
          </div>
        </div>
        <div
          className="flex h-1/2 pt-2 justify-between gap-6"
          onClick={() => handleClickSamediProposition(samediProposition)}
        >
          {infosProduit}
          <div className="flex flex-col gap-2 items-end w-1/3">
            {samediPrixMensuelText}
            {samediProposition.prixAnnuel ? (
              <Switch
                className={`${
                  nettoyage.infos.samediSelected
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={nettoyage.infos.samediSelected}
                onCheckedChange={() =>
                  handleClickSamediProposition(samediProposition)
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

export default NettoyageMobileOptionsSamediCard;
