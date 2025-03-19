import { getScopedI18n, getStaticParams } from "@/locales/server";
import { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import Articles from "../Articles";
import Hero from "../Hero";
import HofManager from "../HofManager";
import How from "../How";
import Mission from "../Mission";
import Partenaires from "../Partenaires";
import Presentation from "../Presentation";
import Services from "../Services";
import Slogan from "../Slogan";
import VideoPresentation from "../VideoPresentation";
import Why from "../Why";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const t = await getScopedI18n("homePage");
  const { locale } = await params;
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      canonical: `https://www.fm4all.com/${locale}`,
      languages: {
        en: "https://www.fm4all.com/en",
        fr: "https://www.fm4all.com/fr",
      },
    },
  };
};

export const generateStaticParams = () => {
  return getStaticParams();
};

export default async function page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setStaticParamsLocale(locale);
  return (
    <main className="flex flex-col gap-12 mb-24">
      <Hero />
      <Slogan />
      <Presentation />
      <Services />
      <Partenaires />
      <VideoPresentation />
      <How />
      <Why />
      <Mission />
      <HofManager />
      <Articles />
    </main>
  );
}
