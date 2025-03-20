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
    title: "Our partners",
    description:
      "Together with our partners, we build a collaboration based on trust and quality.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/our-partners`,
      languages: {
        en: "https://www.fm4all.com/en/our-partners",
        fr: "https://www.fm4all.com/fr/nos-partenaires",
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
  return <PartenairesPage />;
};

export default page;
