import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { Info } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

type NettoyageOptionsDimancheCardProps = {
  dimancheProposition: {
    id: number;
    prixAnnuel: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  };
  handleClickDimancheProposition: (dimancheProposition: {
    id: number;
    prixAnnuel: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectif: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
  }) => void;
  color: string;
};

const NettoyageOptionsDimancheCard = ({
  dimancheProposition,
  handleClickDimancheProposition,
  color,
}: NettoyageOptionsDimancheCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const dimanchePrixMensuelText = dimancheProposition.prixAnnuel ? (
    <p className="font-bold text-xl ml-4">
      {formatNumber(Math.round((dimancheProposition?.prixAnnuel * MARGE) / 12))}{" "}
      €/mois
    </p>
  ) : (
    <p className="font-bold text-base">Non proposé</p>
  );

  const dimancheNbPassagesParSemaineText = (
    <li className="list-check">
      1 passage de {nettoyage.quantites.hParPassage} h / semaine en plus
    </li>
  );
  const infosProduit = (
    <li className="list-check">
      Ajoute une journée à la fréquence de nettoyage
    </li>
  );
  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      Nettoyage supplémentaire tous les dimanches
    </p>
  );
  const imgProduit = (
    <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill={true}
        className="object-contain object-center cursor-pointer"
        quality={100}
      />
    </div>
  );

  return (
    <div className="flex border-b flex-1">
      <div className="flex w-1/4 items-center justify-center text-base text-center p-4">
        Nettoyage supplémentaire tous les dimanches
      </div>
      <div
        className={`flex w-3/4 items-center p-4 justify-center ${
          nettoyage.infos.dimancheSelected
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        } bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer`}
        onClick={
          dimancheProposition.prixAnnuel
            ? () => handleClickDimancheProposition(dimancheProposition)
            : undefined
        }
      >
        {dimancheProposition.prixAnnuel ? (
          <Switch
            checked={nettoyage.infos.dimancheSelected}
            onCheckedChange={() =>
              handleClickDimancheProposition(dimancheProposition)
            }
            className="data-[state=checked]:bg-fm4alldestructive"
            title="Sélectionner cette proposition"
          />
        ) : null}
        <div>
          <div className="flex gap-2 items-center">
            {dimanchePrixMensuelText}
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
                <div className="flex flex-col gap-4">
                  {imgProduit}
                  <p className="text-xs italic text-end">
                    *photo non contractuelle
                  </p>
                  <ul className="flex flex-col text-sm px-4 mx-auto">
                    {infosProduit}
                    {dimancheNbPassagesParSemaineText}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ul className="flex flex-col text-xs ml-4">
            {infosProduit}
            {dimancheNbPassagesParSemaineText}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NettoyageOptionsDimancheCard;
