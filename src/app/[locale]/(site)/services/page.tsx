import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import ServicesCards from "./ServicesCards";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "services",
    locale,
    locale === "fr"
      ? "Nos services aux entreprises à Paris & Île-de-France"
      : "Our office services in Paris",
    locale === "fr"
      ? "Découvrez nos services aux entreprises à Paris & Île-de-France : nettoyage, maintenance, sécurité incendie, machines à café, etc...Obtenez votre devis en ligne."
      : "Discover our office services in Paris & Île-de-France: cleaning, maintenance, fire safety, coffee machines, etc... Get your online quote.",
    "/img/services/fm4all.webp"
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ServicesPage");
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("nos-services")}</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap text-lg">
            <p>
              {t("fm4all-democratise-le")}{" "}
              <strong>{t("facility-management")}</strong>{" "}
              {t("a-toutes-les-tailles-d-entreprises-en-quelques-clics")}{" "}
              <strong>
                {t("configurez-les-services-utiles-a-vos-bureaux")}
              </strong>{" "}
              {t("et-confiez-nous-leur")} <strong>{t("pilotage")}</strong>{" "}
              {t("et-leur")} <strong>{t("gestion")}</strong>.
            </p>
            <p className="text-center">{t("nous-gerons-pour-vous")}</p>
          </div>
          <ServicesCards />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("pourquoi-le-fm-pour-tous")}
          </h2>
          <div className="text-lg flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              {t(
                "parce-que-nous-pensons-que-les-services-de-facility-management-ne-devraient-pas-etre-reserves-aux-grandes-entreprises"
              )}
            </p>
            <p>
              {t(
                "le-facility-management-consiste-a-confier-la-gestion-du-quotidien-dans-vos-locaux-a-un-prestataire-fm-c-est-la"
              )}{" "}
              <strong>
                {t("gestion-deleguee-de-tous-vos-contrats-de-services")}
              </strong>{" "}
              {t("qui-n-ont-pas-de-lien-avec-votre-coeur-d-activite")}
            </p>
            <p>
              <strong>
                {t(
                  "nettoyage-accueil-courrier-cafe-maintenance-reparations-suivi-reglementaire-de-vos-locaux"
                )}
              </strong>
              {t(
                "autant-de-taches-recurrentes-a-suivre-pour-le-bon-fonctionnement-de-vos-bureaux-qui-pourtant-n-apportent-pas-de-valeur-ajoutee-directe-a-votre-activite-professionnelle"
              )}
            </p>
            <p>
              {t(
                "le-facility-management-consiste-a-externaliser-la-gestion-des-prestataires-de-services-intervenant-au-quotidien-dans-vos-bureaux-cahier-des-charges-appels-d-offres-negociation-achats-contractualisation-suivi-operationnel-facturation-autant-de"
              )}{" "}
              <strong>{t("taches-chronophages")}</strong>
              {t(
                "qui-ne-font-pas-croitre-votre-business-et-pourtant-totalement-indispensables"
              )}
            </p>
            <p>
              {t(
                "auparavant-reserve-aux-grands-groupes-vous-pouvez-desormais-deleguer-cette-gestion-quelle-que-soit-la-taille-de-vos-locaux-a-fm4all"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("gagnez-du-temps-et-de-l-argent")}
          </h2>
          <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
            <p>
              {t("en-passant-par-fm4all-vous-profitez-de")}{" "}
              <strong>{t("l-expertise-d-un-professionnel-du-fm")}</strong>
              {t(
                "des-ses-partenaires-selectionnes-et-d-un-groupement-achats-specialise-dans-les-services-d-entretien-et-maintenance"
              )}
            </p>
            <p>
              <strong>
                {t("une-seule-facture-un-seul-interlocuteur-un-tarif-garanti")}
              </strong>{" "}
              {t("vous-gagnez-en-tranquillite-d-esprit-et-en-temps-de-gestion")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("hof-managers")}
          </h2>
          <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
            <p>
              {t(
                "hospitality-manager-office-manager-facility-manager-ce-sont-eux-qui-gerent-le-bon-fonctionnement-de-vos-locaux-au-quotidien-tout-en-veillant-sur-vos-collaborateurs-chez-fm4all-offrez-vous-les-services-d-un-hof-manager"
              )}{" "}
              <strong>{t("une-personne-dediee")}</strong>{" "}
              {t("chez-vous-a-partir-d-une-demi-journee-par-semaine")}
            </p>
          </div>
        </div>
      </article>
    </main>
  );
};

export default page;
