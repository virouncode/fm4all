import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import GammesPage from "../GammesPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Our 3 tiers",
    description:
      "Discover our 3 service tiers (Essential, Comfort, Excellence) for Facility Management.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/our-3-tiers`,
      languages: {
        en: "https://www.fm4all.com/en/our-3-tiers",
        fr: "https://www.fm4all.com/fr/nos-3-gammes",
      },
    },
  };
};

export const generateStaticParams = () => {
  return [{ locale: "en" }];
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  return <GammesPage />;
};

export default page;
