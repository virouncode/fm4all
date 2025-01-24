import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { TotalOfficeManagerContext } from "@/context/TotalOfficeManagerProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { GammeType } from "@/zod-schemas/gamme";
import { SelectServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4AllOffresType";
import { SelectServicesFm4AllTauxType } from "@/zod-schemas/servicesFm4AllTaux";
import Image from "next/image";
import { useContext } from "react";

type ServicesFm4AllPropositionsProps = {
  servicesFm4AllTaux: SelectServicesFm4AllTauxType[];
  servicesFm4AllOffres: SelectServicesFm4AllOffresType[];
};

const ServicesFm4AllPropositions = ({
  servicesFm4AllTaux,
  servicesFm4AllOffres,
}: ServicesFm4AllPropositionsProps) => {
  const { servicesFm4All, setServicesFm4All } = useContext(
    ServicesFm4AllContext
  );
  const { setTotalServicesFm4All } = useContext(TotalServicesFm4AllContext);
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const { totalHygiene } = useContext(TotalHygieneContext);
  const { totalMaintenance } = useContext(TotalMaintenanceContext);
  const { totalIncendie } = useContext(TotalIncendieContext);
  const { totalCafe } = useContext(TotalCafeContext);
  const { totalThe } = useContext(TotalTheContext);
  const { totalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const { totalOfficeManager } = useContext(TotalOfficeManagerContext);
  const { officeManager } = useContext(OfficeManagerContext);
  const {
    assurance: tauxAssurance,
    plateforme: tauxPlateforme,
    minFacturationPlateforme,
    supportAdmin: tauxSupportAdmin,
    supportOp: tauxSupportOp,
    minFacturationSupportOp,
    accountManager: tauxAccountManager,
    minFacturationAccountManager,
    remiseCaSeuil,
    remiseCa: tauxRemiseCa,
    remiseHof: tauxRemiseHof,
  } = servicesFm4AllTaux[0];

  const totalFinalNettoyage =
    totalNettoyage.totalService +
    totalNettoyage.totalRepasse +
    totalNettoyage.totalSamedi +
    totalNettoyage.totalDimanche +
    totalNettoyage.totalVitrerie;
  const totalFinalHygiene =
    totalHygiene.totalTrilogie +
    totalHygiene.totalDesinfectant +
    totalHygiene.totalParfum +
    totalHygiene.totalBalai +
    totalHygiene.totalPoubelle;
  const totalFinalMaintenance =
    totalMaintenance.totalService +
    totalMaintenance.totalQ18 +
    totalMaintenance.totalLegio +
    totalMaintenance.totalQualiteAir;
  const totalFinalIncendie = totalIncendie.totalService;
  //TODO voir pour les prix one shot d'installation
  const totalFinalCafe = totalCafe.totalMachines
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);

  const totalFinalThe = totalThe.totalService;
  const totalFinalSnacksFruits = totalSnacksFruits.total;
  const totalFinalOfficeManager = totalOfficeManager.totalService;

  const total = Math.round(
    totalFinalNettoyage +
      totalFinalHygiene +
      totalFinalMaintenance +
      totalFinalIncendie +
      totalFinalCafe +
      totalFinalThe +
      totalFinalSnacksFruits +
      totalFinalOfficeManager
  );

  const formattedPropositions = servicesFm4AllOffres.map((offre) => {
    const {
      id,
      assurance,
      plateforme,
      supportAdmin,
      supportOp,
      accountManager,
      gamme,
    } = offre;
    const prixAssurance =
      assurance === "non propose"
        ? null
        : assurance === "inclus"
        ? 0
        : tauxAssurance * total;
    const prixPlateforme =
      plateforme === "non propose"
        ? null
        : plateforme === "inclus"
        ? 0
        : tauxPlateforme * total >= minFacturationPlateforme
        ? tauxPlateforme * total
        : minFacturationPlateforme;
    const prixSupportAdmin =
      supportAdmin === "non propose"
        ? null
        : supportAdmin === "inclus"
        ? 0
        : tauxSupportAdmin * total;
    const prixSupportOp =
      supportOp === "non propose"
        ? null
        : supportOp === "inclus"
        ? 0
        : tauxSupportOp * total >= minFacturationSupportOp
        ? tauxSupportOp * total
        : minFacturationSupportOp;
    const prixAccountManager =
      accountManager === "non propose"
        ? null
        : accountManager === "inclus"
        ? 0
        : tauxAccountManager * total >= minFacturationAccountManager
        ? tauxAccountManager * total
        : minFacturationAccountManager;
    const remiseCa = total >= remiseCaSeuil ? tauxRemiseCa * total : 0;
    const remiseHof = officeManager.infos.gammeSelected
      ? tauxRemiseHof * total
      : 0;
    const prixTotalAnnuel = Math.round(
      (prixAssurance ?? 0) +
        (prixPlateforme ?? 0) +
        (prixSupportAdmin ?? 0) +
        (prixSupportOp ?? 0) +
        (prixAccountManager ?? 0) -
        remiseCa -
        remiseHof
    );
    const prixTotalAnnuelSansRemise = Math.round(
      (prixAssurance ?? 0) +
        (prixPlateforme ?? 0) +
        (prixSupportAdmin ?? 0) +
        (prixSupportOp ?? 0) +
        (prixAccountManager ?? 0)
    );
    return {
      id,
      gamme,
      tauxAssurance,
      tauxPlateforme,
      tauxSupportAdmin,
      tauxSupportOp,
      tauxAccountManager,
      tauxRemiseCa,
      tauxRemiseHof,
      prixAssurance,
      prixPlateforme,
      prixSupportAdmin,
      prixSupportOp,
      prixAccountManager,
      remiseCaSeuil,
      remiseCa,
      remiseHof,
      prixTotalAnnuel,
      prixTotalAnnuelSansRemise,
    };
  });

  const handleClickProposition = (proposition: {
    id: number;
    gamme: GammeType;
    tauxAssurance: number;
    tauxPlateforme: number;
    tauxSupportAdmin: number;
    tauxSupportOp: number;
    tauxAccountManager: number;
    tauxRemiseCa: number;
    tauxRemiseHof: number;
    prixAssurance: number | null;
    prixPlateforme: number | null;
    prixSupportAdmin: number | null;
    prixSupportOp: number | null;
    prixAccountManager: number | null;
    remiseCaSeuil: number;
    remiseCa: number;
    remiseHof: number;
    prixTotalAnnuel: number;
  }) => {
    const {
      gamme,
      tauxAssurance,
      tauxPlateforme,
      tauxSupportAdmin,
      tauxSupportOp,
      tauxAccountManager,
      tauxRemiseCa,
      tauxRemiseHof,
      prixAssurance,
      prixPlateforme,
      prixSupportAdmin,
      prixSupportOp,
      prixAccountManager,
      remiseCaSeuil,
      remiseCa,
      remiseHof,
    } = proposition;
    if (servicesFm4All.infos.gammeSelected === gamme) return;

    setServicesFm4All((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        gammeSelected: gamme,
      },
      prix: {
        tauxAssurance,
        tauxPlateforme,
        tauxSupportAdmin,
        tauxSupportOp,
        tauxAccountManager,
        remiseCaSeuil,
        tauxRemiseCa,
        tauxRemiseHof,
      },
    }));
    setTotalServicesFm4All({
      totalAssurance: prixAssurance ?? 0,
      totalPlateforme: prixPlateforme ?? 0,
      totalSupportAdmin: prixSupportAdmin ?? 0,
      totalSupportOp: prixSupportOp ?? 0,
      totalAccountManager: prixAccountManager ?? 0,
      totalRemiseCa: remiseCa,
      totalRemiseHof: remiseHof,
    });
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      <div className="flex border-b flex-1">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex w-1/4 items-center justify-center p-4">
                {getLogoFournisseurUrl(15) ? (
                  <div className="w-full h-full relative">
                    <Image
                      src={getLogoFournisseurUrl(15) as string}
                      alt={`logo-de-fm4All`}
                      fill={true}
                      className="w-full h-full object-contain"
                      quality={100}
                    />
                  </div>
                ) : (
                  "FM4ALL"
                )}
              </div>
            </TooltipTrigger>

            <TooltipContent>
              <p className="text-sm italic">Le Facility Management pour tous</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {formattedPropositions.map((proposition) => {
          const gamme = proposition.gamme;
          const color =
            gamme === "essentiel"
              ? "fm4allessential"
              : gamme === "confort"
              ? "fm4allcomfort"
              : "fm4allexcellence";
          const prixTotalAnnuelSansRemiseText = `${Math.round(
            proposition.prixTotalAnnuelSansRemise / 12
          )} € / mois`;
          const prixTotalAnnuelText = `${Math.round(
            proposition.prixTotalAnnuel / 12
          )} € / mois${proposition.remiseCa ? "\u00B9" : ""}${
            proposition.remiseHof ? "\u00B2" : ""
          }`;
          return (
            <div
              className={`flex flex-1 bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer ${
                servicesFm4All.infos.gammeSelected === gamme
                  ? "ring-4 ring-inset ring-destructive"
                  : ""
              }`}
              key={proposition.id}
              onClick={() => handleClickProposition(proposition)}
            >
              <Checkbox
                checked={servicesFm4All.infos.gammeSelected === gamme}
                onCheckedChange={() => handleClickProposition(proposition)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                {proposition.prixTotalAnnuelSansRemise !==
                  proposition.prixTotalAnnuel && (
                  <p className="font-bold line-through">
                    {prixTotalAnnuelSansRemiseText}
                  </p>
                )}
                <p className="font-bold">{prixTotalAnnuelText}</p>
                <p className="text-sm">Assurance</p>
                <p className="text-sm">Plateforme fm4All</p>
                <p className="text-sm">Support administratif</p>
                {gamme !== "essentiel" && (
                  <p className="text-sm">Support opérationnel</p>
                )}
                {gamme === "excellence" && (
                  <p className="text-sm">Account Manager dédié</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesFm4AllPropositions;
