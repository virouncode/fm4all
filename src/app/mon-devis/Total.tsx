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
import { Calculator } from "lucide-react";
import { useContext } from "react";
import TotalHygiene from "./TotalHygiene";
import TotalIncendie from "./TotalIncendie";
import TotalMaintenance from "./TotalMaintenance";
import TotalNettoyage from "./TotalNettoyage";

const Total = () => {
  const { client } = useContext(ClientContext);
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const { totalHygiene } = useContext(TotalHygieneContext);
  const { totalMaintenance } = useContext(TotalMaintenanceContext);
  const { totalIncendie } = useContext(TotalIncendieContext);
  const prixNettoyage =
    (totalNettoyage.prixService ?? 0) +
    (totalNettoyage.prixRepasse ?? 0) +
    (totalNettoyage.prixSamedi ?? 0) +
    (totalNettoyage.prixDimanche ?? 0) +
    (totalNettoyage.prixVitrerie ?? 0);
  const prixHygiene =
    (totalHygiene.prixTrilogieAbonnement ?? 0) +
    (totalHygiene.prixDesinfectantAbonnement ?? 0) +
    (totalHygiene.prixParfum ?? 0) +
    (totalHygiene.prixBalai ?? 0) +
    (totalHygiene.prixPoubelle ?? 0);
  const prixMaintenance = totalMaintenance.prixMaintenance ?? 0;
  const prixIncendie = totalIncendie.prixIncendie ?? 0;

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
            prixNettoyage + prixHygiene + prixMaintenance + prixIncendie
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
          {prixNettoyage ? <TotalNettoyage /> : null}
          {prixHygiene ? <TotalHygiene /> : null}
          {prixMaintenance ? <TotalMaintenance /> : null}
          {prixIncendie ? <TotalIncendie /> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Total;
