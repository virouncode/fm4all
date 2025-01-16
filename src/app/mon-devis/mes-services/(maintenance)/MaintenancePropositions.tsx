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
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectMaintenanceTarifsType } from "@/zod-schemas/maintenanceTarifs";
import Image from "next/image";
import { useContext } from "react";

type MaintenancePropositionsProps = {
  formattedPropositions: (SelectMaintenanceTarifsType & {
    freqAnnuelle: number;
    prixAnnuel: number;
  })[][];
};

const MaintenancePropositions = ({
  formattedPropositions,
}: MaintenancePropositionsProps) => {
  const { maintenance, setMaintenance } = useContext(MaintenanceContext);
  const { setTotalMaintenance } = useContext(TotalMaintenanceContext);

  const handleClickProposition = (
    fournisseurId: number,
    gamme: GammeType,
    nomEntreprise: string,
    prixAnnuel: number
  ) => {
    if (
      maintenance.fournisseurId === fournisseurId &&
      maintenance.gammeSelected === gamme
    ) {
      {
        setMaintenance((prev) => ({
          ...prev,
          fournisseurId: null,
          gammeSelected: null,
        }));
        setTotalMaintenance({
          nomFournisseur: null,
          prixMaintenance: null,
        });
        return;
      }
    }
    setMaintenance((prev) => ({
      ...prev,
      fournisseurId,
      gammeSelected: gamme,
    }));
    setTotalMaintenance({
      nomFournisseur: nomEntreprise,
      prixMaintenance: prixAnnuel,
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
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex w-1/4 items-center justify-center">
                      {getLogoFournisseurUrl(propositions[0].fournisseurId) ? (
                        <div className="w-full h-full relative">
                          <Image
                            src={
                              getLogoFournisseurUrl(
                                propositions[0].fournisseurId
                              ) as string
                            }
                            alt={`logo-de-${propositions[0].nomEntreprise}`}
                            fill={true}
                            className="w-full h-full object-contain"
                            quality={100}
                          />
                        </div>
                      ) : (
                        propositions[0].nomEntreprise
                      )}
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
                      maintenance.fournisseurId === proposition.fournisseurId &&
                      maintenance.gammeSelected === gamme
                        ? "ring-4 ring-inset ring-destructive"
                        : ""
                    }`}
                    key={proposition.id}
                    onClick={() =>
                      handleClickProposition(
                        proposition.fournisseurId,
                        proposition.gamme,
                        proposition.nomEntreprise,
                        proposition.prixAnnuel
                      )
                    }
                  >
                    <Checkbox
                      checked={
                        maintenance.fournisseurId ===
                          proposition.fournisseurId &&
                        maintenance.gammeSelected === gamme
                      }
                      onCheckedChange={() =>
                        handleClickProposition(
                          proposition.fournisseurId,
                          proposition.gamme,
                          proposition.nomEntreprise,
                          proposition.prixAnnuel
                        )
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
