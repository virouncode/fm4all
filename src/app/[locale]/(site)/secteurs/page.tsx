import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import SecteursCards from "./SecteursCards";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "secteurs",
    locale,
    locale === "fr"
      ? "Facility Management pour tous les secteurs à Paris & Île-de-France"
      : "Facility Management for all business sectors in Paris & Île-de-France",
    locale === "fr"
      ? "fm4all accompagne tous les types d'espaces professionnels : bureaux, commerces, entrepôts, établissements de santé ou coworking. Découvrez nos solutions FM adaptées à votre secteur."
      : "fm4all supports all types of professional spaces: offices, retail stores, warehouses, healthcare facilities, or coworking spaces. Discover our FM solutions tailored to your sector.",
    "/img/services/fm4all.webp"
  );
};

const page = async () => {
  const t = await getTranslations("SecteursPage");

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("nos-secteurs-dintervention")}</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap text-lg">
            <p>
              <strong>
                {t(
                  "quel-que-soit-votre-type-despace-professionnel-fm4all-vous-propose-une-gestion-simplifiee-et-externalisee-de-vos-services"
                )}
              </strong>
            </p>
            <p>
              {t(
                "nous-croyons-que-le-facility-management-ne-doit-pas-etre-reserve-aux-grandes-entreprises-ou-aux-immeubles-ultra-modernes-avec-fm4all-beneficiez-de-services-sur-mesure-et-dun-pilotage-efficace-adaptes-a-la-realite-de-votre-secteur-dactivite"
              )}
            </p>
            <p className="text-center">{t("nous-intervenons-sur")}</p>
          </div>
          <SecteursCards />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("pourquoi-une-approche-sectorielle")}
          </h2>
          <div className="text-lg flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              {t("parce-que")}{" "}
              <strong>{t("chaque-secteur-a-ses-specificites")}</strong>
              {t(
                "ses-contraintes-techniques-ses-obligations-reglementaires-et-ses-enjeux-operationnels"
              )}
            </p>
            <p>
              {t(
                "que-vous-dirigiez-un-cabinet-medical-un-espace-de-coworking-ou-un-entrepot-logistique-nous-savons-que-vos-besoins-ne-sont-pas-les-memes-cest-pourquoi-nous-avons-concu-des-solutions-modulables-et-ciblees"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("decouvrez-les-secteurs-couverts-par-fm4all")}
          </h2>
          <div className="flex flex-col gap-8">
            <h3 className="text-xl font-bold text-center">{t("bureaux")}</h3>
            <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
              <p>
                {t(
                  "que-vous-soyez-une-pme-un-siege-social-ou-un-cabinet-professionnel-nos-services-sadaptent-a-vos-rythmes-et-a-vos-contraintes-nettoyage-cafe-maintenance-securite-tout-est-centralise"
                )}
              </p>
            </div>
            <h3 className="text-xl font-bold text-center">
              {t("locaux-commerciaux-and-retail")}
            </h3>
            <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
              <p>
                {t(
                  "assurez-lhygiene-laccueil-et-la-securite-de-vos-espaces-ouverts-au-public-nous-vous-accompagnons-dans-la-gestion-quotidienne-de-vos-services-avec-discretion-et-efficacite"
                )}
              </p>
            </div>
            <h3 className="text-xl font-bold text-center">{t("entrepots")}</h3>
            <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
              <p>
                {t(
                  "vos-sites-logistiques-necessitent-une-approche-rigoureuse-maintenance-eclairage-securite-incendie-gestion-des-nuisibles-nos-equipes-vous-proposent-des-solutions-operationnelles"
                )}
              </p>
            </div>
            <h3 className="text-xl font-bold text-center">
              {t("cabinets-medicaux")}
            </h3>
            <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
              <p>
                {t(
                  "hygiene-renforcee-suivi-des-dechets-medicaux-protocoles-stricts-nous-accompagnons-les-professionnels-de-sante-dans-le-respect-de-leurs-obligations"
                )}
              </p>
            </div>
            <h3 className="text-xl font-bold text-center">
              {t("utilisateurs-dimmeubles-entiers-tours-de-bureaux")}
            </h3>
            <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
              <p>
                <strong>
                  {t("pilotez-lensemble-de-votre-site-avec-un-seul-partenaire")}
                </strong>{" "}
                {t(
                  "fm4all-devient-votre-guichet-unique-pour-la-gestion-quotidienne-de-vos-batiments-coordination-des-prestataires-traitement-des-demandes-internes-gestion-des-services-multisites-multiservices-et-multi-utilisateurs"
                )}
              </p>
              <p>
                {t(
                  "nous-assurons-la-centralisation-et-le-suivi-de-lensemble-de-vos"
                )}
                <strong>{t("hard-services")}</strong>{" "}
                {t("maintenance-securite-incendie-et")}{" "}
                <strong>{t("soft-services")}</strong>
                {t(
                  "nettoyage-accueil-restauration-etc-grace-a-nos-outils-nous"
                )}{" "}
                <strong>{t("simplifions-la-relation-terrain")}</strong>{" "}
                {t(
                  "entre-occupants-et-prestataires-et-fluidifions-loperationnel"
                )}
              </p>
              <p>
                <strong>
                  {t("gain-de-temps-de-satisfaction-et-defficacite")}
                </strong>
                {t("fm4all-sintegre-dans-vos-processus-pour-devenir")}{" "}
                <strong>{t("linterface-de-reference")}</strong> {t("sur-site")}
              </p>
            </div>
            <h3 className="text-xl font-bold text-center">
              {t("proprietaires-et-gestionnaires-dimmeubles-de-bureaux")}
            </h3>
            <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
              <p>
                <strong>
                  {t(
                    "offrez-plus-de-services-a-vos-locataires-sans-plus-de-charge-pour-vous"
                  )}
                </strong>
                {t(
                  "vous-etes-proprietaire-ou-gestionnaire-dun-actif-tertiaire-fm4all-vous-accompagne-dans-la"
                )}{" "}
                <strong>{t("gestion-operationnelle")}</strong>{" "}
                {t(
                  "de-votre-immeuble-services-mutualises-relation-avec-les-occupants-pilotage-des-prestataires-gestion-technique-et-reglementaire"
                )}
              </p>
              <p>
                {t(
                  "allez-plus-loin-que-la-simple-gestion-des-parties-communes"
                )}
              </p>
              <ul className="ml-6 flex flex-col gap-2">
                <li className="list-disc">
                  {t("proposez-des")}{" "}
                  <strong>{t("services-a-la-carte")}</strong>{" "}
                  {t(
                    "pour-les-espaces-privatifs-de-vos-locataires-maintenance-nettoyage-prestations-ponctuelles-etc"
                  )}
                </li>
                <li className="list-disc">
                  <strong>{t("offrez-des-services-mutualises")}</strong>{" "}
                  {t("conciergerie-fontaine-a-eau-cafe-accueil")}
                </li>
                <li className="list-disc">
                  {t("utilisez-fm4all-en")}{" "}
                  <strong>{t("marque-blanche")}</strong>
                  {t(
                    "comme-un-service-en-plus-de-votre-gestion-traditionnelle"
                  )}
                </li>
              </ul>
              <p>{t("nous-assurons-lexecution-vous-conservez-la-maitrise")}</p>
              <p>
                {t(
                  "un-occupant-bien-accompagne-est-un-occupant-fidele-et-un-occupant-qui-a-deja-ses-services-operationnels-cest"
                )}{" "}
                <strong>{t("moins-de-demandes-a-traiter")}</strong>{" "}
                {t("pour-vos-equipes")}
              </p>
            </div>
            <h3 className="text-xl font-bold text-center">
              {t("erp-etablissements-recevant-du-public")}
            </h3>
            <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
              <p>
                {t(
                  "accessibilite-securite-incendie-affichages-obligatoires-nettoyage-aux-normes-nous-vous-aidons-a-repondre-a-toutes-les-obligations-legales-des-erp"
                )}
              </p>
            </div>
            <h3 className="text-xl font-bold text-center">{t("pme-pmi")}</h3>
            <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
              <p>
                {t(
                  "une-gestion-sur-mesure-adaptee-aux-entreprises-industrielles-ou-de-production-avec-un-acces-facilite-aux-services-essentiels-du-quotidien"
                )}
              </p>
            </div>
            <h3 className="text-xl font-bold text-center">
              {t("start-up-and-scale-up")}
            </h3>
            <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
              <p>
                {t(
                  "des-solutions-flexibles-evolutives-et-rapides-a-mettre-en-place-pour-soutenir-votre-croissance-moins-dadministratif-plus-de-concentration-sur-vos-objectifs"
                )}
              </p>
            </div>
            <h3 className="text-xl font-bold text-center">Co-Working</h3>
            <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
              <p>
                {t(
                  "proprete-confort-gestion-des-stocks-accueil-creez-une-experience-premium-pour-vos-membres-sans-vous-soucier-de-la-logistique"
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("un-seul-partenaire-tous-vos-services")}
          </h2>
          <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
            <p>
              <strong>
                {t(
                  "nettoyage-hygiene-maintenance-securite-accueil-cafe-petit-equipement"
                )}
              </strong>{" "}
              {t(
                "quel-que-soit-votre-secteur-nous-pilotons-pour-vous-lensemble-de-vos-contrats-de-services-generaux"
              )}
            </p>
          </div>
        </div>
      </article>
    </main>
  );
};

export default page;
