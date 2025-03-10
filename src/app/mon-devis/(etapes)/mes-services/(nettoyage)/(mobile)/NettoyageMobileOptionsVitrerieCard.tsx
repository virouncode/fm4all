import FournisseurDialog from "@/app/mon-devis/FournisseurDialog";
import StarRating from "@/components/star-rating";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MARGE } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import Image from "next/image";
import React, { useContext } from "react";
import { MAX_PASSAGES_VITRERIE } from "../(desktop)/NettoyageOptionsPropositions";

type NettoyageMobileOptionsVitrerieCardProps = {
  vitrerieProposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
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
  handleClickVitrerieProposition: (proposition: {
    id: number;
    tauxHoraire: number;
    cadenceCloisons: number;
    cadenceVitres: number;
    minFacturation: number;
    fraisDeplacement: number;
    prixAnnuel: number | null;
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
  handleChangeNbPassageVitrerie: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  color: string;
};

const NettoyageMobileOptionsVitrerieCard = ({
  vitrerieProposition,
  handleClickVitrerieProposition,
  handleChangeNbPassageVitrerie,
  color,
}: NettoyageMobileOptionsVitrerieCardProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const { gammeSelected: gamme } = nettoyage.infos;
  const vitreriePrixMensuelText = vitrerieProposition.prixAnnuel ? (
    <p className="text-sm font-bold text-end">
      {formatNumber(Math.round((vitrerieProposition.prixAnnuel * MARGE) / 12))}{" "}
      €/mois
    </p>
  ) : (
    <p className="text-xs font-bold text-end">Non proposé</p>
  );
  const nbPassagesVitrerieText = (
    <li className="list-check">
      {nettoyage.quantites.nbPassagesVitrerie} passages / an
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
  const infosProduit = (
    <li className="list-check">Vitres et cloisons accessibles de plain-pied</li>
  );
  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold text-xl">Lavage Vitrerie</p>
      <p>Indiquez le nombre de passages par an : </p>
      <div className="flex flex-col w-full p-1 gap-2">
        <Label htmlFor="nbDePassagesVitrerie" className="text-sm">
          Nombre de passages / an
        </Label>
        <Input
          type="number"
          value={nettoyage.quantites.nbPassagesVitrerie || ""}
          min={1}
          max={MAX_PASSAGES_VITRERIE}
          step={1}
          onChange={handleChangeNbPassageVitrerie}
          className={`w-full ${
            nettoyage.quantites.nbPassagesVitrerie === 2
              ? "text-fm4alldestructive"
              : ""
          }`}
        />
        <p className="text-xs italic text-fm4alldestructive">
          Les quantités sont estimées pour vous mais vous pouvez les changer
        </p>
      </div>
      <div
        className={`bg-${color} flex flex-col h-64 border border-slate-200 rounded-xl p-4 text-white  ${
          nettoyage.infos.vitrerieSelected && vitrerieProposition.prixAnnuel
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
                  {nbPassagesVitrerieText}
                </ul>
              </div>
            </DialogContent>
          </Dialog>
          <div className="w-2/3 flex flex-col gap-1 h-full">
            <p className="font-bold text-sm">
              {nettoyage.infos.nomFournisseur}
            </p>
            {vitrerieProposition.prixAnnuel ? (
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
                      sloganFournisseur={vitrerieProposition.slogan}
                      logoUrl={vitrerieProposition.logoUrl}
                      nomFournisseur={vitrerieProposition.nomFournisseur}
                      locationUrl={vitrerieProposition.locationUrl}
                      anneeCreation={vitrerieProposition.anneeCreation}
                      ca={vitrerieProposition.ca}
                      effectif={vitrerieProposition.effectif}
                      nbClients={vitrerieProposition.nbClients}
                      noteGoogle={vitrerieProposition.noteGoogle}
                      nbAvis={vitrerieProposition.nbAvis}
                    />
                  </DialogContent>
                </Dialog>
                {vitrerieProposition.noteGoogle &&
                  vitrerieProposition.nbAvis && (
                    <div className="flex items-center gap-1 text-xs">
                      <p>{vitrerieProposition.noteGoogle}</p>
                      <StarRating
                        score={
                          vitrerieProposition.noteGoogle
                            ? parseFloat(vitrerieProposition.noteGoogle)
                            : 0
                        }
                      />
                      <p>({vitrerieProposition.nbAvis})</p>
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
          <ul className="flex flex-col ml-4 text-xs w-2/3">
            {infosProduit}
            {nbPassagesVitrerieText}
          </ul>
          <div className="flex flex-col gap-2 items-end w-1/3">
            {vitreriePrixMensuelText}
            {vitrerieProposition.prixAnnuel ? (
              <Switch
                className={`${
                  nettoyage.infos.vitrerieSelected
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={nettoyage.infos.vitrerieSelected}
                onCheckedChange={() =>
                  handleClickVitrerieProposition(vitrerieProposition)
                }
                title="Sélectionner cette proposition"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NettoyageMobileOptionsVitrerieCard;
