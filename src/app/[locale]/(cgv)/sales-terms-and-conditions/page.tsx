import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import CgvPage from "../CgvPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Sales terms and conditions",
    description:
      "Read our sales terms and conditions to learn more about purchasing and payment rules",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/sales-terms-and-conditions`,
      languages: {
        en: "https://www.fm4all.com/en/sales-terms-and-conditions",
        fr: "https://www.fm4all.com/fr/conditions-generales-de-vente",
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
  return <CgvPage />;
};

export default page;
