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
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { Calculator } from "lucide-react";
import { useContext } from "react";
import TotalCafe from "./TotalCafe";
import TotalHygiene from "./TotalHygiene";
import TotalIncendie from "./TotalIncendie";
import TotalMaintenance from "./TotalMaintenance";
import TotalNettoyage from "./TotalNettoyage";
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
  const totalFinalMaintenance = totalMaintenance.totalService;
  const totalFinalIncendie = totalIncendie.totalService;
  //TODO voir pour les prix one shot d'installation
  const totalFinalCafe = totalCafe.totalMachines
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);

  const totalFinalThe = totalThe.totalService;
  const totalFinalSnacksFruits = totalSnacksFruits.total;

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
              totalFinalSnacksFruits
          )}{" "}
          € / an
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <span className="text-2xl">Total </span>{" "}
            <span className="text-sm font-normal">
              ({client.effectif} personnes, {client.surface} m<sup>2</sup>)
            </span>
          </SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6">
          <TotalNettoyage />
          <TotalHygiene />
          <TotalMaintenance />
          <TotalIncendie />
          <TotalCafe />
          <TotalThe />
          <TotalSnacksFruits />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Total;
