import BackgroundServer from "@/components/backgrounds/BackgroundServer";
import DevisButton from "@/components/buttons/devis-button";
import { getLocale, getTranslations } from "next-intl/server";

const Hero = async () => {
  const locale = await getLocale();
  const tGlobal = await getTranslations("Global");
  const t = await getTranslations("HomePage.hero");
  return (
    <section
      className="flex items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] overflow-hidden relative"
      id="hero"
    >
      <BackgroundServer />
      <div className="relative z-10 w-11/12 max-w-7xl mx-auto flex flex-col items-center gap-8 px-4 py-12">
        <div className="w-full max-w-3xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-pretty animate-appear">
            {t("votre-entreprise-de")}{" "}
            <span className="text-fm4alldestructive">
              {t("facility-management")}
            </span>
            {locale === "fr" ? ". " : t("services-en-ile-de-france")}
          </h1>
          <h2 className="text-xl md:text-2xl font-medium mb-8 animate-appear text-center">
            {t("les-services-aux-entreprises-au-meilleur-prix")}
          </h2>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20 flex flex-col gap-6 text-base md:text-xl animate-appear">
            <h2>
              {t("gagnez-du-temps-et-de-largent-sur-la")}{" "}
              <strong>{t("gestion-de-vos-prestations")}</strong>{" "}
              {t(
                "de-nettoyage-hygiene-sanitaire-cafe-maintenance-multitechnique-securite-incendie-etc"
              )}
            </h2>
            <p className="text-center">
              <strong>{t("contact-contrat-facture")}</strong>{" "}
              {t("pour-tous-vos-services")}
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center bg-fm4allsecondary text-white rounded-full w-6 h-6 mr-3 flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>
                  <strong className="text-white">{t("comparez")}</strong>{" "}
                  {t("par-gamme")}
                  <span className="font-bold ml-1">{tGlobal("essentiel")}</span>
                  , <span className="font-bold">{tGlobal("confort")}</span>,{" "}
                  <span className="font-bold">{tGlobal("excellence")}</span>
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center bg-fm4allsecondary text-white rounded-full w-6 h-6 mr-3 flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>
                  <strong className="text-white">{t("simplifiez")}</strong>{" "}
                  {t("la-mise-en-place-des-services")}
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center bg-fm4allsecondary text-white rounded-full w-6 h-6 mr-3 flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>
                  <strong className="text-white">{t("deleguez")}</strong>{" "}
                  {t("la-gestion-du-quotidien")}
                </span>
              </li>
            </ul>
            <div className="hidden md:flex md:justify-center">
              <DevisButton
                title={tGlobal("je-realise-mon-devis-en-ligne")}
                text={tGlobal("je-realise-mon-devis-en-ligne")}
                size="lg"
                className="bg-fm4alldestructive hover:bg-fm4alldestructive/90 text-white border-none shadow-lg hover:shadow-xl"
              />
            </div>
            <div className="md:hidden">
              <DevisButton
                title={tGlobal("mon-devis-en-ligne")}
                text={tGlobal("mon-devis-en-ligne")}
                size="lg"
                className="bg-fm4alldestructive hover:bg-fm4alldestructive/90 text-white border-none shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
