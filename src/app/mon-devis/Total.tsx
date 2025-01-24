"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ClientContext } from "@/context/ClientProvider";
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
import { Calculator } from "lucide-react";
import { useContext, useEffect } from "react";
import TotalCafe from "./TotalCafe";
import TotalHygiene from "./TotalHygiene";
import TotalIncendie from "./TotalIncendie";
import TotalMaintenance from "./TotalMaintenance";
import TotalNettoyage from "./TotalNettoyage";
import TotalOfficeManager from "./TotalOfficeManager";
import TotalServicesFm4All from "./TotalServicesFm4All";
import TotalSnacksFruits from "./TotalSnacksFruits";
import TotalThe from "./TotalThe";

const Total = () => {
  const { client } = useContext(ClientContext);
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const { totalHygiene } = useContext(TotalHygieneContext);
  const { totalMaintenance } = useContext(TotalMaintenanceContext);
  const { totalIncendie } = useContext(TotalIncendieContext);
  const { totalCafe } = useContext(TotalCafeContext);
  const { totalThe } = useContext(TotalTheContext);
  const { totalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const { totalOfficeManager } = useContext(TotalOfficeManagerContext);
  const { totalServicesFm4All, setTotalServicesFm4All } = useContext(
    TotalServicesFm4AllContext
  );
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const { officeManager } = useContext(OfficeManagerContext);

  useEffect(() => {
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
    const total =
      totalFinalNettoyage +
      totalFinalHygiene +
      totalFinalMaintenance +
      totalFinalIncendie +
      totalFinalCafe +
      totalFinalThe +
      totalFinalSnacksFruits +
      totalFinalOfficeManager;

    const tauxAssurance = servicesFm4All.prix.tauxAssurance;
    const tauxPlateforme = servicesFm4All.prix.tauxPlateforme;
    const tauxSupportAdmin = servicesFm4All.prix.tauxSupportAdmin;
    const tauxSupportOp = servicesFm4All.prix.tauxSupportOp;
    const tauxAccountManager = servicesFm4All.prix.tauxAccountManager;
    const tauxRemiseCa = servicesFm4All.prix.tauxRemiseCa;
    const tauxRemiseHof = servicesFm4All.prix.tauxRemiseHof;
    const remiseCaSeuil = servicesFm4All.prix.remiseCaSeuil;

    const prixAssurance = (tauxAssurance ?? 0.0108) * total;
    const prixPlateforme = (tauxPlateforme ?? 0.01) * total;
    const prixSupportAdmin = (tauxSupportAdmin ?? 0) * total;
    const prixSupportOp = (tauxSupportOp ?? 0.0219) * total;
    const prixAccountManager = (tauxAccountManager ?? 0.0399) * total;
    const remiseCa =
      total > (remiseCaSeuil ?? 26000) ? total * (tauxRemiseCa ?? 0.005) : 0;
    const remiseHof = officeManager.infos.gammeSelected
      ? total * (tauxRemiseHof ?? 0.005)
      : 0;
    setTotalServicesFm4All({
      totalAssurance: prixAssurance,
      totalPlateforme: prixPlateforme,
      totalSupportAdmin: prixSupportAdmin,
      totalSupportOp: prixSupportOp,
      totalAccountManager: prixAccountManager,
      totalRemiseCa: remiseCa,
      totalRemiseHof: remiseHof,
    });
  }, [
    officeManager.infos.gammeSelected,
    servicesFm4All.prix.remiseCaSeuil,
    servicesFm4All.prix.tauxAccountManager,
    servicesFm4All.prix.tauxAssurance,
    servicesFm4All.prix.tauxPlateforme,
    servicesFm4All.prix.tauxRemiseCa,
    servicesFm4All.prix.tauxRemiseHof,
    servicesFm4All.prix.tauxSupportAdmin,
    servicesFm4All.prix.tauxSupportOp,
    setTotalServicesFm4All,
    totalCafe.totalMachines,
    totalHygiene.totalBalai,
    totalHygiene.totalDesinfectant,
    totalHygiene.totalParfum,
    totalHygiene.totalPoubelle,
    totalHygiene.totalTrilogie,
    totalIncendie.totalService,
    totalMaintenance.totalLegio,
    totalMaintenance.totalQ18,
    totalMaintenance.totalQualiteAir,
    totalMaintenance.totalService,
    totalNettoyage.totalDimanche,
    totalNettoyage.totalRepasse,
    totalNettoyage.totalSamedi,
    totalNettoyage.totalService,
    totalNettoyage.totalVitrerie,
    totalOfficeManager.totalService,
    totalSnacksFruits.total,
    totalThe.totalService,
  ]);

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
  const totalFinalServicesFm4All =
    totalServicesFm4All.totalAssurance +
    totalServicesFm4All.totalPlateforme +
    totalServicesFm4All.totalSupportAdmin +
    totalServicesFm4All.totalSupportOp +
    totalServicesFm4All.totalAccountManager -
    totalServicesFm4All.totalRemiseCa -
    totalServicesFm4All.totalRemiseHof;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="text-base absolute top-20 right-10"
        >
          <Calculator />
          {Math.round(
            totalFinalNettoyage +
              totalFinalHygiene +
              totalFinalMaintenance +
              totalFinalIncendie +
              totalFinalCafe +
              totalFinalThe +
              totalFinalSnacksFruits +
              totalFinalOfficeManager +
              totalFinalServicesFm4All
          )}{" "}
          € / an
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            <span className="text-2xl">Total </span>{" "}
            <span className="text-sm font-normal">
              ({client.effectif} personnes, {client.surface} m<sup>2</sup>)
            </span>
          </SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 overflow-scroll flex-1">
          <TotalNettoyage />
          <TotalHygiene />
          <TotalMaintenance />
          <TotalIncendie />
          <TotalCafe />
          <TotalThe />
          <TotalSnacksFruits />
          <TotalOfficeManager />
          <TotalServicesFm4All />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Total;
