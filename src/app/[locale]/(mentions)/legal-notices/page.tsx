import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import MentionsPage from "../MentionsPage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Legal notices",
    description: "Check the legal notices of the fm4all.com website",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/mentions-legales`,
      languages: {
        en: "https://www.fm4all.com/en/legal-notices",
        fr: "https://www.fm4all.com/fr/mentions-legales",
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
  return <MentionsPage />;
};

export default page;
