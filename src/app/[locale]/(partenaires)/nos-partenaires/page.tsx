import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import PartenairesPage from "../PartenairesPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Nos partenaires",
    description:
      "Avec nos partenaires, nous établissons une collaboration fondée sur la qualité et la confiance.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/nos-partenaires`,
      languages: {
        en: "https://www.fm4all.com/en/our-partners",
        fr: "https://www.fm4all.com/fr/nos-partenaires",
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
  return <PartenairesPage />;
};

export default page;
