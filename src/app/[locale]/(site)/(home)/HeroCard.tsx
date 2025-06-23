import DevisButton from "@/components/buttons/devis-button";
import { getTranslations } from "next-intl/server";

const HeroCard = async () => {
  const tGlobal = await getTranslations("Global");
  const t = await getTranslations("HomePage.hero");

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20 flex flex-col gap-6 text-base md:text-xl animate-appear">
      <p>
        {t("gagnez-du-temps-et-de-largent-sur-la")}{" "}
        <strong>{t("gestion-de-vos-prestations")}</strong>{" "}
        {t(
          "de-nettoyage-hygiene-sanitaire-cafe-maintenance-multitechnique-securite-incendie-etc"
        )}
      </p>
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
            <span className="font-bold ml-1">{tGlobal("essentiel")}</span>,{" "}
            <span className="font-bold">{tGlobal("confort")}</span>,{" "}
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
          className="bg-fm4alldestructive hover:bg-fm4alldestructive/90 text-white border-none shadow-lg hover:shadow-xl ring-fm4alldestructive"
        />
      </div>
      <div className="md:hidden">
        <DevisButton
          title={tGlobal("mon-devis-en-ligne")}
          text={tGlobal("mon-devis-en-ligne")}
          size="lg"
          className="bg-fm4alldestructive hover:bg-fm4alldestructive/90 text-white border-none shadow-lg w-full ring-fm4alldestructive"
        />
      </div>
    </div>
  );
};

export default HeroCard;
