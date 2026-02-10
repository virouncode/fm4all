import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
import StarRating from "@/components/star/StarRating";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";

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
import { useTranslations } from "next-intl";
import Image from "next/image";

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
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const { gammeSelected: gamme, nomFournisseur } = nettoyage.infos;
  const samediPrixMensuelText = samediProposition.prixAnnuel ? (
    <p className="text-end text-sm font-bold">
      {formatNumber((samediProposition?.prixAnnuel * MARGE) / 12)}{" "}
      {t("euros-mois")}
    </p>
  ) : (
    <p className="text-end text-xs font-bold">{t("non-propose")}</p>
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
    <ul className="flex w-2/3 flex-col px-4 text-xs">
      <li className="list-check">
        {tNettoyage("ajoute-une-journee-a-la-frequence-de-nettoyage")}
      </li>
      {samediNbPassagesParSemaineText}
    </ul>
  );
  const infosProduitDialog = (
    <ul className="mx-auto flex flex-col px-4 text-sm">
      <li className="list-check">
        {tNettoyage("ajoute-une-journee-a-la-frequence-de-nettoyage")}
      </li>
      {samediNbPassagesParSemaineText}
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
      <p className="text-xl font-bold">
        {tNettoyage("nettoyage-supplementaire-tous-les-samedis")}
      </p>
      <div
        className={`bg-${color} flex h-64 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          nettoyage.infos.samediSelected
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
            <p className="text-sm font-bold">{nomFournisseur}</p>
            {samediProposition.prixAnnuel ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    {nettoyage.infos.logoUrl ? (
                      <div className="relative h-10">
                        <Image
                          src={nettoyage.infos.logoUrl}
                          alt={`logo-de-${nettoyage.infos.nomFournisseur}`}
                          fill
                          className="cursor-pointer object-contain object-left"
                          sizes="(max-width:768px) 100vw"
                        />
                      </div>
                    ) : null}
                  </DialogTrigger>
                  <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
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
              <div className="relative h-10">
                <Image
                  src={nettoyage.infos.logoUrl}
                  alt={`logo-de-${nettoyage.infos.nomFournisseur}`}
                  fill
                  className="cursor-pointer object-contain object-left"
                  sizes="(max-width:768px) 100vw"
                />
              </div>
            ) : null}
          </div>
        </div>
        <div
          className="flex h-1/2 justify-between gap-6 pt-2"
          onClick={() => handleClickSamediProposition(samediProposition)}
        >
          {infosProduit}
          <div className="flex w-1/3 flex-col items-end gap-2">
            {samediPrixMensuelText}
            {samediProposition.prixAnnuel ? (
              <Switch
                className={`${
                  nettoyage.infos.samediSelected
                    ? "data-[state=checked]:bg-destructive"
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
