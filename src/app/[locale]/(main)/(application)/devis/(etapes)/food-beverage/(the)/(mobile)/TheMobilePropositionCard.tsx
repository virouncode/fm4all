import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
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
import { MARGE } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useTheStore } from "@/stores/theStore";
import { useTranslations } from "next-intl";
import Image from "next/image";

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
  const the = useTheStore((s) => s.the);
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
      {formatNumber((totalAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
  ) : (
    <p className="text-sm font-bold">{t("non-propose")}</p>
  );

  const infosEssentiel = (
    <>
      <li className="list-check">
        {tThe("the-en-sachet-un-ou-deux-au-choix")}
      </li>
      {proposition.infos && <li className="list-check">{proposition.infos}</li>}
    </>
  );

  const infosConfort = (
    <>
      <li className="list-check">
        {tThe("choix-de-plusieurs-thes-en-sachets")}
      </li>
      {proposition.infos && <li className="list-check">{proposition.infos}</li>}
    </>
  );

  const infosExcellence = (
    <>
      <li className="list-check">
        {tThe("thes-premium-en-boite-bois-ou-presentoir")}
      </li>
      {proposition.infos && <li className="list-check">{proposition.infos}</li>}
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
    <ul className="flex w-2/3 flex-col px-4 text-xs">
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
    <ul className="mx-auto flex flex-col px-4 text-sm">
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
    <div className="relative h-full w-1/3 overflow-hidden rounded-xl bg-slate-100">
      <Image
        src={
          gamme === "excellence"
            ? "/img/services/the_coffrets.webp"
            : "/img/services/the_sachets.webp"
        }
        alt={`illustration de thés variés`}
        fill
        quality={100}
        className="cursor-pointer object-contain"
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
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
        className={`bg-${color} flex h-64 flex-col rounded-xl border border-slate-200 p-4 text-white ${
          the.infos.gammeSelected === gamme
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
            <Dialog>
              <DialogTrigger asChild>
                {logoUrl ? (
                  <div className="relative h-10">
                    <Image
                      src={logoUrl}
                      alt={`logo-de-${nomFournisseur}`}
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
          className="flex h-1/2 justify-between pt-2"
          onClick={
            totalAnnuel ? () => handleClickProposition(proposition) : undefined
          }
        >
          {infosProduit}
          <div className="flex flex-col items-end gap-2">
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
