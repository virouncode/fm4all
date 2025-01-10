import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

type MaintenancePropositionsProps = {
  formattedPropositions: {
    id: number;
    surface: number;
    gamme: "essentiel" | "confort" | "excellence";
    createdAt: Date;
    nomEntreprise: string;
    slogan: string | null;
    fournisseurId: number;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
    freqAnnuelle: number;
  }[][];
  propositions: {
    freqAnnuelle: number;
    prixAnnuel: number;
    id: number;
    nomEntreprise: string;
    slogan: string | null;
    createdAt: Date;
    fournisseurId: number;
    surface: number;
    hParPassage: number;
    tauxHoraire: number;
    gamme: "essentiel" | "confort" | "excellence";
  }[];
};

const MaintenancePropositions = ({
  formattedPropositions,
  propositions,
}: MaintenancePropositionsProps) => {
  const { maintenance, setMaintenance } = useContext(MaintenanceContext);
  const { setTotalMaintenance } = useContext(TotalMaintenanceContext);

  const handleClickProposition = (propositionId: number) => {
    if (maintenance.propositionId === propositionId) {
      setMaintenance((prev) => ({
        ...prev,
        propositionId: null,
      }));
      setTotalMaintenance({
        nomFournisseur: "",
        prixMaintenance: null,
      });
      return;
    }
    setMaintenance((prev) => ({
      ...prev,
      propositionId,
    }));
    setTotalMaintenance({
      nomFournisseur: propositions.find(
        (proposition) => proposition.id === propositionId
      )?.nomEntreprise as string,
      prixMaintenance: propositions.find(
        (proposition) => proposition.id === propositionId
      )?.prixAnnuel as number,
    });
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {formattedPropositions.length > 0
        ? formattedPropositions.map((propositions) => (
            <div
              className="flex border-b flex-1"
              key={propositions[0].fournisseurId}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex w-1/4 items-center justify-center">
                      {propositions[0].nomEntreprise}
                    </div>
                  </TooltipTrigger>
                  {propositions[0].slogan && (
                    <TooltipContent>
                      <p className="text-sm italic">{propositions[0].slogan}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {propositions.map((proposition) => {
                const gamme = proposition.gamme;
                const color =
                  gamme === "essentiel"
                    ? "fm4allessential"
                    : gamme === "confort"
                    ? "fm4allcomfort"
                    : "fm4allexcellence";
                const prixAnnuel = proposition.prixAnnuel
                  ? `${formatNumber(proposition.prixAnnuel)} € /an`
                  : "Non proposé";

                return (
                  <div
                    className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                      maintenance.propositionId === proposition.id
                        ? "ring-2 ring-inset ring-destructive"
                        : ""
                    }`}
                    key={proposition.id}
                    onClick={() => handleClickProposition(proposition.id)}
                  >
                    <Checkbox
                      checked={maintenance.propositionId === proposition.id}
                      onCheckedChange={() =>
                        handleClickProposition(proposition.id)
                      }
                      className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    />
                    <div>
                      <p className="font-bold">{prixAnnuel}</p>
                      <p className="text-xs">
                        {proposition.freqAnnuelle} passage(s) de{" "}
                        {proposition.hParPassage} h / an
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        : null}
    </div>
  );
};

export default MaintenancePropositions;
