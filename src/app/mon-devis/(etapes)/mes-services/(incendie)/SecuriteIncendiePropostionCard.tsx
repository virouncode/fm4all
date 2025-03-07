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
import { Info } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

type SecuriteIncendiePropostionCardProps = {
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

const SecuriteIncendiePropostionCard = ({
  proposition,
  handleClickProposition,
}: SecuriteIncendiePropostionCardProps) => {
  const { incendie } = useContext(IncendieContext);
  const totalMensuelText = (
    <p className="font-bold text-xl ml-4">
      {formatNumber(
        Math.round(
          ((proposition.totalAnnuelTrilogie +
            proposition.fraisDeplacementTrilogie) *
            MARGE) /
            12
        )
      )}{" "}
      €/mois
    </p>
  );
  const infosProduit = (
    <ul className="flex flex-col text-sm px-4">
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
    </ul>
  );

  const infosText = (
    <p className="text-sm">
      Pour la sécurité de tous : vérification annuelle obligatoire (norme
      <strong> NF S61-919</strong>), conseils sur l’implantation, remplacement
      ou rechargement si nécessaire au BPU.
    </p>
  );

  const dialogTitle = <p className="text-center">Sécurité incendie</p>;

  return (
    <div
      className={`w-3/4 flex items-center justify-center text-xl gap-4 p-4 cursor-pointer bg-slate-100 ${
        incendie.infos.fournisseurId === proposition.fournisseurId
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Switch
        checked={incendie.infos.fournisseurId === proposition.fournisseurId}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:bg-fm4alldestructive"
        title="Sélectionner cette proposition"
      />
      <div>
        <div className="flex gap-2 items-center">
          {totalMensuelText}
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
              <div className="flex flex-col gap-4 items-center">
                {infosText}
                <div className="w-full h-60 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
                  <Image
                    src={"/img/services/incendie.webp"}
                    alt={`illustration de securité incendie`}
                    fill={true}
                    className="object-contain object-center cursor-pointer"
                    quality={100}
                  />
                </div>
                {infosProduitDialog}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {infosProduit}
      </div>
    </div>
  );
};

export default SecuriteIncendiePropostionCard;
