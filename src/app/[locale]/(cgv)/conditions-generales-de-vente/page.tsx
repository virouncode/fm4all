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
    title: "Conditions Générales de Vente (CGV)",
    description:
      "Lisez nos conditions générales de vente (CGV) pour en savoir plus sur les règles d'achat et de paiement",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/conditions-generales-de-vente`,
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
