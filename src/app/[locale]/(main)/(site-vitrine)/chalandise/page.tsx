import { generatePageMetadata } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { ProspectStoreProvider } from "@/stores/devis/prospectStore";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import CityOut from "./CityOut";
import { LocaleType } from "@/i18n/routing";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generatePageMetadata(
    "chalandise",
    locale,
    locale === "fr" ? "Zone non couverte" : "Area not covered",
    locale === "fr"
      ? "Notre matrice de chiffrage automatique est en cours de développement pour votre région"
      : "Our automatic pricing matrix is under development for your region",
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const {
    destination,
    codePostal,
    ville,
    surface,
    effectif,
    typeBatiment,
    typeOccupation,
  } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-4 px-6 pt-4 pb-10 md:px-20">
      <ProspectStoreProvider>
        <CityOut
          destination={destination}
          codePostal={codePostal}
          ville={ville}
          surface={surface}
          effectif={effectif}
          typeBatiment={typeBatiment}
          typeOccupation={typeOccupation}
        />
      </ProspectStoreProvider>
    </main>
  );
};

export default page;
