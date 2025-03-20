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
    title: "Become a provider",
    description:
      "Are you a service provider? fm4all invites you to become a partner.",
    alternates: {
      canonical: `https://www.fm4all.com/${locale}/become-a-provider`,
      languages: {
        en: "https://www.fm4all.com/en/become-a-provider",
        fr: "https://www.fm4all.com/fr/devenir-prestataire",
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
  return <PrestatairePage />;
};

export default page;
