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
        <div className="text-base hyphens-auto flex flex-col gap-4">
          <p>
            {t("le")} <strong>{t("facility-management")}</strong>
            {t("qui-se-traduit-par")}{" "}
            <strong>{t("gestion-des-services-generaux")}</strong>{" "}
            {t(
              "en-francais-fait-reference-a-la-gestion-de-lensemble-des-activites-necessaires-pour-assurer-le-bon-fonctionnement-dune-societe"
            )}{" "}
          </p>
          <p>
            {t("cela-englobe-la")} <strong>{t("proprete")}</strong>{" "}
            {t("nettoyage-et-hygiene-sanitaire-la")}{" "}
            <strong>{t("gestion-des-batiments")}</strong>
            {t("la")} <strong>{t("surete")}</strong>{" "}
            {t("surveillance-securite-incendie-le")}{" "}
            <strong>{t("bien-etre-au-travail")}</strong>{" "}
            {t(
              "location-de-machines-a-cafe-et-fontaines-a-eau-livraison-de-fruits-et-collations-ainsi-que-le"
            )}
            <strong>{t("confort-des-occupants")}</strong>{" "}
            {t("reception-courrier-espaces-verts")}
          </p>
          <p>
            {t("le-but-est-d")}
            <strong>{t("optimiser-les-couts")}</strong>{" "}
            {t("associes-a-letablissement-dun")}{" "}
            <strong>{t("environnement-de-travail-efficace-et-sain")}</strong>.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      question: t(
        "quels-services-inclut-notre-solution-de-facility-management-pour-les-entreprises"
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
              {t("une-offre-complete")}{" "}
              <strong>{t("multiservices-a-la-carte")}</strong>{" "}
              {t(
                "proprete-securite-maintenance-boissons-et-collations-office-manager-externalise-via-un"
              )}{" "}
              <strong>{t("comparateur-en-ligne")}</strong>{" "}
              {t("des-offres-de-nos-differents-fournisseurs-partenaires")}
            </li>
            <li>
              {t("le")} <strong>{t("pilotage-et-la-gestion")}</strong>{" "}
              {t(
                "des-services-devis-cahier-des-charges-contrats-factures-planification"
              )}
            </li>
            <li>
              {t("un")} <strong>{t("back-office")}</strong>{" "}
              {t(
                "pour-les-clients-et-les-fournisseurs-mise-a-jour-des-tarifs-pages-produits-signature-des-contrats-plannings-dintervention"
              )}
            </li>
            <li>
              {t("un")} <strong>{t("accompagnement")}</strong>{" "}
              {t("support-reclamations-controles-qualite")}
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
            {t("l")}
            <strong>{t("externalisation-des-services-generaux")}</strong>{" "}
            {t("presente-de-nombreux-avantages-pour-les-entreprises")}
          </p>
          <ul className="list-disc  ml-6">
            <li>
              <strong>{t("gain-de-temps")}</strong>{" "}
              {t(
                "vous-deleguez-la-gestion-de-vos-services-et-vous-vous-concentrez-sur-votre-coeur-de-metier"
              )}
            </li>
            <li>
              <strong>{t("optimisation-des-couts")}</strong>{" "}
              {t(
                "en-passant-par-notre-plateforme-de-facility-management-vous-profitez-de-tarifs-competitifs"
              )}
            </li>
            <li>
              <strong>{t("flexibilite")}</strong>{" "}
              {t(
                "nous-pouvons-adapter-rapidement-vos-contrats-a-levolution-de-vos-besoins"
              )}
            </li>
            <li>
              <strong>{t("qualite")}</strong>{" "}
              {t(
                "nos-prestataires-sont-selectionnes-selon-des-criteres-stricts-de-conformite-et-de-qualite"
              )}
            </li>
          </ul>
          <p>
            {t("cette-approche-est-pour-vous-lassurance-dune")}{" "}
            <strong>{t("tranquilite-desprit")}</strong> {t("et-dun")}{" "}
            <strong>{t("environnement-de-travail-sain-et-performant")}</strong>.
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
              <strong>{t("tpe-pme")}</strong>{" "}
              {t(
                "qui-souhaitent-optimiser-leurs-couts-et-ameliorer-leur-environnement-de-travail"
              )}
            </li>
            <li>
              <strong>{t("start-ups/scale-ups")}</strong>{" "}
              {t(
                "qui-ont-besoin-de-flexibilite-et-dagilite-dans-la-gestion-de-leurs-services"
              )}
            </li>
            <li>
              <strong>{t("cabinets-medicaux")}</strong>{" "}
              {t(
                "qui-necessitent-des-services-adaptes-a-leurs-normes-dhygiene"
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
            {t("pour-choisir-convenablement-votre")}{" "}
            <strong>{t("societe-de-facility-management")}</strong>
            {t("vous-devez-tenir-compte-des-criteres-suivants")}
          </p>
          <ul className="list-disc  ml-6">
            <li>
              <strong>{t("lexperience-et-les-references")}</strong>
              {t("dans-votre-secteur-dactivite")}
            </li>
            <li>
              {t("la-capacite-a-offrir-une")}{" "}
              <strong>{t("proposition-sur-mesure-et-evolutive")}</strong>
            </li>
            <li>
              {t("la-transparence-et-les")}{" "}
              <strong>{t("engagements-contractuels")}</strong>
            </li>
            <li>
              {t("le-respect-des-normes-et-des")}{" "}
              <strong>{t("bonnes-pratiques")}</strong>
            </li>
            <li>
              {t("une-approche")} <strong>{t("durable-et-innovante")}</strong>
            </li>
          </ul>
          <p>
            {t("un-bon-partenaire-conjuguera")}{" "}
            <strong>
              {t("performance-operationnelle-qualite-de-service")}
            </strong>{" "}
            {t("et-prise-en-compte-de-vos-objectifs-strategiques")}
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
