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
  return generateAlternates(
    "home",
    locale,
    locale === "fr"
      ? "Les services aux entreprises au meilleur prix"
      : "Facility management services in Paris at the best price",
    locale === "fr"
      ? "fm4all démocratise les services généraux pour toutes les tailles d'entreprises. Utilisez notre comparateur et émetteur de devis en ligne pour les services aux entreprises."
      : "fm4all democratizes facility management services for businesses in Paris. Use our online comparison tool and quote generator for business services."
  );
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
