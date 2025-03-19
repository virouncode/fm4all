import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import CguPage from "../CguPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Conditions Générales d'Utilisation (CGU)",
    description:
      "Lisez nos conditions générales d'utilisation (CGU) pour en savoir plus sur les règles d'accès et d'utilisation de notre site.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/conditions-generales-d-utilisation`,
      languages: {
        en: "https://www.fm4all.com/en/terms-and-conditions-of-use",
        fr: "https://www.fm4all.com/fr/conditions-generales-d-utilisation",
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
  return <CguPage />;
};

export default page;
