import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import ConfidentialitePage from "../ConfidentialitePage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Politique de confidentialité",
    description:
      "Lisez notre politique de confidentialité pour en savoir plus sur la collecte et le traitement de vos données personnelles.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/politique-de-confidentialite`,
      languages: {
        en: "https://www.fm4all.com/en/privacy-policy",
        fr: "https://www.fm4all.com/fr/policy-de-confidentialite",
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
  return <ConfidentialitePage />;
};

export default page;
