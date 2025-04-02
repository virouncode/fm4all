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
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useContext } from "react";

type ThePropositionCardProps = {
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
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    effectif: number;
    prixUnitaire: number | null;
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
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    effectif: number;
    prixUnitaire: number | null;
  }) => void;
  nbTassesParJour: number;
};

const ThePropositionCard = ({
  proposition,
  handleClickProposition,
  nbTassesParJour,
}: ThePropositionCardProps) => {
  const t = useTranslations("DevisPage");
  const tThe = useTranslations("DevisPage.foodBeverage.the");
  const tGlobal = useTranslations("Global");
  const tCafe = useTranslations("DevisPage.foodBeverage.cafe");
  const { the } = useContext(TheContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  if (!proposition.totalAnnuel) {
    return (
      <div
        className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-lg gap-4 text-center font-bold`}
      >
        {t("non-propose")}
      </div>
    );
  }
  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round((proposition.totalAnnuel * MARGE) / 12))}{" "}
      {t("euros-mois")}
    </p>
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
    <ul className="flex flex-col text-xs px-4 mx-auto">
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
    <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
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
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
        the.infos.gammeSelected === proposition.gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={the.infos.gammeSelected === proposition.gamme}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title={t("selectionnez-cette-proposition")}
      />
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
              {imgProduit}
              <p className="text-xs italic text-end">
                {t("photo-non-contractuelle")}
              </p>
              {infosProduitDialog}
            </DialogContent>
          </Dialog>
        </div>
        {infosProduit}
      </div>
    </div>
  );
};

export default ThePropositionCard;
