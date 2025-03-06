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
    id,
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
  const totalMensuelText = `${formatNumber(
    Math.round(((totalAnnuel ?? 0) * MARGE) / 12)
  )} €/mois`;
  const hParSemaineText =
    hParPassage && freqAnnuelle
      ? `${formatNumber(
          (hParPassage * freqAnnuelle) / S_OUVREES_PAR_AN
        )} h / semaine`
      : "";
  const infosEssentiel = <p>Entretien fonctionnel et optimisé</p>;
  const infosConfort = <p>Equilibre parfait entre qualité et efficacité</p>;
  const infosExcellence = <p>Un standard de propreté exemplaire</p>;
  const infosTitle = (
    <p className={`text-${color} text-center`}>
      {gamme === "essentiel"
        ? "Essentiel"
        : gamme === "confort"
        ? "Confort"
        : "Excellence"}
    </p>
  );

  const infosProduit = (
    <li className="list-check">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
        ? infosConfort
        : infosExcellence}
    </li>
  );
  const nbPassagesParSemaineText =
    freqAnnuelle && hParPassage
      ? `${formatNumber(
          freqAnnuelle / S_OUVREES_PAR_AN
        )} passage(s) de ${hParPassage}h / semaine`
      : "";
  return (
    // <CarouselItem>
    //   <div
    //     className={`bg-${color} flex flex-col h-56 border border-slate-200 rounded-xl p-4 text-white  ${
    //       nettoyage.infos.fournisseurId === fournisseurId &&
    //       nettoyage.infos.gammeSelected === gamme
    //         ? "ring-4 ring-inset ring-fm4alldestructive"
    //         : ""
    //     }`}
    //   >
    //     <NettoyageMobileFournisseurLogo {...proposition} />
    //     <div className="flex-1 flex flex-col gap-2 justify-center">
    //       <div
    //         className={`flex flex-1 text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer p-4`}
    //         key={id}
    //         onClick={() => handleClickProposition(proposition)}
    //       >
    //         <Checkbox
    //           checked={
    //             nettoyage.infos.fournisseurId === fournisseurId &&
    //             nettoyage.infos.gammeSelected === gamme
    //           }
    //           onCheckedChange={() => handleClickProposition(proposition)}
    //           className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
    //           aria-label="Sélectionner cette proposition"
    //         />
    //         <div className="text-white">
    //           <div className="flex gap-2 items-center">
    //             <p className="font-bold">{totalMensuelText}</p>
    //             <Dialog>
    //               <DialogTrigger asChild>
    //                 <Button
    //                   size="icon"
    //                   variant="ghost"
    //                   className="hover:bg-transparent hover:text-white hover:opacity-80"
    //                   onClick={(e) => e.stopPropagation()}
    //                   title="Détails de l'offre"
    //                 >
    //                   <Info size={16} />
    //                 </Button>
    //               </DialogTrigger>
    //               <DialogContent className="w-5/6 sm:max-w-[425px] rounded-xl">
    //                 <DialogHeader>
    //                   <DialogTitle>{infosTitle}</DialogTitle>
    //                 </DialogHeader>
    //                 {infosProduit}
    //               </DialogContent>
    //             </Dialog>
    //           </div>
    //           <p className="text-base">{hParSemaineText}</p>
    //           <p className="text-xs">{nbPassagesParSemaineText}</p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </CarouselItem>
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
              <div className="w-1/3 h-full relative rounded-xl overflow-hidden">
                <Image
                  src={"/img/services/nettoyage.webp"}
                  alt={`illustration de nettoyage`}
                  fill={true}
                  className="object-cover cursor-pointer"
                  quality={100}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>{infosTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {proposition.logoUrl ? (
                  <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
                    <Image
                      src={"/img/services/nettoyage.webp"}
                      alt={`illustration de nettoyage`}
                      fill={true}
                      className="object-contain object-center cursor-pointer"
                      quality={100}
                    />
                  </div>
                ) : null}
                <ul className="flex flex-col text-xs mx-auto">
                  {infosProduit}
                  <li className="list-check">{hParSemaineText}</li>
                  <li className="list-check">{nbPassagesParSemaineText}</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>

          <div className="w-2/3 flex flex-col gap-1 h-full">
            <p className="font-bold text-sm">{proposition.nomFournisseur}</p>
            <Dialog>
              <DialogTrigger asChild>
                {proposition.logoUrl ? (
                  <div className="h-10 relative">
                    <Image
                      src={proposition.logoUrl}
                      alt={`logo-de-${proposition.nomFournisseur}`}
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
          <ul className="flex flex-col text-xs ml-4 w-2/3">
            {infosProduit}
            <li className="list-check">{hParSemaineText}</li>
            <li className="list-check">{nbPassagesParSemaineText}</li>
          </ul>
          <div className="flex flex-col gap-2 items-end">
            <p className="text-sm font-bold">{totalMensuelText}</p>
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
              title="Sélectionner cette proposition"
            />
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default NettoyageMobilePropositionCard;
