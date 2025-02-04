"use client";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { usePersonnalisation } from "@/hooks/use-personnalisation";
import useScrollIntoPersonnalisation from "@/hooks/use-scroll-into-personnalisation";
import { SelectAlarmesTarifsType } from "@/zod-schemas/alarmesTarifs";
import { SelectColonnesSechesTarifsType } from "@/zod-schemas/colonnesSechesTarifs";
import { SelectExutoiresTarifsType } from "@/zod-schemas/exutoiresTarifs";
import { SelectPortesCoupeFeuTarifsType } from "@/zod-schemas/portesCoupeFeuTarifs";
import { SelectRiaTarifsType } from "@/zod-schemas/riaTarifs";
import { useContext } from "react";
import PersonnaliserCafeCommentaires from "./(cafe)/PersonnaliserCafeCommentaires";
import PersonnaliserHygiene from "./(hygiene)/PersonnaliserHygiene";
import PersonnaliserIncendieCommentaires from "./(incendie)/PersonnaliserIncendieCommentaires";
import PersonnaliserIncendieComplements from "./(incendie)/PersonnaliserIncendieComplements";
import PersonnaliserMaintenanceCommentaires from "./(maintenance)/PersonnaliserMaintenanceCommentaires";
import PersonnaliserNettoyageCommentaires from "./(nettoyage)/PersonnaliserNettoyageCommentaires";
import PersonnaliserNettoyageVitrerie from "./(nettoyage)/PersonnaliserNettoyageVitrerie";
import PersonnaliserOfficeManagerCommentaires from "./(officeManager)/PersonnaliserOfficeManagerCommentaires";
import PersonnaliserServicesFm4AllCommentaires from "./(servicesFm4All)/PersonnaliserServicesFm4AllCommentaires";
import PersonnaliserSnacksFruitsCommentaires from "./(snacksFruits)/PersonnaliserSnacksFruitsCommentaires";
import PersonnaliserTheCommentaires from "./(the)/PersonnaliserTheCommentaires";
import PersonnaliserFinal from "./PersonnaliserFinal";
import PersonnaliserPresentation from "./PersonnaliserPresentation";

type PersonnaliserDevisProps = {
  exutoiresTarifs?: SelectExutoiresTarifsType[];
  exutoiresParkingTarifs?: SelectExutoiresTarifsType[];
  alarmesTarifs?: SelectAlarmesTarifsType[];
  riaTarifs?: SelectRiaTarifsType[];
  colonnesSechesTarifs?: SelectColonnesSechesTarifsType[];
  portesCoupeFeuTarifs?: SelectPortesCoupeFeuTarifsType[];
};

const PersonnaliserDevis = ({
  exutoiresTarifs,
  exutoiresParkingTarifs,
  alarmesTarifs,
  riaTarifs,
  colonnesSechesTarifs,
  portesCoupeFeuTarifs,
}: PersonnaliserDevisProps) => {
  const { personnalisation } = useContext(PersonnalisationContext);
  const personnalisationIds = personnalisation.personnalisationIds;
  usePersonnalisation();
  useScrollIntoPersonnalisation();
  return (
    <section className="flex-1 overflow-hidden">
      <PersonnaliserPresentation />
      {personnalisationIds.includes(2) && <PersonnaliserNettoyageVitrerie />}
      {personnalisationIds.includes(3) && (
        <PersonnaliserNettoyageCommentaires />
      )}
      {personnalisationIds.includes(4) && <PersonnaliserHygiene />}
      {personnalisationIds.includes(5) && (
        <PersonnaliserMaintenanceCommentaires />
      )}
      {personnalisationIds.includes(6) && (
        <PersonnaliserIncendieComplements
          exutoiresTarifs={exutoiresTarifs}
          exutoiresParkingTarifs={exutoiresParkingTarifs}
          alarmesTarifs={alarmesTarifs}
          riaTarifs={riaTarifs}
          colonnesSechesTarifs={colonnesSechesTarifs}
          portesCoupeFeuTarifs={portesCoupeFeuTarifs}
        />
      )}
      {personnalisationIds.includes(7) && <PersonnaliserIncendieCommentaires />}
      {personnalisationIds.includes(8) && <PersonnaliserCafeCommentaires />}
      {personnalisationIds.includes(9) && <PersonnaliserTheCommentaires />}
      {personnalisationIds.includes(10) && (
        <PersonnaliserSnacksFruitsCommentaires />
      )}
      {personnalisationIds.includes(11) && (
        <PersonnaliserOfficeManagerCommentaires />
      )}
      {personnalisationIds.includes(12) && (
        <PersonnaliserServicesFm4AllCommentaires />
      )}
      <PersonnaliserFinal />
    </section>
  );
};

export default PersonnaliserDevis;
