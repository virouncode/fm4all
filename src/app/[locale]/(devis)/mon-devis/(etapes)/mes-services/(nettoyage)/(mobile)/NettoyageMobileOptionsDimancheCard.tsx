import StarRating from "@/components/star-rating";
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
import Image from "next/image";
import { useContext } from "react";
import FournisseurDialog from "../../../../FournisseurDialog";

type NettoyageMobileOptionsDimanchePropositionsProps = {
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
  handleClickDimancheProposition: (proposition: {
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

const NettoyageMobileOptionsDimancheCard = ({
  dimancheProposition,
  handleClickDimancheProposition,
  color,
}: NettoyageMobileOptionsDimanchePropositionsProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const { gammeSelected: gamme, nomFournisseur } = nettoyage.infos;
  const dimanchePrixMensuelText = dimancheProposition.prixAnnuel ? (
    <p className="text-sm font-bold text-end">
      {formatNumber(Math.round((dimancheProposition?.prixAnnuel * MARGE) / 12))}{" "}
      €/mois
    </p>
  ) : (
    <p className="text-xs font-bold text-end">Non proposé</p>
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
  const dimancheNbPassagesParSemaineText = (
    <li className="list-check">
      1 passage de {nettoyage.quantites.hParPassage} h / semaine en plus
    </li>
  );
  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 w-2/3">
      <li className="list-check">
        Ajoute une journée à la fréquence de nettoyage
      </li>
      {dimancheNbPassagesParSemaineText}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      <li className="list-check">
        Ajoute une journée à la fréquence de nettoyage
      </li>
      {dimancheNbPassagesParSemaineText}
    </ul>
  );

  const imgProduit = (
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-100">
      <Image
        src={"/img/services/nettoyage.webp"}
        alt={`illustration de nettoyage`}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );
  const imgProduitDialog = (
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
    <div className="flex flex-col gap-1">
      <p className="font-bold text-xl">
        Nettoyage supplémentaire tous les dimanches
      </p>
      <div
        className={`bg-${color} flex flex-col h-64 border border-slate-200 rounded-xl p-4 text-white  ${
          nettoyage.infos.dimancheSelected
            ? "ring-4 ring-inset ring-fm4alldestructive"
            : ""
        }`}
      >
        <div className="flex items-center h-1/2 gap-2 border-b pb-2 border-slate-200">
          <Dialog>
            <DialogTrigger asChild>{imgProduit}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 ">
                {imgProduitDialog}
                <p className="text-xs italic text-end">
                  *photo non contractuelle
                </p>
                {infosProduitDialog}
              </div>
            </DialogContent>
          </Dialog>
          <div className="w-2/3 flex flex-col gap-1 h-full">
            <p className="font-bold text-sm">{nomFournisseur}</p>
            {dimancheProposition.prixAnnuel ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    {nettoyage.infos.logoUrl ? (
                      <div className="h-10 relative">
                        <Image
                          src={nettoyage.infos.logoUrl}
                          alt={`logo-de-${nettoyage.infos.nomFournisseur}`}
                          fill={true}
                          className="object-contain object-left cursor-pointer"
                          quality={100}
                        />
                      </div>
                    ) : null}
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
                    <DialogHeader>
                      <DialogTitle>
                        {nettoyage.infos.nomFournisseur}
                      </DialogTitle>
                    </DialogHeader>
                    <FournisseurDialog
                      sloganFournisseur={dimancheProposition.slogan}
                      logoUrl={dimancheProposition.logoUrl}
                      nomFournisseur={dimancheProposition.nomFournisseur}
                      locationUrl={dimancheProposition.locationUrl}
                      anneeCreation={dimancheProposition.anneeCreation}
                      ca={dimancheProposition.ca}
                      effectif={dimancheProposition.effectif}
                      nbClients={dimancheProposition.nbClients}
                      noteGoogle={dimancheProposition.noteGoogle}
                      nbAvis={dimancheProposition.nbAvis}
                    />
                  </DialogContent>
                </Dialog>
                {dimancheProposition.noteGoogle &&
                  dimancheProposition.nbAvis && (
                    <div className="flex items-center gap-1 text-xs">
                      <p>{dimancheProposition.noteGoogle}</p>
                      <StarRating
                        score={
                          dimancheProposition.noteGoogle
                            ? parseFloat(dimancheProposition.noteGoogle)
                            : 0
                        }
                      />
                      <p>({dimancheProposition.nbAvis})</p>
                    </div>
                  )}
              </>
            ) : nettoyage.infos.logoUrl ? (
              <div className="h-10 relative">
                <Image
                  src={nettoyage.infos.logoUrl}
                  alt={`logo-de-${nettoyage.infos.nomFournisseur}`}
                  fill={true}
                  className="object-contain object-left cursor-pointer"
                  quality={100}
                />
              </div>
            ) : null}
          </div>
        </div>
        <div
          className="flex h-1/2 pt-2 justify-between"
          onClick={() => handleClickDimancheProposition(dimancheProposition)}
        >
          {infosProduit}
          <div className="flex flex-col gap-2 items-end w-1/3">
            {dimanchePrixMensuelText}
            {dimancheProposition.prixAnnuel ? (
              <Switch
                className={`${
                  nettoyage.infos.dimancheSelected
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={nettoyage.infos.dimancheSelected}
                onCheckedChange={() =>
                  handleClickDimancheProposition(dimancheProposition)
                }
                title="Sélectionner cette proposition"
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NettoyageMobileOptionsDimancheCard;
