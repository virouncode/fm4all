import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
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
import { formatNumber } from "@/lib/utils/formatNumber";
import { useNettoyageStore } from "@/stores/nettoyageStore";
import { useTranslations } from "next-intl";
import Image from "next/image";

type NettoyageMobileOptionsDimanchePropositionsProps = {
  dimancheProposition: {
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
  handleClickDimancheProposition: (proposition: {
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

const NettoyageMobileOptionsDimancheCard = ({
  dimancheProposition,
  handleClickDimancheProposition,
  color,
}: NettoyageMobileOptionsDimanchePropositionsProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const tGlobal = useTranslations("Global");
  const { nettoyage } = useNettoyageStore();
  const { gammeSelected: gamme, nomFournisseur } = nettoyage.infos;
  const dimanchePrixMensuelText = dimancheProposition.prixAnnuel ? (
    <p className="text-end text-sm font-bold">
      {formatNumber((dimancheProposition?.prixAnnuel * MARGE) / 12)}{" "}
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
  const dimancheNbPassagesParSemaineText = (
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
      {dimancheNbPassagesParSemaineText}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="mx-auto flex flex-col px-4 text-sm">
      <li className="list-check">
        {tNettoyage("ajoute-une-journee-a-la-frequence-de-nettoyage")}
      </li>
      {dimancheNbPassagesParSemaineText}
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
      <p className="text-xl font-bold">
        {tNettoyage("nettoyage-supplementaire-tous-les-dimanches")}
      </p>
      <div
        className={`bg-${color} flex h-64 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          nettoyage.infos.dimancheSelected
            ? "ring-fm4alldestructive ring-4 ring-inset"
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
            {dimancheProposition.prixAnnuel ? (
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
                      <DialogTitle>
                        {nettoyage.infos.nomFournisseur}
                      </DialogTitle>
                    </DialogHeader>
                    <FournisseurDialog
                      sloganFournisseur={dimancheProposition.slogan}
                      logoUrl={dimancheProposition.logoUrl}
                      nomFournisseur={dimancheProposition.nomFournisseur}
                      locationUrl={dimancheProposition.locationUrl}
                      anneeCreation={dimancheProposition.anneeCreation}
                      ca={dimancheProposition.ca}
                      effectif={dimancheProposition.effectif}
                      nbClients={dimancheProposition.nbClients}
                      noteGoogle={dimancheProposition.noteGoogle}
                      nbAvis={dimancheProposition.nbAvis}
                    />
                  </DialogContent>
                </Dialog>
                {dimancheProposition.noteGoogle &&
                  dimancheProposition.nbAvis && (
                    <div className="flex items-center gap-1 text-xs">
                      <p>{dimancheProposition.noteGoogle}</p>
                      <StarRating
                        score={
                          dimancheProposition.noteGoogle
                            ? parseFloat(dimancheProposition.noteGoogle)
                            : 0
                        }
                      />
                      <p>({dimancheProposition.nbAvis})</p>
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
          className="flex h-1/2 justify-between pt-2"
          onClick={() => handleClickDimancheProposition(dimancheProposition)}
        >
          {infosProduit}
          <div className="flex w-1/3 flex-col items-end gap-2">
            {dimanchePrixMensuelText}
            {dimancheProposition.prixAnnuel ? (
              <Switch
                className={`${
                  nettoyage.infos.dimancheSelected
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={nettoyage.infos.dimancheSelected}
                onCheckedChange={() =>
                  handleClickDimancheProposition(dimancheProposition)
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

export default NettoyageMobileOptionsDimancheCard;
