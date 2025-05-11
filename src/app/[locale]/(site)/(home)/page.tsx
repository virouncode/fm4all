import Articles from "@/app/[locale]/(site)/(home)/Articles";
import Concept from "@/app/[locale]/(site)/(home)/Concept";
import Hero from "@/app/[locale]/(site)/(home)/Hero";
import HofManager from "@/app/[locale]/(site)/(home)/HofManager";
import How from "@/app/[locale]/(site)/(home)/How";
import Mission from "@/app/[locale]/(site)/(home)/Mission";
import Partenaires from "@/app/[locale]/(site)/(home)/Partenaires";
import Presentation from "@/app/[locale]/(site)/(home)/Presentation";
import Services from "@/app/[locale]/(site)/(home)/Services";
import Slogan from "@/app/[locale]/(site)/(home)/Slogan";
import VideoPresentation from "@/app/[locale]/(site)/(home)/VideoPresentation";
import Why from "@/app/[locale]/(site)/(home)/Why";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const generateStaticParams = () => {
  return generateLocaleParams();
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const title =
    locale === "fr"
      ? "Facility Management à Paris & Île-de-France - Devis en ligne"
      : "Facility Management & Business Services in Paris – Instant Quote";

  // Description basée sur la langue
  const description =
    locale === "fr"
      ? "fm4all démocratise les services aux entreprises de toutes tailles à Paris & Île-de-France. Comparez les offres de nos prestataires et obtenez un devis en ligne."
      : "fm4all makes business services accessible to companies of all sizes in Paris & Île-de-France. Compare offers from our providers and get an online quote.";

  return generateAlternates("home", locale, title, description);
};

export default async function page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <main className="flex flex-col mb-24">
        <Hero />
        <Slogan />
        <Presentation />
        <Concept />
        <Services />
        <Partenaires />
        <VideoPresentation />
        <How />
        <Why />
        <Mission />
        <HofManager />
        <Articles />
      </main>{" "}
    </>
  );
}
