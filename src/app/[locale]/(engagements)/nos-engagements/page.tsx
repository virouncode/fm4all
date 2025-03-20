import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import EngagementsPage from "../EngagementsPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Nos engagements",
    description:
      "Nos engagements : Garantie, Simplicité, Gain de temps, Suivi opérationnel personnalisé, Garantie Qualité",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/nos-engagements`,
      languages: {
        en: "https://www.fm4all.com/en/our-commitments",
        fr: "https://www.fm4all.com/fr/nos-engagements",
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
  return <EngagementsPage />;
};

export default page;
