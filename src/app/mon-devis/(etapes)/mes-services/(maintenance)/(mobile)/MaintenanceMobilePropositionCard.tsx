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
import { MARGE } from "@/constants/constants";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import Image from "next/image";
import { useContext } from "react";

type MaintenanceMobilePropositionCardProps = {
  handleClickProposition: (proposition: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  }) => void;
  proposition: {
    id: number;
    gamme: "essentiel" | "confort" | "excellence";
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number | null;
    totalAnnuelService: number | null;
    totalAnnuelQ18: number | null;
    totalAnnuelLegio: number | null;
    totalAnnuelQualiteAir: number | null;
    totalAnnuel: number | null;
  };
};

const MaintenanceMobilePropositionCard = ({
  proposition,
  handleClickProposition,
}: MaintenanceMobilePropositionCardProps) => {
  const { maintenance } = useContext(MaintenanceContext);
  const {
    gamme,
    fournisseurId,
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
    hParPassage,
    freqAnnuelle,
    totalAnnuel,
  } = proposition;

  const color = getFm4AllColor(gamme);
  const totalMensuelText = totalAnnuel ? (
    <p className="font-bold text-sm">
      {formatNumber(Math.round((totalAnnuel * MARGE) / 12))} €/mois
    </p>
  ) : (
    <p className="text-sm font-bold">Non proposé</p>
  );
  const nbPassagesText = (
    <li className="list-check ">
      {freqAnnuelle} passage(s) de {hParPassage} h / an
    </li>
  );
  const infosEssentiel = (
    <>
      <li className="list-check ">
        Obligation légale et contrôles règlementaires
      </li>
      <li className="list-check">Contrôle Q18</li>
      {nbPassagesText}
    </>
  );
  const infosConfort = (
    <>
      <li className="list-check ">
        Essentiel + recommandations ARS, petits travaux d’entretien tous les
        trois mois
      </li>
      <li className="list-check ">Contrôle Q18</li>
      <li className="list-check ">Contrôle Legionellose</li>
      {nbPassagesText}
    </>
  );
  const infosExcellence = (
    <>
      <li className="list-check ">
        Une à deux fois par mois passage technicien pour maintenance & petits
        travaux. Lien technique avec le gestionnaire de l’immeuble
      </li>
      <li className="list-check ">Contrôle Q18</li>
      <li className="list-check ">Contrôle Legionellose</li>
      <li className="list-check ">Contrôle Qualité Air</li>
      {nbPassagesText}
    </>
  );

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 w-2/3">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
        ? infosConfort
        : infosExcellence}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
        ? infosConfort
        : infosExcellence}
    </ul>
  );

  const imgProduit = (
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden">
      <Image
        src={`${"/img/services/maintenance.webp"}`}
        alt={`illustration de distributeur de desinfectant`}
        fill={true}
        className="object-cover cursor-pointer"
        quality={100}
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={`${"/img/services/maintenance.webp"}`}
        alt={`illustration de distributeur de desinfectant`}
        fill={true}
        className="object-cover cursor-pointer"
        quality={100}
      />
    </div>
  );

  const dialogTitle = (
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
        className={`bg-${color} flex flex-col h-72 border border-slate-200 rounded-xl p-4 text-white  ${
          maintenance.infos.fournisseurId === fournisseurId &&
          maintenance.infos.gammeSelected === gamme
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <div className="flex items-center h-1/3 gap-2 border-b pb-2 border-slate-200">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
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
        <div className="flex h-2/3 pt-2 justify-between">
          {infosProduit}
          <div className="flex flex-col gap-2 items-end">
            {totalMensuelText}
            {totalMensuelText ? (
              <Switch
                className={`${
                  maintenance.infos.fournisseurId === fournisseurId &&
                  maintenance.infos.gammeSelected === gamme
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={
                  maintenance.infos.fournisseurId === fournisseurId &&
                  maintenance.infos.gammeSelected === gamme
                }
                onCheckedChange={() => handleClickProposition(proposition)}
                title="Sélectionnez cette proposition"
              />
            ) : null}
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default MaintenanceMobilePropositionCard;
