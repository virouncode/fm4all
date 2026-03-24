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
import { MARGE } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { useTranslations } from "next-intl";
import PresignedLogoImage from "@/components/devis/PresignedLogoImage";
import Image from "next/image";

type NettoyageMobileOptionsDimanchePropositionsProps = {
  dimancheProposition: {
    id: string;
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
  };
  handleClickDimancheProposition: (proposition: {
    id: string;
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

const NettoyageMobileOptionsDimancheCard = ({
  dimancheProposition,
  handleClickDimancheProposition,
  color,
}: NettoyageMobileOptionsDimanchePropositionsProps) => {
  const t = useTranslations("DevisPage");
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const tGlobal = useTranslations("Global");
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const { gammeSelected: gamme, nomPrestataire } = nettoyage.infos;
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
        {tNettoyage("nettoyage-supplementaire-tous-les-dimanches")}
      </p>
      <div
        className={`bg-${color} flex h-64 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          nettoyage.infos.dimancheSelected
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
            {dimancheProposition.prixAnnuel ? (
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
                      <DialogTitle>
                        {nettoyage.infos.nomPrestataire}
                      </DialogTitle>
                    </DialogHeader>
                    <PrestataireDialog
                      sloganPrestataire={dimancheProposition.slogan}
                      logoStorageKey={dimancheProposition.logoStorageKey}
                      nomPrestataire={dimancheProposition.nomPrestataire}
                      locationUrl={null}
                      anneeCreation={dimancheProposition.anneeCreation}
                      ca={dimancheProposition.ca}
                      effectifPrestataire={dimancheProposition.effectifPrestataire}
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
                    ? "data-[state=checked]:bg-destructive"
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
