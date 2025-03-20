import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import ServicesPage from "../ServicesPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Our services",
    description: "Explore the Facility Management services offered by fm4all.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/our-services`,
      languages: {
        en: "https://www.fm4all.com/en/our-services",
        fr: "https://www.fm4all.com/fr/nos-services",
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
  return <ServicesPage />;
};

export default page;
