import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "prestataires",
    locale,
    locale === "fr"
      ? "Devenez prestataire de services pour entreprise"
      : "Become a service provider for businesses",
    locale === "fr"
      ? "Vous êtes prestataire de service ? fm4all vous propose de devenir partenaire."
      : "Are you a service provider? fm4all invites you to become a partner."
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PrestatairesPage");
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="text-sm lg:text-base flex flex-wrap">
          <BreadcrumbLink className="flex items-center" href={`/`}>
            <HomeIcon size={14} />
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{t("devenir-prestataire")}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("devenir-prestataire")}</h1>
        <div className="flex flex-col gap-6 text-lg w-full max-w-prose mx-auto hyphens-auto text-wrap">
          <h2 className="text-center font-bold">
            {t("vous-etes-prestataire-de-service")} <br />
            {t("vous-cherchez-a-developper-votre-activite")}
          </h2>
          <p className="text-center">
            {t("fm4all-vous-propose-de-devenir-partenaire")}
          </p>
        </div>
        <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap text-lg">
          <ul className="ml-10 md:ml-20">
            <li className="list-rocket">{t("apports-d-affaires-gratuits")}</li>
            <li className="list-rocket">
              {t("paiement-garanti-zero-risque-recouvrement")}
            </li>{" "}
            <li className="list-rocket">
              {t("gestion-administrative-deleguee-zero-devis-zero-paperasse")}
            </li>
            <li className="list-rocket">
              {t(
                "obtenez-des-leads-gratuits-pour-developper-votre-activite-de-services"
              )}
            </li>
            <li className="list-rocket">
              {t(
                "devenez-partenaires-de-la-1ere-plateforme-d-achat-de-services-fm-pour-les-utilisateurs-de-bureaux-sans-limites-de-taille"
              )}
            </li>
            <li className="list-rocket">
              {t(
                "100-gratuit-notre-plateforme-vous-apporte-des-clients-qualifies-selon-les-services-que-vous-proposez"
              )}
            </li>
            <li className="list-rocket">
              {t("c-est-vous-qui-fixez-vos-regles-vos-prix-et-vos-contraintes")}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            {t("nos-engagements")}
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <ul className="ml-10 md:ml-20">
              <li className="list-thumb">
                {t("apports-d-affaires-sans-aucun-frais")}
              </li>
              <li className="list-thumb">
                {t(
                  "paiement-garanti-nous-garantissons-les-paiements-pas-le-client-final"
                )}
              </li>
              <li className="list-thumb">
                {t(
                  "gain-de-temps-pas-de-devis-de-contrat-ou-de-cdc-a-realiser-nous-nous-chargeons-de-tout"
                )}
              </li>
              <li className="list-thumb">
                {t(
                  "gestion-du-quotidien-nous-gerons-la-relation-client-les-reclamations-et-la-facturation"
                )}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            {t("votre-contrepartie")}
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <ul className="ml-10 md:ml-20">
              <li className="list-handshake">
                {t(
                  "contrat-cadre-vos-tarifs-sont-fixes-pendant-12-mois-puis-revision-annuelle"
                )}
              </li>
              <li className="list-handshake">
                {t("vous-acceptez-des-contrats-a-duree-indeterminee")}
              </li>
              <li className="list-handshake">
                {t(
                  "vous-intervenez-sur-paris-et-en-idf-possible-d-exclure-certaines-zones"
                )}
              </li>
              <li className="list-handshake">
                {t("vous-garantissez-la-qualite-de-vos-services")}
              </li>
              <li className="list-handshake">
                {t(
                  "vous-etes-reactif-professionnel-et-proche-de-vos-sites-clients"
                )}
              </li>
              <li className="list-handshake">
                {t(
                  "vous-appliquez-des-tarifs-preferentiels-reflets-du-gain-de-temps-administratif-commercial-recouvrement-vous-garantissez-un-prix-au-moins-5-inferieur-a-vos-tarifs-habituels"
                )}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            {t("le-benefice-client")}
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <ul className="ml-10 md:ml-20">
              <li className="list-smile">
                {t("un-grand-choix-de-prestations-sur-une-meme-plateforme")}
              </li>
              <li className="list-smile">{t("des-tarifs-preferentiels")}</li>
              <li className="list-smile">
                {t(
                  "un-seul-point-de-contact-pour-gerer-tous-les-services-au-bureau"
                )}
              </li>
              <li className="list-smile">
                {t("un-office-manager-present-sur-site-selon-ses-besoins")}
              </li>
              <li className="list-smile">
                {t("un-outil-de-pilotage-en-ligne-performant")}
              </li>
            </ul>
          </div>
        </div>
        <CTAContactButtons />
      </article>
    </main>
  );
};

export default page;
