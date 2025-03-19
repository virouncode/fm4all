import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import CityOutPage from "../CityOutPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Ville non éligible",
    description:
      "Notre matrice de chiffrage automatique est en cours de développement pour votre région.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/zone-non-couverte`,
      languages: {
        en: "https://www.fm4all.com/en/area-not-covered",
        fr: "https://www.fm4all.com/fr/zone-non-couverte",
      },
    },
  };
};

export const generateStaticParams = () => {
  return [{ locale: "fr" }];
};

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { locale } = await params;
  const { destination } = await searchParams;
  setStaticParamsLocale(locale);
  return <CityOutPage destination={destination} />;
};

export default page;
