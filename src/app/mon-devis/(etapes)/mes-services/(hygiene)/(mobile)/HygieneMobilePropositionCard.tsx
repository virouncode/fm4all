import FournisseurDialog from "@/app/mon-devis/FournisseurDialog";
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
import { HygieneContext } from "@/context/HygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import Image from "next/image";
import { useContext } from "react";

type HygieneMobilePropositionCardProps = {
  proposition: {
    gamme: "essentiel" | "confort" | "excellence";
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
    gamme: "essentiel" | "confort" | "excellence";
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

const HygieneMobilePropositionCard = ({
  proposition,
  handleClickProposition,
  prixInstalDistrib,
}: HygieneMobilePropositionCardProps) => {
  const { hygiene } = useContext(HygieneContext);
  const {
    gamme,
    nomFournisseur,
    sloganFournisseur,
    logoUrl,
    locationUrl,
    anneeCreation,
    ca,
    effectifFournisseur,
    nbClients,
    noteGoogle,
    nbAvis,
  } = proposition;
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
    <p className="text-sm font-bold">
      {formatNumber(Math.round(proposition.totalAnnuelTrilogie / 12))} €/mois
    </p>
  );

  const prixInstallationText = prixInstalDistrib ? (
    <p className="text-xs">
      +{formatNumber(Math.round(prixInstalDistrib))} € d&apos;installation
    </p>
  ) : null;
  const infosTitle = (
    <p className={`text-${color} text-center`}>
      {gamme === "essentiel"
        ? "Essentiel"
        : gamme === "confort"
        ? "Confort"
        : "Excellence"}
    </p>
  );
  const imgProduit = (
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-200">
      <Image
        src={
          proposition.imageUrlEmp ||
          proposition.imageUrlSavon ||
          proposition.imageUrlPh ||
          "/img/services/hygiene.webp"
        }
        alt={`illustration de nettoyage`}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );
  const imgProduitDialog = (
    <div className="flex items-center justify-between gap-2 w-full">
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
    <ul className="flex flex-col text-xs px-4">
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
    <CarouselItem>
      <div
        className={`bg-${color} flex flex-col h-56 border border-slate-200 rounded-xl p-4 text-white  ${
          hygiene.infos.trilogieGammeSelected === gamme
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <div className="flex items-center h-1/2 gap-2 border-b pb-2 border-slate-200">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>{infosTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 items-center">
                {imgProduitDialog}
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
                  sloganFournisseur={sloganFournisseur}
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
        <div className="flex h-1/2 pt-2 justify-between">
          {infosProduit}
          <div className="flex flex-col gap-2 items-end">
            {totalMensuelText}
            <Switch
              className={`${
                hygiene.infos.trilogieGammeSelected === gamme
                  ? "data-[state=checked]:bg-fm4alldestructive"
                  : ""
              }`}
              checked={hygiene.infos.trilogieGammeSelected === gamme}
              onCheckedChange={() => handleClickProposition(proposition)}
              title="Sélectionnez cette proposition"
            />
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default HygieneMobilePropositionCard;
