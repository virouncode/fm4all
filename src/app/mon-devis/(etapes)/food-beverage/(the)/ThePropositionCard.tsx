import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MARGE } from "@/constants/constants";
import { TheContext } from "@/context/TheProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { Info } from "lucide-react";
import { useContext } from "react";

type ThePropositionCardProps = {
  proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    effectif: number;
    prixUnitaire: number | null;
  };
  handleClickProposition: (proposition: {
    totalAnnuel: number | null;
    infos: string | null;
    id: number;
    nomFournisseur: string;
    slogan: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    createdAt: Date;
    fournisseurId: number;
    gamme: "essentiel" | "confort" | "excellence";
    effectif: number;
    prixUnitaire: number | null;
  }) => void;
  nbTassesParJour: number;
};

const ThePropositionCard = ({
  proposition,
  handleClickProposition,
  nbTassesParJour,
}: ThePropositionCardProps) => {
  const { the } = useContext(TheContext);
  const gamme = proposition.gamme;
  const color = getFm4AllColor(gamme);
  if (!proposition.totalAnnuel) {
    return (
      <div
        className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4`}
      >
        Non proposé
      </div>
    );
  }
  const totalMensuelText = `${formatNumber(
    Math.round((proposition.totalAnnuel * MARGE) / 12)
  )} € / mois*`;

  //Détails de l'offre

  const infosEssentiel = (
    <div className="flex flex-col gap-2">
      <p>The en sachet, un ou deux au choix</p>
      {proposition.infos && <p>{proposition.infos}</p>}
    </div>
  );
  const infosConfort = (
    <div className="flex flex-col gap-2">
      <p>Choix de plusieurs thés en sachets</p>
      {proposition.infos && <p>{proposition.infos}</p>}
    </div>
  );
  const infosExcellence = (
    <div className="flex flex-col gap-2">
      <p>Thés Premium en boite bois ou présentoir</p>
      {proposition.infos && <p>{proposition.infos}</p>}
    </div>
  );
  const infosTitle = (
    <p className={`text-${getFm4AllColor(proposition.gamme)} text-center`}>
      {proposition.gamme === "essentiel"
        ? "Essentiel"
        : proposition.gamme === "confort"
        ? "Confort"
        : "Excellence"}
    </p>
  );

  const infosProduit = (
    <div className="flex flex-col text-sm my-4">
      {gamme === "essentiel"
        ? infosEssentiel
        : gamme === "confort"
        ? infosConfort
        : infosExcellence}
    </div>
  );

  return (
    <div
      className={`flex flex-1 bg-${color} text-slate-200 items-center p-4 justify-center text-2xl gap-4 cursor-pointer ${
        the.infos.gammeSelected === proposition.gamme
          ? "ring-4 ring-inset ring-fm4alldestructive"
          : ""
      }`}
      onClick={() => handleClickProposition(proposition)}
    >
      {proposition.totalAnnuel ? (
        <Checkbox
          checked={the.infos.gammeSelected === proposition.gamme}
          onCheckedChange={() => handleClickProposition(proposition)}
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          aria-label="Sélectionner cette proposition"
        />
      ) : null}
      <div>
        <div className="flex gap-2 items-center">
          <p className="font-bold">{totalMensuelText}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-transparent hover:text-slate-200 hover:opacity-80"
                onClick={(e) => e.stopPropagation()}
              >
                <Info size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{infosTitle}</DialogTitle>
              </DialogHeader>
              {infosProduit}
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm">Consommables ~ {nbTassesParJour} tasses / j</p>
      </div>
    </div>
  );
};

export default ThePropositionCard;
