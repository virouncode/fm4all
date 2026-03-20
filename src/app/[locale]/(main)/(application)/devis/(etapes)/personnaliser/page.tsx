import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import {
  getAlarmesTarifs,
  getColonnesSechesTarifs,
  getExutoiresParkingsTarifs,
  getExutoiresTarifs,
  getPortesCoupeFeuTarifs,
  getRiaTarifs,
} from "@/server/queries/incendie.query";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import DevisGuard from "../../DevisGuard";
import ServicesLoader from "../locaux/ServicesLoader";
import PersonnaliserDevis from "./PersonnaliserDevis";

export const generateStaticParams = () => {
  return generateLocaleParams();
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "personnaliserDevis",
    locale,
    locale === "fr" ? "Personnaliser mon devis" : "Customize my quote",
    locale === "fr"
      ? "Etape 6 du devis: personnaliser votre devis"
      : "Quote Step 6: customize your quote",
  );
};

const page = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl">
          {tPersonnaliser("6-personnaliser-mon-devis")}
        </h1>
      </div>
      <DevisGuard>
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
      </DevisGuard>
    </>
  );
};

export default page;
