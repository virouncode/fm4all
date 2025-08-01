import BackgroundServer from "@/components/backgrounds/BackgroundServer";
import { getLocale, getTranslations } from "next-intl/server";
import HeroCard from "./HeroCard";

const Hero = async () => {
  const locale = await getLocale();
  const t = await getTranslations("HomePage.hero");
  return (
    <section
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden md:min-h-[calc(100vh-4rem)]"
      id="hero"
    >
      <BackgroundServer />
      <div className="relative z-10 mx-auto flex w-11/12 max-w-7xl flex-col items-center gap-8 px-4 py-12">
        <div className="w-full max-w-3xl text-white">
          <h1
            className={`animate-appear mb-14 text-4xl font-bold tracking-tighter text-pretty hyphens-auto md:text-5xl lg:text-6xl`}
          >
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
