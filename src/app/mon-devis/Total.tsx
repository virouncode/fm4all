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
  const { totalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const prixNettoyage = [
    totalNettoyage.prixService,
    totalNettoyage.prixRepasse,
    totalNettoyage.prixSamedi,
    totalNettoyage.prixDimanche,
    totalNettoyage.prixVitrerie,
  ]
    .filter((value) => value !== null)
    .reduce((acc, curr) => acc + curr, 0);
  const prixHygiene = [
    totalHygiene.prixTrilogieAbonnement,
    totalHygiene.prixTrilogieAchat?.prixConsommables,
    totalHygiene.prixDesinfectantAbonnement,
    totalHygiene.prixDesinfectantAchat?.prixConsommables,
    totalHygiene.prixParfum,
    totalHygiene.prixBalai,
    totalHygiene.prixPoubelle,
  ]
    .filter((value) => value !== null && value !== undefined)
    .reduce((acc, curr) => acc + curr, 0);
  const prixMaintenance = totalMaintenance.prixMaintenance ?? 0;
  const prixIncendie = totalIncendie.prixIncendie ?? 0;
  const prixCafe = totalCafe.prixCafeMachines.reduce(
    (acc, item) => acc + (item.prix ?? 0),
    0
  );
  const prixThe = totalCafe.prixThe ?? 0;
  const prixSnacksFruits = totalSnacksFruits.prixTotal ?? 0;

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
            prixNettoyage +
              prixHygiene +
              prixMaintenance +
              prixIncendie +
              prixCafe +
              prixThe +
              prixSnacksFruits
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
          {prixCafe ? <TotalCafe /> : null}
          {prixThe ? <TotalThe /> : null}
          {prixSnacksFruits ? <TotalSnacksFruits /> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Total;
