import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { HygieneContext } from "@/context/HygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import { Info } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

type HygienePropositionCardProps = {
  proposition: {
    gamme: GammeType;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
    imageUrlEmp: string | null;
    imageUrlSavon: string | null;
    imageUrlPh: string | null;
  };
  handleClickProposition: (proposition: {
    gamme: GammeType;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
    imageUrlEmp: string | null;
    imageUrlSavon: string | null;
    imageUrlPh: string | null;
  }) => void;
  prixInstalDistrib: number | null;
};

const HygienePropositionCard = ({
  proposition,
  handleClickProposition,
  prixInstalDistrib,
}: HygienePropositionCardProps) => {
  const { hygiene } = useContext(HygieneContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  if (!proposition.totalAnnuelTrilogie) {
    return (
      <div
        className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 p-4`}
      >
        Non proposé
      </div>
    );
  }
  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round(proposition.totalAnnuelTrilogie / 12))} €/mois
    </p>
  );

  const prixInstallationText = prixInstalDistrib ? (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round(prixInstalDistrib))} € d&apos;installation
    </p>
  ) : null;

  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {proposition.gamme === "essentiel"
        ? "Essentiel"
        : proposition.gamme === "confort"
        ? "Confort"
        : "Excellence"}
    </p>
  );

  const imgProduit = (
    <div className="flex items-center justify-between gap-2">
      {proposition.imageUrlEmp ? (
        <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
          <Image
            src={proposition.imageUrlEmp}
            alt="illustration-essuie-mains-papier"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      ) : null}
      {proposition.imageUrlPh ? (
        <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
          <Image
            src={proposition.imageUrlPh}
            alt="illustration-ditributeur-papier-hygiénique"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      ) : null}
      {proposition.imageUrlSavon ? (
        <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
          <Image
            src={proposition.imageUrlSavon}
            alt="illustration-ditributeur-savon"
            fill
            quality={100}
            className="object-contain"
          />
        </div>
      ) : null}
    </div>
  );

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 mx-auto">
      <li className="list-check">
        Distributeurs{" "}
        {gamme === "essentiel"
          ? "blancs basic"
          : gamme === "confort"
          ? "couleur"
          : "inox"}
      </li>
      <li className="list-check">Consommables inclus</li>
      <li className="list-check">
        {hygiene.infos.dureeLocation === "oneShot"
          ? ""
          : `Location engagement
            ${
              hygiene.infos.dureeLocation === "pa12M"
                ? "12"
                : hygiene.infos.dureeLocation === "pa24M"
                ? "24"
                : "36"
            } mois`}
      </li>
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      <li className="list-check">
        Distributeurs{" "}
        {gamme === "essentiel"
          ? "blancs basic"
          : gamme === "confort"
          ? "couleur"
          : "inox"}
      </li>
      <li className="list-check">Consommables inclus</li>
      <li className="list-check">
        {hygiene.infos.dureeLocation === "oneShot"
          ? ""
          : `Location engagement
            ${
              hygiene.infos.dureeLocation === "pa12M"
                ? "12"
                : hygiene.infos.dureeLocation === "pa24M"
                ? "24"
                : "36"
            } mois`}
      </li>
    </ul>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer p-4 ${
        hygiene.infos.trilogieGammeSelected === gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={hygiene.infos.trilogieGammeSelected === gamme}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title="Sélectionner cette proposition"
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
              {infosProduitDialog}
            </DialogContent>
          </Dialog>
        </div>
        {infosProduit}
        {prixInstallationText && (
          <p className="text-base">{prixInstallationText}</p>
        )}
      </div>
    </div>
  );
};

export default HygienePropositionCard;
