import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import CookiesPage from "../CookiesPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Politique de cookies",
    description:
      "Lisez notre politique de cookies pour en savoir plus sur l'utilisation des cookies sur notre site.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/politique-de-cookies`,
      languages: {
        en: "https://www.fm4all.com/en/cookies-policy",
        fr: "https://www.fm4all.com/fr/politique-de-cookies",
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
  return <CookiesPage />;
};

export default page;
