import {
  getAlarmesTarifs,
  getColonnesSechesTarifs,
  getExutoiresParkingsTarifs,
  getExutoiresTarifs,
  getPortesCoupeFeuTarifs,
  getRiaTarifs,
} from "@/lib/queries/incendie/getIncendie";
import { Metadata } from "next";
import { Suspense } from "react";
import ServicesLoader from "../mes-locaux/ServicesLoader";
import PersonnaliserDevis from "./PersonnaliserDevis";

export const metadata: Metadata = {
  title: "Personnaliser",
  description: "Etape 6 du devis: personnaliser votre devis",
};

const page = async () => {
  const [
    exutoiresTarifs,
    exutoiresParkingTarifs,
    alarmesTarifs,
    riaTarifs,
    colonnesSechesTarifs,
    portesCoupeFeuTarifs,
  ] = await Promise.all([
    getExutoiresTarifs(),
    getExutoiresParkingsTarifs(),
    getAlarmesTarifs(),
    getRiaTarifs(),
    getColonnesSechesTarifs(),
    getPortesCoupeFeuTarifs(),
  ]);
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl">6. Personnaliser mon devis</h1>
      </div>
      <Suspense fallback={<ServicesLoader />}>
        <PersonnaliserDevis
          exutoiresTarifs={exutoiresTarifs}
          exutoiresParkingTarifs={exutoiresParkingTarifs}
          alarmesTarifs={alarmesTarifs}
          riaTarifs={riaTarifs}
          colonnesSechesTarifs={colonnesSechesTarifs}
          portesCoupeFeuTarifs={portesCoupeFeuTarifs}
        />
      </Suspense>
    </>
  );
};

export default page;
