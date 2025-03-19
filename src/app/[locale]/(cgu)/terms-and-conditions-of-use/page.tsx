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
    title: "Terms and Conditions of Use",
    description:
      "Read our Terms and Conditions of Use (TCU) to learn more about the rules for accessing and using our website.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/terms-and-conditions-of-use`,
      languages: {
        en: "https://www.fm4all.com/en/terms-and-conditions-of-use",
        fr: "https://www.fm4all.com/fr/conditions-generales-d-utilisation",
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
  return <CguPage />;
};

export default page;
