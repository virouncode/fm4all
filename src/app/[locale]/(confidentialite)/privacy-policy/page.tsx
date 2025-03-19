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
    title: "Privacy policy",
    description:
      "Read our privacy policy to learn more about the collection and processing of your personal data.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/privacy-policy`,
      languages: {
        en: "https://www.fm4all.com/en/privacy-policy",
        fr: "https://www.fm4all.com/fr/policy-de-confidentialite",
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
  return <ConfidentialitePage />;
};

export default page;
