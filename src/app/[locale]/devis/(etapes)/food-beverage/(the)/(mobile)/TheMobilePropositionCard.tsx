import FournisseurDialog from "@/app/[locale]/devis/FournisseurDialog";
import StarRating from "@/components/star-rating";
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
import { TheContext } from "@/context/TheProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type TheMobilePropositionCardProps = {
  proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: number;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    prixUnitaire: number | null;
    effectifFournisseur: string | null;
  };
  handleClickProposition: (proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: number;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    prixUnitaire: number | null;
    effectifFournisseur: string | null;
  }) => void;
  nbTassesParJour: number;
};

const TheMobilePropositionCard = ({
  proposition,
  handleClickProposition,
  nbTassesParJour,
}: TheMobilePropositionCardProps) => {
  const tGlobal = useTranslations("Global");
  const t = useTranslations("DevisPage");
  const tThe = useTranslations("DevisPage.foodBeverage.the");
  const tCafe = useTranslations("DevisPage.foodBeverage.cafe");
  const { the } = useContext(TheContext);
  const {
    gamme,
    nomFournisseur,
    slogan,
    logoUrl,
    locationUrl,
    anneeCreation,
    ca,
    nbClients,
    noteGoogle,
    nbAvis,
    effectifFournisseur,
    totalAnnuel,
  } = proposition;

  const color = getFm4AllColor(gamme);

  const totalMensuelText = totalAnnuel ? (
    <p className="text-sm font-bold">
      {formatNumber(Math.round((totalAnnuel * MARGE) / 12))} {t("euros-mois")}
    </p>
  ) : (
    <p className="text-sm font-bold">{t("non-propose")}</p>
  );

  const infosEssentiel = (
    <>
      <li className="list-check font-bold">
        {tThe("the-en-sachet-un-ou-deux-au-choix")}
      </li>
      {proposition.infos && (
        <li className="list-check font-bold">{proposition.infos}</li>
      )}
    </>
  );

  const infosConfort = (
    <>
      <li className="list-check font-bold">
        {tThe("choix-de-plusieurs-thes-en-sachets")}
      </li>
      {proposition.infos && (
        <li className="list-check font-bold">{proposition.infos}</li>
      )}
    </>
  );

  const infosExcellence = (
    <>
      <li className="list-check font-bold">
        {tThe("thes-premium-en-boite-bois-ou-presentoir")}
      </li>
      {proposition.infos && (
        <li className="list-check font-bold">{proposition.infos}</li>
      )}
    </>
  );

  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {proposition.gamme === "essentiel"
        ? tGlobal("essentiel")
        : proposition.gamme === "confort"
          ? tGlobal("confort")
          : tGlobal("excellence")}
    </p>
  );

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 w-2/3">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
          ? infosConfort
          : infosExcellence}
      <li className="list-check">
        {t("consommables")} {nbTassesParJour} {tCafe("tasses-j")}
      </li>
    </ul>
  );
  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
          ? infosConfort
          : infosExcellence}
      <li className="list-check">
        {t("consommables")} {nbTassesParJour} {tCafe("tasses-j")}
      </li>
    </ul>
  );

  const imgProduit = (
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-100">
      <Image
        src={
          gamme === "excellence"
            ? "/img/services/the_coffrets.webp"
            : "/img/services/the_sachets.webp"
        }
        alt={`illustration de thés variés`}
        fill
        quality={100}
        className="object-contain cursor-pointer"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={
          gamme === "excellence"
            ? "/img/services/the_coffrets.webp"
            : "/img/services/the_sachets.webp"
        }
        alt={`illustration de thés variés`}
        fill
        quality={100}
        className="object-contain"
      />
    </div>
  );

  return (
    <CarouselItem>
      <div
        className={`bg-${color} flex flex-col h-64 border border-slate-200 rounded-xl p-4 text-white  ${
          the.infos.gammeSelected === gamme
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
                  sloganFournisseur={slogan}
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
          onClick={
            totalAnnuel ? () => handleClickProposition(proposition) : undefined
          }
        >
          {infosProduit}
          <div className="flex flex-col gap-2 items-end">
            {totalMensuelText}
            {totalAnnuel ? (
              <Switch
                className={`${
                  the.infos.gammeSelected === gamme
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={the.infos.gammeSelected === gamme}
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

export default TheMobilePropositionCard;
