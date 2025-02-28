import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MARGE } from "@/constants/constants";
import { IncendieContext } from "@/context/IncendieProvider";
import { formatNumber } from "@/lib/formatNumber";
import { Info } from "lucide-react";
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
  const totalMensuelText =
    formatNumber(
      Math.round(
        ((proposition.totalAnnuelTrilogie +
          proposition.fraisDeplacementTrilogie) *
          MARGE) /
          12
      )
    ) + " € / mois";
  const infosText = (
    <p className="text-sm">
      Pour la sécurité de tous : vérification annuelle obligatoire (NF S61-919),
      conseils sur l’implantation, remplacement ou rechargement si nécessaire au
      BPU.
    </p>
  );

  return (
    <div
      className={`w-3/4 flex items-center justify-center text-xl gap-4 p-4 cursor-pointer bg-slate-100 ${
        incendie.infos.fournisseurId === proposition.fournisseurId
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      <Checkbox
        checked={incendie.infos.fournisseurId === proposition.fournisseurId}
        onCheckedChange={() => handleClickProposition(proposition)}
        className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
      />
      <div>
        <div className="flex gap-2">
          <p className="font-bold">{totalMensuelText}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Info size={16} onClick={(e) => e.stopPropagation()} />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle></DialogTitle>
              </DialogHeader>
              {infosText}
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm">1 passage par an</p>
        <p>Contrôle obligatoire de :</p>
        <p className="text-sm">{proposition.nbExtincteurs} extincteurs</p>
        <p className="text-sm"> {proposition.nbBaes} BAES</p>
        <p className="text-sm">{proposition.nbTelBaes} télécommandes BAES</p>
      </div>
    </div>
  );
};

export default SecuriteIncendiePropostionCard;
