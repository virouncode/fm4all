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
    title: "Cookies policy",
    description:
      "Read our cookie policy to learn more about the use of cookies on our website.",

    alternates: {
      canonical: `https://www.fm4all.com/${locale}/cookies-policy`,
      languages: {
        en: "https://www.fm4all.com/en/cookies-policy",
        fr: "https://www.fm4all.com/fr/politique-de-cookies",
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
  return <CookiesPage />;
};

export default page;
