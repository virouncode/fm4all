import Articles from "@/components/Articles";
import Partenaires from "@/components/Partenaires";
import Services from "@/components/Services";
import VideoPresentation from "@/components/VideoPresentation";
import Why from "@/components/Why";
import { generateAlternates } from "@/lib/metadata-helpers";
import { generateLocaleParams } from "@/lib/staticParamsHelper";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import Hero from "../../components/Hero";
import HofManager from "../../components/HofManager";
import How from "../../components/How";
import Mission from "../../components/Mission";
import Presentation from "../../components/Presentation";
import Slogan from "../../components/Slogan";

export const generateStaticParams = () => {
  return generateLocaleParams();
};

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  const title =
    locale === "fr"
      ? "Facility Management à Paris & Île-de-France - Devis en ligne | fm4all"
      : "Facility Management & Business Services in Paris – Instant Quote | fm4all";

  // Description basée sur la langue
  const description =
    locale === "fr"
      ? "fm4all démocratise les services aux entreprises de toutes tailles à Paris & Île-de-France. Comparez les offres de nos prestataires et obtenez un devis en ligne."
      : "fm4all makes business services accessible to companies of all sizes in Paris & Île-de-France. Compare offers from our providers and get an online quote.";

  return generateAlternates("home", locale, title, description);
};

export default function page() {
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
