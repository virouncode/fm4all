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
            "cahier-des-charges-contrats-factures-planification-nous-gerons-tout-cela-pour-vous",
          )}{" "}
          <strong>{t("1-contact-1-contrat-1-facture")}</strong>{" "}
          {t("pour-tous-vos-services")}
        </>
      ),
    },
  ];
  return (
    <section id="presentation">
      <div className="bg-muted">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-12 pt-8">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl">
            {t("notre-concept")}
          </h2>
          <div className="flex flex-col justify-center gap-8 lg:flex-row lg:px-14">
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
