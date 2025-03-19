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
    title: "City not eligible",
    description:
      "Our automatic pricing matrix is currently being developed for your region.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/area-not-covered`,
      languages: {
        en: "https://www.fm4all.com/en/area-not-covered",
        fr: "https://www.fm4all.com/fr/zone-non-couverte",
      },
    },
  };
};

export const generateStaticParams = () => {
  return [{ locale: "en" }];
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
