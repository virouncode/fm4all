import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const totalMensuelText = `${formatNumber(
    Math.round(proposition.totalAnnuelTrilogie / 12)
  )} € / mois`;
  const prixInstallationText = prixInstalDistrib
    ? `+ ${formatNumber(Math.round(prixInstalDistrib))} € d'installation`
    : "";

  const infosTitle = (
    <p className={`text-${getFm4AllColor(proposition.gamme)} text-center`}>
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
    <div>
      <p className="text-sm mb-2">
        Distributeurs{" "}
        {gamme === "essentiel"
          ? "blancs basic"
          : gamme === "confort"
          ? "couleur"
          : "inox"}
      </p>
      {imgProduit}
      <p className="text-xs text-end italic">*photos non contractuelles</p>
    </div>
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
      <Checkbox
        checked={hygiene.infos.trilogieGammeSelected === gamme}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
        aria-label="Sélectionner cette proposition"
      />
      <div>
        <div className="flex gap-2 items-center">
          <p className="font-bold">{totalMensuelText}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-transparent hover:text-slate-200 hover:opacity-80"
                onClick={(e) => e.stopPropagation()}
              >
                <Info size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{infosTitle}</DialogTitle>
              </DialogHeader>
              {infosProduit}
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm">
          Distributeurs{" "}
          {gamme === "essentiel"
            ? "blancs basic"
            : gamme === "confort"
            ? "couleur"
            : "inox"}
        </p>
        <p className="text-sm">Consommables</p>
        <p className="text-sm">
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
        </p>
        {prixInstallationText && (
          <p className="text-base">{prixInstallationText}</p>
        )}
      </div>
    </div>
  );
};

export default HygienePropositionCard;
