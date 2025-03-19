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
    title: "Foire aux questions",
    description: "Foire aux questions sur les services de fm4All",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/foire-aux-questions`,
      languages: {
        en: "https://www.fm4all.com/en/frequently-asked-questions",
        fr: "https://www.fm4all.com/fr/foire-aux-questions",
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
  return <FaqPage />;
};

export default page;
