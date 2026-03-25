import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import WhyCards from "@/components/cards/WhyCards";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "engagements",
    locale,
    locale === "fr"
      ? "Nos engagements : Qualité, Simplicité, Gain de temps, Suivi"
      : "Our commitments: Quality, Simplicity, Time saving, Monitoring",
    locale === "fr"
      ? "Nos engagements pour les services aux entreprises : Qualité, Simplicité, Gain de temps, Suivi opérationnel personnalisé. Vos attentes au coeur de nos priorités."
      : "Our commitments for your business services: Quality, Simplicity, Time saving, Personalized operational monitoring. Your expectations at the heart of our goals.",
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("EngagementsPage");
  return (
    <main className="mx-auto mb-24 max-w-7xl px-6 py-4 md:px-20">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="flex flex-wrap text-sm lg:text-base">
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center" asChild>
              <Link href={`/`} title={t("accueil")}>
                <HomeIcon size={14} />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("nos-engagements")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="mt-6 mb-10 text-4xl">{t("nos-engagements")}</h1>
      <article className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="mx-auto max-w-prose font-bold text-wrap hyphens-auto">
            {t(
              "chez-fm4all-nous-avons-a-coeur-de-batir-des-relations-de-confiance-et-de-fournir-des-services-dexcellence-nos-engagements-refletent-notre-volonte-de-placer-vos-besoins-vos-attentes-et-vos-valeurs-au-centre-de-nos-priorites",
            )}
          </p>
          <WhyCards className="my-10" />
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t("chez-fm4all-nous-avons-concu-nos")}{" "}
            <Link
              href="/services"
              title="fm4all services"
              aria-label="fm4all-services"
              className="underline hover:opacity-80"
            >
              services
            </Link>{" "}
            {t(
              "pour-repondre-aux-besoins-essentiels-de-vos-activites-avec-une-approche-basee-sur-cinq-piliers-fondamentaux-simplicite-rapidite-fiabilite-serenite-et-optimisation-des-couts-ces-engagements-sont-au-coeur-de-notre-mission-vous-offrir-une-gestion-sans-effort-et-des-prestations-a-la-hauteur-de-vos-attentes",
            )}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("simplicite")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "nous-vous-simplifions-la-vie-en-prenant-en-charge-tous-les-aspects-lies-a-vos-services-generaux",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "gestion-centralisee-une-plateforme-unique-pour-gerer-vos-contrats-vos-factures-et-vos-reclamations",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "selection-cle-en-main-nos-prestataires-ont-ete-rigoureusement-choisis-pour-vous-eviter-des-recherches-fastidieuses",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "experience-fluide-des-processus-simplifies-et-des-outils-intuitifs-pour-un-gain-de-temps-immediat",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">{t("rapidite")}</p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "votre-temps-est-precieux-et-nous-nous-engageons-a-agir-avec-efficacite",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "reactivite-maximale-nos-equipes-sont-disponibles-pour-repondre-a-vos-demandes-et-intervenir-rapidement-en-cas-de-besoin",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "mises-en-relation-rapides-trouvez-les-prestataires-adaptes-a-vos-besoins-en-un-clic-grace-a-notre-plateforme",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "traitement-accelere-que-ce-soit-pour-une-reclamation-ou-un-ajustement-contractuel-nous-agissons-sans-delai",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">{t("fiabilite")}</p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "faites-confiance-a-des-experts-pour-garantir-des-prestations-irreprochables",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "partenaires-qualifies-tous-nos-prestataires-sont-selectionnes-selon-des-criteres-stricts-de-qualite-dexpertise-et-de-serieux",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "controles-reguliers-nous-verifions-systematiquement-la-conformite-des-services-pour-garantir-votre-satisfaction",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "engagement-sur-la-duree-nous-veillons-a-la-bonne-tenue-de-vos-contrats-et-a-la-constance-des-prestations",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">{t("serenite")}</p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "travaillez-en-toute-tranquillite-desprit-grace-a-notre-accompagnement-complet",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "point-de-contact-unique-nous-sommes-votre-interlocuteur-dedie-pour-gerer-toutes-les-etapes-des-contrats-aux-eventuels-litiges",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "suivi-personnalise-nos-equipes-vous-accompagnent-pour-garantir-une-execution-optimale-de-vos-prestations",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "qualite-garantie-vous-pouvez-vous-concentrer-sur-votre-coeur-dactivite-pendant-que-nous-nous-occupons-du-reste",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("optimisation-des-couts")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "nous-vous-aidons-a-maitriser-vos-depenses-tout-en-maintenant-un-haut-niveau-de-service",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "solutions-adaptees-nos-gammes-essentiel-confort-excellence-sajustent-a-vos-besoins-et-a-votre-budget",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "economies-directes-et-indirectes-en-optimisant-la-gestion-administrative-et-en-reduisant-les-efforts-internes-nous-diminuons-vos-couts-caches",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "transparence-tarifaire-vous-beneficiez-de-tarifs-competitifs-et-dune-visibilite-complete-sur-vos-depenses",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("travaillons-ensemble-pour-une-gestion-optimisee-et-sereine")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "en-nous-confiant-vos-services-generaux-vous-faites-le-choix-dune-approche-moderne-responsable-et-centree-sur-vos-priorites-avec-fm4all-vous-gagnez-du-temps-reduisez-vos-efforts-et-optimisez-vos-ressources-tout-en-vous-assurant-des-prestations-fiables-et-rapides",
            )}
          </p>
          <p className="mx-auto mb-10 max-w-prose text-wrap hyphens-auto">
            {t(
              "pret-a-simplifier-votre-quotidien-contactez-nous-des-aujourdhui-et-decouvrez-comment-nous-pouvons-transformer-la-gestion-de-vos-services",
            )}
          </p>
          <CTAContactButtons />
        </div>
        <hr />
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("1-qualite-et-excellence-au-service-de-nos-clients")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "nous-nous-engageons-a-vous-offrir-des-prestations-irreprochables-adaptees-a-vos-exigences",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "selection-rigoureuse-des-partenaires-tous-nos-prestataires-sont-minutieusement-choisis-selon-des-criteres-stricts-de-qualite-de-fiabilite-et-dexpertise",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "controles-reguliers-nous-evaluons-en-continu-la-performance-des-services-fournis-pour-garantir-un-haut-niveau-de-satisfaction",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "flexibilite-et-personnalisation-que-vous-soyez-une-tpe-ou-une-grande-entreprise-nos-solutions-sadaptent-a-vos-besoins-specifiques",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("2-transparence-et-gestion-simplifiee")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "notre-plateforme-est-concue-pour-vous-offrir-une-experience-fluide-et-sans-surprise",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "gestion-centralisee-contrats-factures-reclamations-tout-est-regroupe-pour-vous-faire-gagner-du-temps",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "communication-claire-vous-beneficiez-dun-suivi-detaille-et-dun-acces-en-temps-reel-aux-informations-de-vos-prestations",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "zero-souci-administratif-nous-nous-occupons-de-toute-la-gestion-pour-que-vous-puissiez-vous-concentrer-sur-votre-coeur-dactivite",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("3-engagement-ecologique-et-responsable")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "nous-croyons-en-un-avenir-durable-et-integrons-des-pratiques-ecoresponsables-dans-chacun-de-nos-services",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "sourcing-responsable-nos-produits-tels-que-les-cafes-snacks-ou-fruits-frais-sont-selectionnes-avec-soin-aupres-de-fournisseurs-privilegiant-des-filieres-ethiques-et-locales",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "reduction-des-dechets-nous-favorisons-des-solutions-respectueuses-de-lenvironnement-comme-les-fontaines-a-eau-sur-reseau-plutot-que-les-bouteilles-en-plastique",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "optimisation-energetique-nos-equipements-et-partenaires-suivent-des-normes-strictes-pour-limiter-leur-empreinte-carbone",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("4-inclusion-et-solidarite")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "nous-nous-engageons-a-collaborer-avec-des-entreprises-adaptees-et-a-encourager-linclusion-sociale",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "partenariat-avec-des-entreprises-adaptees-vous-avez-la-possibilite-de-soutenir-lemploi-de-personnes-en-situation-de-handicap-en-choisissant-nos-prestations",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "diversite-et-egalite-nous-travaillons-avec-des-partenaires-respectant-des-politiques-inclusives-et-equitables",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("5-engagement-humain")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "nous-savons-que-la-reussite-passe-avant-tout-par-des-relations-humaines-fortes",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "formation-et-encadrement-nos-equipes-beneficient-dune-formation-continue-pour-maintenir-leurs-competences-et-leur-motivation",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "proximite-et-ecoute-nos-equipes-sont-disponibles-pour-repondre-a-vos-questions-et-trouver-des-solutions-a-vos-problematiques",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "soutien-continu-quil-sagisse-de-resoudre-un-litige-ou-doptimiser-vos-services-nous-restons-a-vos-cotes-tout-au-long-de-notre-collaboration",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "satisfaction-client-votre-bien-etre-et-celui-de-vos-collaborateurs-sont-notre-priorite-absolue",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("travaillons-ensemble-pour-un-avenir-durable-et-performant")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "en-choisissant-fm4all-vous-faites-le-choix-dun-partenaire-fiable-engage-et-a-lecoute-nous-ne-nous-contentons-pas-de-vous-accompagner-nous-nous-investissons-pleinement-pour-garantir-votre-satisfaction-et-celle-de-vos-equipes",
            )}
          </p>
          <p className="mx-auto mb-10 max-w-prose text-wrap hyphens-auto">
            {t(
              "envie-den-savoir-plus-sur-nos-engagements-ou-nos-services-contactez-nous-des-aujourdhui",
            )}
          </p>
          <CTAContactButtons />
        </div>
      </article>
    </main>
  );
};

export default page;
