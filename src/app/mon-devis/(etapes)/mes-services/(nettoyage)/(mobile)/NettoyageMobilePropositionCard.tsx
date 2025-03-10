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
import { MARGE, S_OUVREES_PAR_AN } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import Image from "next/image";
import { useContext } from "react";

type NettoyageMobilePropositionCardProps = {
  handleClickProposition: (proposition: {
    id: number;
    fournisseurId: number;
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
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: "essentiel" | "confort" | "excellence";
    totalAnnuel: number | null;
  }) => void;
  proposition: {
    id: number;
    fournisseurId: number;
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
    freqAnnuelle: number | null;
    hParPassage: number;
    tauxHoraire: number;
    gamme: "essentiel" | "confort" | "excellence";
    totalAnnuel: number | null;
  };
};

const NettoyageMobilePropositionCard = ({
  proposition,
  handleClickProposition,
}: NettoyageMobilePropositionCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const {
    fournisseurId,
    gamme,
    freqAnnuelle,
    hParPassage,
    totalAnnuel,
    ca,
    sloganFournisseur,
    logoUrl,
    nomFournisseur,
    locationUrl,
    anneeCreation,
    effectifFournisseur,
    nbClients,
    noteGoogle,
    nbAvis,
  } = proposition;
  const color = getFm4AllColor(gamme);
  const totalMensuelText = (
    <p className="text-sm font-bold">
      {formatNumber(Math.round(((totalAnnuel ?? 0) * MARGE) / 12))} €/mois
    </p>
  );
  const hParSemaineText =
    hParPassage && freqAnnuelle ? (
      <li className="list-check">
        {formatNumber((hParPassage * freqAnnuelle) / S_OUVREES_PAR_AN)} h /
        semaine
      </li>
    ) : null;
  const nbPassagesParSemaineText =
    freqAnnuelle && hParPassage ? (
      <li className="list-check">
        {formatNumber(freqAnnuelle / S_OUVREES_PAR_AN)} passage(s) de
        {hParPassage}h / semaine
      </li>
    ) : null;
  const infosEssentiel = "Entretien fonctionnel et optimisé";
  const infosConfort = "Equilibre parfait entre qualité et efficacité";
  const infosExcellence = "Un standard de propreté exemplaire";
  const infosProduit = (
    <li className="list-check">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
        ? infosConfort
        : infosExcellence}
    </li>
  );
  const infosTitle = (
    <p className={`text-${color} text-center`}>
      {gamme === "essentiel"
        ? "Essentiel"
        : gamme === "confort"
        ? "Confort"
        : "Excellence"}
    </p>
  );

  return (
    <CarouselItem>
      <div
        className={`bg-${color} flex flex-col h-56 border border-slate-200 rounded-xl p-4 text-white  ${
          nettoyage.infos.fournisseurId === fournisseurId &&
          nettoyage.infos.gammeSelected === gamme
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <div className="flex items-center h-1/2 gap-2 border-b pb-2 border-slate-200">
          <Dialog>
            <DialogTrigger asChild>
              <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-100">
                <Image
                  src={"/img/services/nettoyage.webp"}
                  alt={`illustration de nettoyage`}
                  fill={true}
                  className="object-contain cursor-pointer"
                  quality={100}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>{infosTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 items-center">
                <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
                  <Image
                    src={"/img/services/nettoyage.webp"}
                    alt={`illustration de nettoyage`}
                    fill={true}
                    className="object-contain object-center cursor-pointer"
                    quality={100}
                  />
                </div>
                <ul className="flex flex-col text-xs px-4">
                  {infosProduit}
                  {hParSemaineText}
                  {nbPassagesParSemaineText}
                </ul>
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
        <div
          className="flex h-1/2 pt-2 justify-between"
          onClick={() => handleClickProposition(proposition)}
        >
          <ul className="flex flex-col ml-4 text-xs w-2/3">
            {infosProduit}
            {hParSemaineText}
            {nbPassagesParSemaineText}
          </ul>
          <div className="flex flex-col gap-2 items-end">
            {totalMensuelText}
            <Switch
              className={`${
                nettoyage.infos.fournisseurId === fournisseurId &&
                nettoyage.infos.gammeSelected === gamme
                  ? "data-[state=checked]:bg-fm4alldestructive"
                  : ""
              }`}
              checked={
                nettoyage.infos.fournisseurId === fournisseurId &&
                nettoyage.infos.gammeSelected === gamme
              }
              onCheckedChange={() => handleClickProposition(proposition)}
              onClick={(e) => e.stopPropagation()}
              title="Sélectionnez cette proposition"
            />
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default NettoyageMobilePropositionCard;
