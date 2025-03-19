import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import PrestatairePage from "../PrestatairePage";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: "Devenez Prestataire",
    description:
      "Vous êtes prestataire de service ? fm4all vous propose de devenir partenaire.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/devenir-prestataire`,
      languages: {
        en: "https://www.fm4all.com/en/become-a-provider",
        fr: "https://www.fm4all.com/fr/devenir-prestataire",
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
  return <PrestatairePage />;
};

export default page;
