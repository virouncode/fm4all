import Articles from "@/app/[locale]/(main)/(site-vitrine)/(home)/Articles";
import Concept from "@/app/[locale]/(main)/(site-vitrine)/(home)/Concept";
import Hero from "@/app/[locale]/(main)/(site-vitrine)/(home)/Hero";
import HofManager from "@/app/[locale]/(main)/(site-vitrine)/(home)/HofManager";
import How from "@/app/[locale]/(main)/(site-vitrine)/(home)/How";
import Mission from "@/app/[locale]/(main)/(site-vitrine)/(home)/Mission";
import Partenaires from "@/app/[locale]/(main)/(site-vitrine)/(home)/Partenaires";
import Presentation from "@/app/[locale]/(main)/(site-vitrine)/(home)/Presentation";
import Services from "@/app/[locale]/(main)/(site-vitrine)/(home)/Services";
import Slogan from "@/app/[locale]/(main)/(site-vitrine)/(home)/Slogan";
import VideoPresentation from "@/app/[locale]/(main)/(site-vitrine)/(home)/VideoPresentation";
import Why from "@/app/[locale]/(main)/(site-vitrine)/(home)/Why";
import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import FAQ from "./FAQ";

export const generateStaticParams = () => {
  return generateLocaleParams();
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const title =
    locale === "fr"
      ? "Entreprise de Facility Management Paris IDF | Devis"
      : "Facility Management Services in Paris | Instant Quote";

  // Description basée sur la langue
  const description =
    locale === "fr"
      ? "fm4all gère vos services généraux à Paris et en IDF : propreté, maintenance, etc. Obtenez dès maintenant un devis gratuit pour vos locaux."
      : "Facility Management services in Paris: fm4all provides cleaning, maintenance, fire safety, and more. Get your free quote online and simplify operations.";

  return generateAlternates("home", locale, title, description);
};

export default async function page({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <main className="mb-24 flex flex-col">
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
        <FAQ />
        <Articles />
      </main>
    </>
  );
}
