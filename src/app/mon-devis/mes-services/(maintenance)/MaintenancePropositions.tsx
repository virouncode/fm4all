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
import { gammes, GammeType } from "@/zod-schemas/gamme";
import Image from "next/image";
import { useContext } from "react";

type MaintenancePropositionsProps = {
  formattedPropositions: {
    id: number;
    gamme: GammeType;
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number;
    prixAnnuelService: number;
    prixAnnuelQ18: number;
    prixAnnuelLegio: number;
    prixAnnuelQualiteAir: number;
    total: number;
  }[][];
};

const MaintenancePropositions = ({
  formattedPropositions,
}: MaintenancePropositionsProps) => {
  const { maintenance, setMaintenance } = useContext(MaintenanceContext);
  const { setTotalMaintenance } = useContext(TotalMaintenanceContext);

  const handleClickProposition = (proposition: {
    id: number;
    gamme: GammeType;
    nomFournisseur: string;
    fournisseurId: number;
    sloganFournisseur: string | null;
    hParPassage: number;
    tauxHoraire: number;
    freqAnnuelle: number;
    prixAnnuelService: number;
    prixAnnuelQ18: number;
    prixAnnuelLegio: number;
    prixAnnuelQualiteAir: number;
    total: number;
  }) => {
    const {
      gamme,
      nomFournisseur,
      fournisseurId,
      sloganFournisseur,
      hParPassage,
      tauxHoraire,
      freqAnnuelle,
      prixAnnuelService,
      prixAnnuelQ18,
      prixAnnuelLegio,
      prixAnnuelQualiteAir,
    } = proposition;

    const totalQ18 = prixAnnuelQ18;
    const totalLegio = gammes.indexOf(gamme) > 0 ? prixAnnuelLegio : 0;
    const totalQualiteAir =
      gammes.indexOf(gamme) > 1 ? prixAnnuelQualiteAir : 0;

    if (
      maintenance.infos.fournisseurId === fournisseurId &&
      maintenance.infos.gammeSelected === gamme
    ) {
      {
        setMaintenance((prev) => ({
          ...prev,
          infos: {
            fournisseurId: null,
            nomFournisseur: null,
            sloganFournisseur: null,
            gammeSelected: null,
          },
          quantites: {
            freqAnnuelle: 0,
            hParPassage: 0,
          },
          prix: {
            tauxHoraire: 0,
            prixQ18: 0,
            prixLegio: 0,
            prixQualiteAir: 0,
          },
        }));
        setTotalMaintenance({
          totalService: 0,
          totalQ18: 0,
          totalLegio: 0,
          totalQualiteAir: 0,
        });
        return;
      }
    }
    setMaintenance({
      infos: {
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
        gammeSelected: gamme,
      },
      quantites: {
        freqAnnuelle,
        hParPassage,
      },
      prix: {
        tauxHoraire,
        prixQ18: prixAnnuelQ18,
        prixLegio: prixAnnuelLegio,
        prixQualiteAir: prixAnnuelQualiteAir,
      },
    });
    setTotalMaintenance({
      totalService: prixAnnuelService,
      totalQ18,
      totalLegio,
      totalQualiteAir,
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
                            alt={`logo-de-${propositions[0].nomFournisseur}`}
                            fill={true}
                            className="w-full h-full object-contain"
                            quality={100}
                          />
                        </div>
                      ) : (
                        propositions[0].nomFournisseur
                      )}
                    </div>
                  </TooltipTrigger>
                  {propositions[0].sloganFournisseur && (
                    <TooltipContent>
                      <p className="text-sm italic">
                        {propositions[0].sloganFournisseur}
                      </p>
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
                const totalText = proposition.total
                  ? `${formatNumber(proposition.total / 12)} € / mois`
                  : "Non proposé";

                return (
                  <div
                    className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                      maintenance.infos.fournisseurId ===
                        proposition.fournisseurId &&
                      maintenance.infos.gammeSelected === gamme
                        ? "ring-4 ring-inset ring-destructive"
                        : ""
                    }`}
                    key={proposition.id}
                    onClick={() => handleClickProposition(proposition)}
                  >
                    <Checkbox
                      checked={
                        maintenance.infos.fournisseurId ===
                          proposition.fournisseurId &&
                        maintenance.infos.gammeSelected === gamme
                      }
                      onCheckedChange={() =>
                        handleClickProposition(proposition)
                      }
                      className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                    />
                    <div>
                      <p className="font-bold">{totalText}</p>
                      <p className="text-sm">
                        {proposition.freqAnnuelle} passage(s) de{" "}
                        {proposition.hParPassage} h / an
                      </p>
                      {proposition.gamme === "essentiel" && (
                        <p className="text-sm">+ contrôle Q18</p>
                      )}
                      {proposition.gamme === "confort" && (
                        <>
                          <p className="text-sm">+ contrôle Q18</p>
                          <p className="text-sm">+ contrôle Legio</p>
                        </>
                      )}
                      {proposition.gamme === "excellence" && (
                        <>
                          <p className="text-sm">+ contrôle Q18</p>
                          <p className="text-sm">+ contrôle Legio</p>
                          <p className="text-sm">+ contrôle Qualité Air</p>
                        </>
                      )}
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
