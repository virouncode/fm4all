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
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { useContext } from "react";
import TotalHygiene from "./TotalHygiene";
import TotalIncendie from "./TotalIncendie";
import TotalNettoyage from "./TotalNettoyage";
import TotalMaintenance from "./TotalMaintenance";

const Total = () => {
  const { client } = useContext(ClientContext);
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const { totalHygiene } = useContext(TotalHygieneContext);
  const { totalMaintenance } = useContext(TotalMaintenanceContext);
  const { totalIncendie } = useContext(TotalIncendieContext);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="text-base absolute top-20 right-10"
        >
          {Math.round(
            (totalNettoyage.prixService ?? 0) +
              (totalNettoyage.prixRepasse ?? 0) +
              (totalNettoyage.prixSamedi ?? 0) +
              (totalNettoyage.prixDimanche ?? 0) +
              (totalNettoyage.prixVitrerie ?? 0) +
              (totalHygiene.prixTrilogieAbonnement ?? 0) +
              (totalHygiene.prixDesinfectantAbonnement ?? 0) +
              (totalHygiene.prixParfum ?? 0) +
              (totalHygiene.prixBalai ?? 0) +
              (totalHygiene.prixPoubelle ?? 0) +
              (totalMaintenance.prixMaintenance ?? 0) +
              (totalIncendie.prixIncendie ?? 0)
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Total;
