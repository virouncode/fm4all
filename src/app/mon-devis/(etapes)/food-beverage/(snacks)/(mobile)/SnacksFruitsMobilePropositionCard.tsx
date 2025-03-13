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
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import Image from "next/image";
import { useContext } from "react";

type SnacksFruitsMobilePropositionCardProps = {
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
    isSameFournisseur: boolean;
    gamme: "essentiel" | "confort" | "excellence";
    fruitsKgParSemaine: number | null;
    snacksPortionsParSemaine: number | null;
    boissonsConsosParSemaine: number | null;
    gFruitsParSemaineParPersonne: number | null;
    portionsSnacksParSemaineParPersonne: number | null;
    consosBoissonsParSemaineParPersonne: number | null;
    prixKgFruits: number | null;
    prixUnitaireSnacks: number | null;
    prixUnitaireBoissons: number | null;
    prixUnitaireLivraisonSiCafe: number | null;
    prixUnitaireLivraison: number | null;
    seuilFranco: number;
    fraisLivraisonPanier: number | null;
    panierMin: number | null;
    total: number | null;
    totalFruits: number;
    totalSnacks: number;
    totalBoissons: number;
    totalLivraison: number | null;
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
    isSameFournisseur: boolean;
    gamme: "essentiel" | "confort" | "excellence";
    fruitsKgParSemaine: number | null;
    snacksPortionsParSemaine: number | null;
    boissonsConsosParSemaine: number | null;
    gFruitsParSemaineParPersonne: number | null;
    portionsSnacksParSemaineParPersonne: number | null;
    consosBoissonsParSemaineParPersonne: number | null;
    prixKgFruits: number | null;
    prixUnitaireSnacks: number | null;
    prixUnitaireBoissons: number | null;
    prixUnitaireLivraisonSiCafe: number | null;
    prixUnitaireLivraison: number | null;
    seuilFranco: number;
    fraisLivraisonPanier: number | null;
    panierMin: number | null;
    total: number | null;
    totalFruits: number;
    totalSnacks: number;
    totalBoissons: number;
    totalLivraison: number | null;
  }) => void;
};

const SnacksFruitsMobilePropositionCard = ({
  proposition,
  handleClickProposition,
}: SnacksFruitsMobilePropositionCardProps) => {
  const { snacksFruits } = useContext(SnacksFruitsContext);
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
    total,
    totalFruits,
    totalSnacks,
    totalBoissons,
    totalLivraison,
  } = proposition;

  const color = getFm4AllColor(gamme);
  const totalMensuelText =
    snacksFruits.infos.choix.includes("fruits") && !proposition.prixKgFruits ? (
      <p className="text-sm font-bold">Non proposé</p>
    ) : snacksFruits.infos.choix.includes("snacks") &&
      !proposition.prixUnitaireSnacks ? (
      <p className="text-sm font-bold">Non proposé</p>
    ) : snacksFruits.infos.choix.includes("boissons") &&
      !proposition.prixUnitaireBoissons ? (
      <p className="text-sm font-bold">Non proposé</p>
    ) : total ? (
      <p className="text-sm font-bold">
        {formatNumber(Math.round((total * MARGE) / 12))} €/mois
      </p>
    ) : (
      <p className="text-sm font-bold">
        Panier minimum hebdomadaire non atteint
      </p>
    );
  const gFruitsParSemaineParPersonneText = snacksFruits.infos.choix.includes(
    "fruits"
  ) ? (
    <li className="list-check">
      {proposition.gFruitsParSemaineParPersonne} g / personne / semaine
    </li>
  ) : null;

  const portionsSnacksParSemaineParPersonneText =
    snacksFruits.infos.choix.includes("snacks") ? (
      <li className="list-check">
        {proposition.portionsSnacksParSemaineParPersonne} portion(s) / personne
        / semaine
      </li>
    ) : null;

  const consosBoissonsParSemaineParPersonneText =
    snacksFruits.infos.choix.includes("boissons") ? (
      <li className="list-check">
        {proposition.consosBoissonsParSemaineParPersonne} boisson(s) / personne
        / semaine
      </li>
    ) : null;

  const dialogTitle = (
    <p className={`text-${color} text-center`}>
      {proposition.gamme === "essentiel"
        ? "Essentiel"
        : proposition.gamme === "confort"
        ? "Confort"
        : "Excellence"}
    </p>
  );

  const infosProduit = (
    <ul className="flex flex-col text-xs px-4 w-2/3">
      {gFruitsParSemaineParPersonneText}
      {portionsSnacksParSemaineParPersonneText}
      {consosBoissonsParSemaineParPersonneText}
    </ul>
  );

  const infosProduitDialog = (
    <ul className="flex flex-col text-sm px-4 mx-auto">
      {gFruitsParSemaineParPersonneText}
      {portionsSnacksParSemaineParPersonneText}
      {consosBoissonsParSemaineParPersonneText}
    </ul>
  );

  const imgProduit = (
    <div className="w-1/3 h-full relative rounded-xl overflow-hidden bg-slate-100">
      <Image
        src={"/img/services/snacks-fruits.webp"}
        alt={`illustration de nettoyage`}
        fill={true}
        className="object-contain cursor-pointer"
        quality={100}
      />
    </div>
  );

  const imgProduitDialog = (
    <div className="flex items-center justify-between gap-2">
      <div className="w-full h-40 relative mx-auto rounded-lg border-slate-300 border bg-slate-100 overflow-hidden">
        <Image
          src="/img/services/fruits.webp"
          alt="illustration-corbeille-fruits"
          fill
          quality={100}
          className="object-cover"
        />
      </div>
      <div className="w-full h-40 relative mx-auto rounded-lg border-slate-300 border bg-slate-100 overflow-hidden">
        <Image
          src="/img/services/snacks.webp"
          alt="illustration-snacks"
          fill
          quality={100}
          className="object-cover"
        />
      </div>
      <div className="w-full h-40 relative mx-auto rounded-lg border-slate-300 border bg-slate-100 overflow-hidden">
        <Image
          src="/img/services/boissons.webp"
          alt="illustration-boissons"
          fill
          quality={100}
          className="object-cover"
        />
      </div>
    </div>
  );

  return (
    <CarouselItem>
      <div
        className={`bg-${color} flex flex-col h-56 border border-slate-200 rounded-xl p-4 text-white  ${
          snacksFruits.infos.fournisseurId === fournisseurId &&
          snacksFruits.infos.gammeSelected === gamme
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
              <div className="flex flex-col gap-4">
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
          onClick={
            total ? () => handleClickProposition(proposition) : undefined
          }
        >
          {infosProduit}
          <div className="flex flex-col gap-2 items-end w-1/3">
            {totalMensuelText}
            {total ? (
              <Switch
                className={`${
                  snacksFruits.infos.fournisseurId === fournisseurId &&
                  snacksFruits.infos.gammeSelected === gamme
                    ? "data-[state=checked]:bg-fm4alldestructive"
                    : ""
                }`}
                checked={
                  snacksFruits.infos.fournisseurId === fournisseurId &&
                  snacksFruits.infos.gammeSelected === gamme
                }
                onCheckedChange={() => handleClickProposition(proposition)}
                onClick={(e) => e.stopPropagation()}
                title="Sélectionnez cette proposition"
              />
            ) : null}
          </div>
        </div>
      </div>
    </CarouselItem>
  );
};

export default SnacksFruitsMobilePropositionCard;
