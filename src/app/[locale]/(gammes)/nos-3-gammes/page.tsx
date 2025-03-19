import { Metadata } from "next";
import GammesPage from "../GammesPage";
import { setStaticParamsLocale } from "next-international/server";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Nos 3 gammes",
    description:
      "Découvrez nos 3 gammes de services (essentiel, confort, excellence) pour le Facility Management.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/nos-3-gammes`,
      languages: {
        en: "https://www.fm4all.com/en/our-3-tiers",
        fr: "https://www.fm4all.com/fr/nos-3-gammes",
      },
    },
  };
};

export const generateStaticParams = () => {
  return [{ locale: "fr" }];
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  return <GammesPage />;
};

export default page;
