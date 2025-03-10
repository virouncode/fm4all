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
import { MARGE } from "@/constants/constants";
import { IncendieContext } from "@/context/IncendieProvider";
import { formatNumber } from "@/lib/formatNumber";

import Image from "next/image";
import { useContext } from "react";

type SecuriteIncendieMobileCardProps = {
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
    nbExtincteurs: number;
    nbBaes: number;
    nbTelBaes: number;
    prixParExtincteur: number;
    prixParBaes: number;
    prixParTelBaes: number;
    totalAnnuelTrilogie: number;
    fraisDeplacementTrilogie: number;
  };
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
    nbExtincteurs: number;
    nbBaes: number;
    nbTelBaes: number;
    prixParExtincteur: number;
    prixParBaes: number;
    prixParTelBaes: number;
    totalAnnuelTrilogie: number;
    fraisDeplacementTrilogie: number;
  }) => void;
};

const SecuriteIncendieMobileCard = ({
  proposition,
  handleClickProposition,
}: SecuriteIncendieMobileCardProps) => {
  const { incendie } = useContext(IncendieContext);
  const {
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
    totalAnnuelTrilogie,
    fraisDeplacementTrilogie,
  } = proposition;

  const totalMensuelText = totalAnnuelTrilogie ? (
    <p className="text-sm font-bold">
      {formatNumber(
        Math.round(
          ((totalAnnuelTrilogie + fraisDeplacementTrilogie) * MARGE) / 12
        )
      )}{" "}
      €/mois
    </p>
  ) : (
    <p className="text-sm font-bold">Non proposé</p>
  );

  const infosTitle = <p className="text-center">Sécurité incendie</p>;

  const imgProduit = (
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-200">
      <Image
        src={"/img/services/incendie.webp"}
        alt={`illustration de sécurité incendie`}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="w-full h-64 relative mx-auto rounded-lg border-slate-300 border bg-slate-100">
      <Image
        src={"/img/services/incendie.webp"}
        alt={`illustration de sécurité incendie`}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 w-3/4">
      <li className="list-check">
        1 passage/an pour le contrôle obligatoire de :
        <ul className="ml-4">
          <li className="list-disc">
            {proposition.nbExtincteurs} extincteur(s)
          </li>
          <li className="list-disc">{proposition.nbBaes} BAES</li>
          <li className="list-disc">
            {proposition.nbTelBaes} télécommande(s) BAES
          </li>
        </ul>
      </li>
      <li className="list-check">
        Pour la sécurité de tous : vérification annuelle obligatoire (norme
        <strong> NF S61-919</strong>), conseils sur l’implantation, remplacement
        ou rechargement si nécessaire au BPU.
      </li>
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4">
      <li className="list-check">
        1 passage par an pour le contrôle obligatoire de :
        <ul className="ml-4">
          <li className="list-disc">
            {proposition.nbExtincteurs} extincteur(s)
          </li>
          <li className="list-disc">{proposition.nbBaes} BAES</li>
          <li className="list-disc">
            {proposition.nbTelBaes} télécommande(s) BAES
          </li>
        </ul>
      </li>
      <li className="list-check">
        Pour la sécurité de tous : vérification annuelle obligatoire (norme
        <strong> NF S61-919</strong>), conseils sur l’implantation, remplacement
        ou rechargement si nécessaire au BPU.
      </li>
    </ul>
  );

  return (
    <div
      className={`bg-slate-100 flex flex-col h-80 border border-slate-200 rounded-xl p-4 ${
        incendie.infos.fournisseurId === proposition.fournisseurId
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
    >
      <div className="flex items-center h-1/3 gap-2 border-b pb-2 border-slate-200">
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
      <div className="flex h-2/3 pt-2 justify-between">
        {infosProduit}
        <div className="flex flex-col gap-2 items-end">
          {totalMensuelText}
          {totalAnnuelTrilogie ? (
            <Switch
              className={`${
                incendie.infos.fournisseurId === fournisseurId
                  ? "data-[state=checked]:bg-fm4alldestructive"
                  : ""
              }`}
              checked={incendie.infos.fournisseurId === fournisseurId}
              onCheckedChange={() => handleClickProposition(proposition)}
              title="Sélectionnez cette proposition"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SecuriteIncendieMobileCard;
