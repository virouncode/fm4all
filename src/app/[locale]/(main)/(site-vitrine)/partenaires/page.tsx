import Partenaires from "@/app/[locale]/(main)/(site-vitrine)/(home)/Partenaires";
import CTAContactButtonsNoConversion from "@/components/buttons/cta-contact-buttons-no-conversion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "partenaires",
    locale,
    locale === "fr"
      ? "Nos prestataires de services aux entreprises"
      : "Our business service providers",
    locale === "fr"
      ? "Avec nos partenaires, nous établissons une collaboration fondée sur la qualité et la confiance"
      : "With our partners, we build a collaboration founded on quality and trust.",
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
  const t = await getTranslations("PartenairesPage");
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
            <BreadcrumbPage>{t("nos-prestataires-partenaires")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6 mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl">{t("nos-prestataires-partenaires")}</h1>
        <Button
          title={locale === "fr" ? "Devenir prestataire" : "Become a provider"}
          className="items-center justify-center min-[600px]:flex"
          size="lg"
          asChild
        >
          <Link href="/prestataire">
            {locale === "fr" ? "Devenir prestataire" : "Become a provider"}
          </Link>
        </Button>
      </div>
      <article className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="mx-auto max-w-prose font-bold text-wrap hyphens-auto">
            {t("une-collaboration-fondee-sur-la-qualite-et-la-confiance")}
          </p>
          <div className="relative mx-auto h-[400px] w-full overflow-hidden rounded-lg md:w-3/4">
            <Image
              src={"/img/partenaires.webp"}
              alt="illustration-partenaires"
              className="object-cover object-center"
              fill
              sizes="100vw"
              priority
              fetchPriority="high"
            />
          </div>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "chez-fm4all-nos-partenaires-sont-bien-plus-que-de-simples-prestataires-ils-sont-des-acteurs-essentiels-de-notre-mission-doffrir-des-services-de-qualite-a-nos-clients-cest-pourquoi-nous-avons-mis-en-place-un-processus-de-selection-rigoureux-et-exigeant-ainsi-quun-cadre-de-suivi-collaboratif-base-sur-des-engagements-clairs-et-partages",
            )}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("un-processus-de-selection-exigeant")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "nous-ne-travaillons-quavec-des-partenaires-qui-partagent-nos-valeurs-dexcellence-de-fiabilite-et-de-respect-notre-selection-repose-sur-plusieurs-criteres-cles",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "experience-et-expertise-les-prestataires-doivent-justifier-dune-experience-reconnue-et-dune-expertise-averee-dans-leur-domaine-dactivite",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "references-verifiables-chaque-candidat-est-evalue-sur-la-base-de-ses-realisations-passees-et-des-recommandations-de-ses-clients-existants",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "capacite-dadaptation-nous-privilegions-des-partenaires-capables-de-repondre-rapidement-et-efficacement-aux-besoins-specifiques-de-nos-clients",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "respect-des-normes-tous-les-prestataires-doivent-se-conformer-aux-normes-reglementaires-et-aux-meilleures-pratiques-de-leur-secteur",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("une-charte-de-partenariat-engageante")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "pour-garantir-un-service-irreprochable-nous-demandons-a-nos-partenaires-de-signer-une-charte-de-qualite-et-de-responsabilite-cette-charte-inclut-des-engagements-forts",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "qualite-de-service-maintenir-un-haut-niveau-de-prestation-conformement-aux-attentes-des-clients-et-aux-standards-de-fm4all",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "reactivite-et-transparence-assurer-une-communication-fluide-traiter-rapidement-les-reclamations-et-partager-les-informations-necessaires-pour-un-suivi-efficace",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "engagement-environnemental-privilegier-des-pratiques-ecoresponsables-comme-lutilisation-de-produits-durables-et-le-respect-des-principes-de-developpement-durable",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "ethique-professionnelle-respecter-les-droits-des-employes-garantir-des-conditions-de-travail-justes-et-adopter-une-conduite-exemplaire",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("un-suivi-continu-pour-une-qualite-durable")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "collaborer-avec-fm4all-cest-rejoindre-un-reseau-ou-la-qualite-est-une-priorite-permanente-nous-effectuons",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "des-audits-reguliers-pour-evaluer-la-performance-des-prestations-et-identifier-les-axes-damelioration",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "un-suivi-des-retours-clients-les-retours-des-utilisateurs-finaux-sont-systematiquement-pris-en-compte-pour-ajuster-les-prestations-si-necessaire",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "des-points-de-contact-dedies-nos-partenaires-beneficient-dun-interlocuteur-unique-pour-faciliter-les-echanges-et-garantir-une-collaboration-harmonieuse",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("des-avantages-pour-nos-partenaires")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "rejoindre-le-reseau-fm4all-cest-aussi-beneficier-de-nombreux-avantages",
            )}
          </p>
          <ul className="flex max-w-prose flex-col gap-4 text-wrap hyphens-auto md:mx-auto">
            <li className="list-disc md:ml-10">
              {t(
                "une-visibilite-accrue-accedez-a-un-portefeuille-de-clients-diversifie-et-en-constante-expansion",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "un-accompagnement-administratif-nous-prenons-en-charge-la-gestion-contractuelle-la-facturation-et-les-aspects-administratifs-pour-vous-permettre-de-vous-concentrer-sur-votre-coeur-de-metier",
              )}
            </li>
            <li className="list-disc md:ml-10">
              {t(
                "des-opportunites-de-croissance-integrez-un-ecosysteme-dynamique-qui-favorise-la-montee-en-competences-et-levolution-professionnelle",
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("rejoignez-une-communaute-engagee")}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t(
              "chez-fm4all-nous-croyons-en-la-force-des-partenariats-pour-batir-un-environnement-de-travail-performant-et-harmonieux-nos-partenaires-ne-sont-pas-choisis-au-hasard-ils-incarnent-la-fiabilite-la-qualite-et-lexcellence-que-nous-souhaitons-offrir-a-nos-clients",
            )}
          </p>
          <p className="mx-auto max-w-prose text-wrap hyphens-auto">
            {t("vous-etes-un-prestataire-qui-partage-nos-valeurs")}{" "}
            <Link href="/prestataire" className="underline hover:opacity-80">
              {t("rejoignez-notre-reseau")}
            </Link>{" "}
            {t(
              "et-contribuez-a-transformer-la-gestion-des-services-generaux-en-une-experience-simple-efficace-et-ethique",
            )}
          </p>
        </div>
        <Partenaires />
        <CTAContactButtonsNoConversion email="prestataire@fm4all.com" />
      </article>
    </main>
  );
};

export default page;
