import { Accordion } from "@/components/ui/accordion";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import FAQItem from "./FAQItem";

const FAQ = () => {
  const t = useTranslations("HomePage.faq");
  const faqs: { id: number; question: string; answer: ReactNode }[] = [
    {
      id: 1,
      question: t("quest-ce-que-le-facility-management-en-entreprise"),
      answer: (
        <div className="text-base hyphens-auto">
          <p>
            <strong>
              {t("le-facility-management-ou-gestion-des-services-generaux")}
            </strong>
            {t(
              "designe-lensemble-des-activites-de-support-qui-permettent-a-une-entreprise-de-fonctionner-efficacement-au-quotidien-cela-inclut-la-gestion-des-batiments-la-maintenance-technique-la-proprete-la-securite-ou-encore-les-services-aux-occupants-accueil-courrier-espaces-verts-lobjectif-est-dassurer-un-environnement-de-travail-optimal-tout-en-reduisant-les-couts-et-en-ameliorant-la-performance-globale"
            )}
          </p>
        </div>
      ),
    },
    {
      id: 2,
      question: t(
        "quels-services-incluent-notre-solution-de-facility-management-pour-les-entreprises"
      ),
      answer: (
        <div className="text-base hyphens-auto flex flex-col gap-4">
          <p>
            {t(
              "notre-solution-de-facility-management-est-complete-et-modulable-selon-les-besoins-de-chaque-entreprise-elle-comprend"
            )}
          </p>
          <ul className="list-disc  ml-6">
            <li>
              <strong>{t("nettoyage-et-hygiene-sanitaire")}</strong>{" "}
              {t("des-locaux")}
            </li>
            <li>
              <strong>{t("maintenance")}</strong> {t("multi-technique")}
            </li>
            <li>
              <strong>{t("securite-incendie")}</strong>
            </li>
            <li>
              {t("location-de")} <strong>{t("machines-a-cafe")}</strong>{" "}
              {t("et-livraisons-de-consommables")}
            </li>
            <li>
              {t("livraison-de")} <strong>{t("fruits-frais")}</strong> {t("et")}{" "}
              <strong>{t("snacks-sains-et-gourmands")}</strong>
            </li>
            <li>
              {t("livraison-de")} <strong>{t("boissons")}</strong>{" "}
              {t("variees")}
            </li>
            <li>
              {t("location-de")} <strong>{t("fontaines-a-eau")}</strong>{" "}
              {t("sur-reseau")}
            </li>
            <li>
              <strong>{t("office-manager-externalise")}</strong>{" "}
              {t("pour-la-gestion-des-services")}
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 3,
      question: t(
        "quels-sont-les-avantages-a-externaliser-le-facility-management"
      ),
      answer: (
        <div className="text-base hyphens-auto flex flex-col gap-4">
          <p>
            {t(
              "externaliser-le-facility-management-presente-de-nombreux-benefices-pour-les-entreprises"
            )}
          </p>
          <ul className="list-disc  ml-6">
            <li>
              <strong>{t("gain-de-temps")}</strong>{" "}
              {t("focalisez-vous-sur-votre-coeur-de-metier")}
            </li>
            <li>
              <strong>{t("reduction-des-couts")}</strong>{" "}
              {t("mutualisation-des-services-et-optimisation-des-ressources")}
            </li>
            <li>
              <strong>{t("flexibilite")}</strong>{" "}
              {t("adaptation-rapide-a-levolution-de-vos-besoins")}
            </li>
            <li>
              <strong>{t("suivi-de-la-qualite")}</strong>{" "}
              {t("indicateurs-de-performance-et-engagement-contractuel")}
            </li>
          </ul>
          <p>
            {t(
              "cette-approche-permet-daugmenter-la-performance-operationnelle-tout-en-assurant-un-environnement-de-travail-de-qualite"
            )}
          </p>
        </div>
      ),
    },
    {
      id: 4,
      question: t("a-qui-sadressent-nos-prestations-de-facility-management"),
      answer: (
        <div className="text-base hyphens-auto flex flex-col gap-4">
          <p>
            {t(
              "nos-prestations-de-facility-management-sadressent-a-une-large-variete-dacteurs-professionnels"
            )}
          </p>
          <ul className="list-disc  ml-6">
            <li>
              <strong>{t("TPE/PME")}</strong>{" "}
              {t(
                "qui-souhaitent-optimiser-leurs-couts-et-ameliorer-leur-environnement-de-travail"
              )}
            </li>
            <li>
              <strong>{t("start-up/scale-up")}</strong>{" "}
              {t(
                "qui-ont-besoin-de-flexibilite-et-dagilite-dans-la-gestion-de-leurs-services"
              )}
            </li>
            <li>
              <strong>{t("cabinets-medicaux")}</strong>{" "}
              {t(
                "qui-necessitent-des-services-adaptes-a-leurs-normes-d-and-apos-hygiene"
              )}
            </li>
            <li>
              <strong>{t("locaux-commerciaux")}</strong>{" "}
              {t("qui-veulent-offrir-une-experience-client-de-qualite")}
            </li>
            <li>
              <strong>{t("entrepots-logistiques")}</strong>{" "}
              {t("qui-ont-besoin-de-maintenance-et-de-securite")}
            </li>
            <li>
              {t("proprietaires-ou-gestionnaires-d")}
              <strong>{t("immeubles-tertiaires")}</strong>{" "}
              {t(
                "qui-cherchent-a-professionnaliser-la-gestion-de-leurs-espaces"
              )}
            </li>
          </ul>
          <p>
            {t(
              "quel-que-soit-votre-secteur-notre-offre-sadapte-a-vos-enjeux-specifiques"
            )}
          </p>
        </div>
      ),
    },
    {
      id: 5,
      question: t("comment-choisir-son-prestataire-de-facility-management"),
      answer: (
        <div className="text-base hyphens-auto flex flex-col gap-4">
          <p>
            {t(
              "pour-bien-choisir-votre-prestataire-de-facility-management-voici-les-criteres-cles-a-prendre-en-compte"
            )}
          </p>
          <ul className="list-disc  ml-6">
            <li>
              <strong>{t("experience-et-references")}</strong>{" "}
              {t("dans-votre-secteur-dactivite")}
            </li>
            <li>
              {t("capacite-a-proposer-une")}{" "}
              <strong>{t("offre-sur-mesure-et-evolutive")}</strong>
            </li>
            <li>
              <strong>{t("transparence-et-engagements-contractuels")}</strong>
            </li>
            <li>
              <strong>
                {t("respect-des-normes-et-des-meilleures-pratiques")}
              </strong>
            </li>
            <li>
              <strong>{t("approche-durable-et-innovante")}</strong>
            </li>
          </ul>
          <p>
            {t(
              "un-bon-partenaire-saura-allier-performance-operationnelle-qualite-de-service-et-respect-de-vos-objectifs-strategiques"
            )}
          </p>
        </div>
      ),
    },
  ];
  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col gap-10 pt-8 pb-12 px-6 relative">
      <h2 className="text-2xl md:text-3xl border-l-2 px-4">
        {t("questions-frequemment-posees")}
      </h2>
      <Accordion type="single" collapsible className="w-full lg:w-1/2 px-6">
        {faqs.map((faq) => (
          <FAQItem
            key={faq.id}
            value={`item-${faq.id}`}
            question={faq.question}
          >
            {faq.answer}
          </FAQItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQ;
