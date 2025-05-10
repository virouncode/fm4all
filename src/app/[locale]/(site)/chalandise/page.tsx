import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getLocale, setRequestLocale } from "next-intl/server";
import CityOut from "./CityOut";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "chalandise",
    locale,
    locale === "fr" ? "Zone non couverte" : "Area not covered",
    locale === "fr"
      ? "Notre matrice de chiffrage automatique est en cours de développement pour votre région"
      : "Our automatic pricing matrix is under development for your region"
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
  params: Promise<{ locale: string }>;
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
    <main className="max-w-7xl mx-auto pt-4 px-6  pb-10 md:px-20 min-h-[calc(100vh-4rem)] flex flex-col gap-4">
      <CityOut
        destination={destination}
        codePostal={codePostal}
        ville={ville}
        surface={surface}
        effectif={effectif}
        typeBatiment={typeBatiment}
        typeOccupation={typeOccupation}
      />
    </main>
  );
};

export default page;
