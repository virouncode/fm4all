"use client";
import { usePersonnalisation } from "@/hooks/use-personnalisation";
import useScrollIntoPersonnalisation from "@/hooks/use-scroll-into-personnalisation";
import { usePersonnalisationStore } from "@/stores/devis/personnalisationStore";
import { SelectAlarmesTarifsType } from "@/zod-schemas/alarmesTarifs.schema";
import { SelectColonnesSechesTarifsType } from "@/zod-schemas/colonnesSechesTarifs.schema";
import { SelectExutoiresTarifsType } from "@/zod-schemas/exutoiresTarifs.schema";
import { SelectPortesCoupeFeuTarifsType } from "@/zod-schemas/portesCoupeFeuTarifs.schema";
import { SelectRiaTarifsType } from "@/zod-schemas/riaTarifs.schema";
import PersonnaliserIncendieComplements from "./(incendie)/PersonnaliserIncendieComplements";
import PersonnaliserNettoyageVitrerie from "./(nettoyage)/PersonnaliserNettoyageVitrerie";
import PersonnaliserCommentaires from "./PersonnaliserCommentaires";
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
  const personnalisation = usePersonnalisationStore((s) => s.personnalisation);
  const personnalisationIds = personnalisation.personnalisationIds;
  usePersonnalisation();
  useScrollIntoPersonnalisation();
  return (
    <section className="flex-1 lg:overflow-hidden">
      <PersonnaliserPresentation />
      {personnalisationIds.includes(2) && <PersonnaliserNettoyageVitrerie />}
      {/* {personnalisationIds.includes(3) && (
        <PersonnaliserNettoyageCommentaires />
      )}
      {personnalisationIds.includes(4) && <PersonnaliserHygiene />}
      {personnalisationIds.includes(5) && (
        <PersonnaliserMaintenanceCommentaires />
      )} */}
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
      {/* {personnalisationIds.includes(7) && <PersonnaliserIncendieCommentaires />}
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
      )} */}
      <PersonnaliserCommentaires />
      <PersonnaliserFinal />
    </section>
  );
};

export default PersonnaliserDevis;
