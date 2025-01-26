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
import { useUpddateServicesFm4AllTotal } from "@/hooks/use-upddate-services-fm4All-total";
import { formatNumber } from "@/lib/formatNumber";
import { Calculator } from "lucide-react";
import { useContext } from "react";
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
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const { totalHygiene } = useContext(TotalHygieneContext);
  const { totalMaintenance } = useContext(TotalMaintenanceContext);
  const { totalIncendie } = useContext(TotalIncendieContext);
  const { totalCafe } = useContext(TotalCafeContext);
  const { totalThe } = useContext(TotalTheContext);
  const { totalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const { totalOfficeManager } = useContext(TotalOfficeManagerContext);
  const { totalServicesFm4All } = useContext(TotalServicesFm4AllContext);
  useUpddateServicesFm4AllTotal();

  const totalFinalNettoyage = Object.values(totalNettoyage)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  const totalFinalHygiene = Object.values(totalHygiene)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  const totalFinalMaintenance = Object.values(totalMaintenance)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  const totalFinalIncendie = totalIncendie.totalService ?? 0;
  //TODO voir pour les prix one shot d'installation
  const totalFinalCafe = totalCafe.totalMachines
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);

  const totalFinalThe = totalThe.totalService ?? 0;
  const totalFinalSnacksFruits = totalSnacksFruits.total ?? 0;
  const totalFinalOfficeManager = totalOfficeManager.totalService ?? 0;
  const totalFinalServicesFm4All =
    servicesFm4All.infos.gammeSelected === "essentiel"
      ? (totalServicesFm4All.totalAssurance ?? 0) +
        (totalServicesFm4All.totalPlateforme ?? 0) +
        (totalServicesFm4All.totalSupportAdmin ?? 0) -
        (totalServicesFm4All.totalRemiseCa ?? 0) -
        (totalServicesFm4All.totalRemiseHof ?? 0)
      : servicesFm4All.infos.gammeSelected === "confort"
      ? (totalServicesFm4All.totalAssurance ?? 0) +
        (totalServicesFm4All.totalPlateforme ?? 0) +
        (totalServicesFm4All.totalSupportAdmin ?? 0) +
        (totalServicesFm4All.totalSupportOp ?? 0) -
        (totalServicesFm4All.totalRemiseCa ?? 0) -
        (totalServicesFm4All.totalRemiseHof ?? 0)
      : (totalServicesFm4All.totalAssurance ?? 0) +
        (totalServicesFm4All.totalPlateforme ?? 0) +
        (totalServicesFm4All.totalSupportAdmin ?? 0) +
        (totalServicesFm4All.totalSupportOp ?? 0) +
        (totalServicesFm4All.totalAccountManager ?? 0) -
        (totalServicesFm4All.totalRemiseCa ?? 0) -
        (totalServicesFm4All.totalRemiseHof ?? 0);
  const total = Math.round(
    totalFinalNettoyage +
      totalFinalHygiene +
      totalFinalMaintenance +
      totalFinalIncendie +
      totalFinalCafe +
      totalFinalThe +
      totalFinalSnacksFruits +
      totalFinalOfficeManager +
      totalFinalServicesFm4All
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="text-base absolute top-20 right-10"
        >
          <Calculator />
          {total} € HT/an
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            <span className="text-2xl">Total: {total} € HT/an</span>{" "}
          </SheetTitle>
          <SheetDescription>
            Soit {formatNumber(total / 12)} € HT/mois pour {client.effectif}{" "}
            personnes, {client.surface} m<sup>2</sup>
          </SheetDescription>
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
