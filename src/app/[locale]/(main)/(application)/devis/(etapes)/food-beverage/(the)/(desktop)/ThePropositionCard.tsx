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
import { useTheStore } from "@/stores/devis/theStore";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type ThePropositionCardProps = {
  proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: string;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    entrepriseId: string;
    gamme: "essentiel" | "confort" | "excellence";
    effectif: number;
    prixUnitaire: number | null;
  };
  handleClickProposition: (proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: string;
    nomPrestataire: string;
    slogan: string | null;
    logoStorageKey: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    entrepriseId: string;
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
  const the = useTheStore((s) => s.the);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  if (!proposition.totalAnnuel) {
    return (
      <div
        className={`flex flex-1 bg-${color} items-center justify-center gap-4 p-4 text-center text-lg font-bold text-slate-200`}
      >
        {t("non-propose")}
      </div>
    );
  }
  const totalMensuelText = (
    <p className="ml-4 text-xl font-bold" data-testid={`total-mensuel-the`}>
      {formatNumber((proposition.totalAnnuel * MARGE) / 12)} {t("euros-mois")}
    </p>
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
    <ul className="mx-auto flex flex-col px-4 text-xs">
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
    <div className="relative mx-auto h-64 w-full rounded-lg border border-slate-300 bg-slate-100">
      <Image
        src={
          gamme === "excellence"
            ? "/img/services/the_coffrets.webp"
            : "/img/services/the_sachets.webp"
        }
        alt={`illustration de thés variés`}
        fill
        className="object-contain"
        sizes="(min-width:768px) 33vw"
      />
    </div>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} cursor-pointer items-center justify-center gap-4 p-4 text-2xl text-slate-200 ${
        the.infos.gammeSelected === proposition.gamme
          ? "ring-destructive ring-4 ring-inset"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={the.infos.gammeSelected === proposition.gamme}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-destructive"
        title={t("selectionnez-cette-proposition")}
        data-testid="the-switch"
      />
      <div>
        <div className="flex items-center gap-2">
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
              <p className="text-end text-xs italic">
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
