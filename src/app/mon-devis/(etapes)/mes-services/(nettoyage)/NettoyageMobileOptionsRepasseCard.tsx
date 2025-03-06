import FournisseurDialog from "@/app/mon-devis/FournisseurDialog";
import StarRating from "@/components/star-rating";
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
import Image from "next/image";
import { useContext } from "react";

type NettoyageMobileOptionsRepasseCardProps = {
  repasseProposition: {
    id: number;
    hParPassage: number;
    tauxHoraire: number;
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
  } | null;
  handleClickRepasseProposition: (proposition: {
    id: number;
    hParPassage: number;
    tauxHoraire: number;
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

const NettoyageMobileOptionsRepasseCard = ({
  repasseProposition,
  handleClickRepasseProposition,
  color,
}: NettoyageMobileOptionsRepasseCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const { gammeSelected: gamme } = nettoyage.infos;
  const totalMensuelText = repasseProposition?.prixAnnuel ? (
    <p className="text-sm font-bold text-end">
      {formatNumber(Math.round((repasseProposition.prixAnnuel * MARGE) / 12))} €
      / mois
    </p>
  ) : (
    <p className="text-xs font-bold text-end">
      Non proposé pour une fréquence inférieure à 5 passages/semaine
    </p>
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
  const infosProduit = (
    <li className="list-check list-inside">
      Second passage dans la même journée pour entretenir sanitaires et zones
      sensibles
    </li>
  );
  const repasseHParSemaineText =
    repasseProposition && nettoyage.quantites.freqAnnuelle ? (
      <li className="list-check list-inside">
        {formatNumber(
          (repasseProposition.hParPassage * nettoyage.quantites.freqAnnuelle) /
            S_OUVREES_PAR_AN
        )}{" "}
        h / semaine en plus
      </li>
    ) : null;
  const repasseNbPassagesParSemaineText =
    repasseProposition && nettoyage.quantites.freqAnnuelle ? (
      <li className="list-check list-inside">
        {formatNumber(nettoyage.quantites.freqAnnuelle / S_OUVREES_PAR_AN)}{" "}
        passage(s) de {repasseProposition.hParPassage} h / semaine
      </li>
    ) : null;
  return (
    <div className="flex flex-col gap-1">
      <p className="font-bold">Repasse Sanitaire</p>
      <div
        className={`bg-${color} flex flex-col h-72 border border-slate-200 rounded-xl p-4 text-white  ${
          nettoyage.infos.repasseSelected && repasseProposition
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
                {repasseProposition?.logoUrl ? (
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
                <ul className="flex flex-col text-xs mx-auto w-2/3">
                  {infosProduit}
                  {repasseHParSemaineText}
                  {repasseNbPassagesParSemaineText}
                </ul>
              </div>
            </DialogContent>
          </Dialog>

          <div className="w-2/3 flex flex-col gap-1 h-full">
            <p className="font-bold text-sm">
              {nettoyage.infos.nomFournisseur}
            </p>

            {repasseProposition ? (
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
                      sloganFournisseur={repasseProposition.slogan}
                      logoUrl={repasseProposition.logoUrl}
                      nomFournisseur={repasseProposition.nomFournisseur}
                      locationUrl={repasseProposition.locationUrl}
                      anneeCreation={repasseProposition.anneeCreation}
                      ca={repasseProposition.ca}
                      effectif={repasseProposition.effectif}
                      nbClients={repasseProposition.nbClients}
                      noteGoogle={repasseProposition.noteGoogle}
                      nbAvis={repasseProposition.nbAvis}
                    />
                  </DialogContent>
                </Dialog>
                {repasseProposition.noteGoogle && repasseProposition.nbAvis && (
                  <div className="flex items-center gap-1 text-xs">
                    <p>{repasseProposition.noteGoogle}</p>
                    <StarRating
                      score={
                        repasseProposition.noteGoogle
                          ? parseFloat(repasseProposition.noteGoogle)
                          : 0
                      }
                    />
                    <p>({repasseProposition.nbAvis})</p>
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
        <div className="flex h-1/2 pt-2 justify-between gap-6">
          <ul className="flex flex-col text-xs w-2/3">
            {infosProduit}
            {repasseHParSemaineText}
            {repasseNbPassagesParSemaineText}
          </ul>
          <div className="flex flex-col gap-2 items-end w-1/3">
            {totalMensuelText}
            {repasseProposition && (
              <Switch
                className={`${
                  nettoyage.infos.repasseSelected
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={nettoyage.infos.repasseSelected}
                onCheckedChange={() =>
                  handleClickRepasseProposition(repasseProposition)
                }
                title="Sélectionner cette proposition"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NettoyageMobileOptionsRepasseCard;
