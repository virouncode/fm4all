import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import {
  getAlarmesTarifs,
  getColonnesSechesTarifs,
  getExutoiresParkingsTarifs,
  getExutoiresTarifs,
  getPortesCoupeFeuTarifs,
  getRiaTarifs,
} from "@/lib/queries/incendie/getIncendie";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ServicesLoader from "../locaux/ServicesLoader";
import PersonnaliserDevis from "./PersonnaliserDevis";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "personnaliserDevis",
    locale,
    locale === "fr" ? "Personnaliser mon devis" : "Customize my quote",
    locale === "fr"
      ? "Etape 6 du devis: personnaliser votre devis"
      : "Quote Step 6: customize your quote"
  );
};

const page = async () => {
  const tPersonnaliser = await getTranslations("DevisPage.personnaliser");
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
        <h1 className="text-3xl md:text-4xl">
          {tPersonnaliser("6-personnaliser-mon-devis")}
        </h1>
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
