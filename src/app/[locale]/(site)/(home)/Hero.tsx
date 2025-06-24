import BackgroundServer from "@/components/backgrounds/BackgroundServer";
import { getLocale, getTranslations } from "next-intl/server";
import HeroCard from "./HeroCard";

const Hero = async () => {
  const locale = await getLocale();
  const t = await getTranslations("HomePage.hero");
  return (
    <section
      className="flex items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] overflow-hidden relative"
      id="hero"
    >
      <BackgroundServer />
      <div className="relative z-10 w-11/12 max-w-7xl mx-auto flex flex-col items-center gap-8 px-4 py-12">
        <div className="w-full max-w-3xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-14 text-pretty animate-appear hyphens-auto">
            {t("votre-entreprise-de")}{" "}
            <span className="text-fm4alldestructive">
              {t("facility-management")}
            </span>
            {locale === "fr" ? "." : `${t("services-en-ile-de-france")}.`}
          </h1>
          <HeroCard />
        </div>
      </div>
    </section>
  );
};

export default Hero;
