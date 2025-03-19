import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import FaqPage from "../FaqPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Frequently Asked Questions",
    description: "Frequently asked questions about fm4All services",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/frequently-asked-questions`,
      languages: {
        en: "https://www.fm4all.com/en/frequently-asked-questions",
        fr: "https://www.fm4all.com/fr/foire-aux-questions",
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
  return <FaqPage />;
};

export default page;
