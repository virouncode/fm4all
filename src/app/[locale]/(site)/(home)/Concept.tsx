import { Handshake, Scale, ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import ConceptCard from "./ConceptCard";

const Concept = () => {
  const t = useTranslations("HomePage.concept");
  const conceptCardsData = [
    {
      icon: Scale,
      title: t("un-comparateur"),
      description: (
        <>
          {t("pour-chaque-service")}{" "}
          <strong>
            {t("comparez-les-offres-de-nos-prestataires-partenaires")}
          </strong>{" "}
          {t("et-trouvez-la-formule-qui-vous-convient-le-mieux")}
        </>
      ),
    },
    {
      icon: ScrollText,
      title: t("un-generateur-de-devis"),
      description: (
        <>
          {t("obtenez-un")} <strong>{t("devis-clair-et-detaille")}</strong>{" "}
          {t("en-quelques-clics-sans-attendre-un-hypothetique-appel")}
        </>
      ),
    },
    {
      icon: Handshake,
      title: t("un-accompagnement"),
      description: (
        <>
          {t(
            "cahier-des-charges-contrats-factures-planification-nous-gerons-tout-cela-pour-vous"
          )}{" "}
          <strong>{t("1-contact-1-contrat-1-facture")}</strong>{" "}
          {t("pour-tous-vos-services")}
        </>
      ),
    },
  ];
  return (
    <section id="presentation">
      <div className="bg-gradient-to-r from-[#f0c674]/100 to-[#f0c674]/70">
        <div className="max-w-7xl w-full mx-auto flex flex-col gap-10 pt-8 pb-12 px-6">
          <h2 className="text-2xl md:text-3xl border-l-2 px-4">
            {t("notre-concept")}
          </h2>
          <div className="flex flex-col lg:flex-row justify-center gap-8 lg:px-14">
            {conceptCardsData.map(({ icon, title, description }) => (
              <ConceptCard
                key={title}
                icon={icon}
                title={title}
                description={description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Concept;
