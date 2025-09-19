import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "gammes",
    locale,
    locale === "fr"
      ? "Nos 3 gammes de services aux entreprises"
      : "Our 3 business service tiers",
    locale === "fr"
      ? "Découvrez nos 3 gammes de services aux entreprises : Essentiel, Confort et Excellence. Des solutions adaptées pour vos services à Paris & Île-de-France."
      : "Discover our 3 business service packages: Essential, Comfort, and Excellence. Tailored solutions for your office services in Paris & Île-de-France.",
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const tGlobal = await getTranslations("Global");
  const t = await getTranslations("GammesPage");
  return (
    <main className="mx-auto mb-24 max-w-7xl px-6 py-4 md:px-20">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="flex flex-wrap text-sm lg:text-base">
          <BreadcrumbItem>
            <BreadcrumbLink
              className="flex items-center"
              href={`/`}
              title={t("accueil")}
            >
              <HomeIcon size={14} />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("nos-3-gammes")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("nos-3-gammes")}</h1>
        <div className="mx-auto flex w-full flex-col gap-10 text-wrap hyphens-auto">
          <div className="flex flex-col gap-10">
            <p className="mx-auto max-w-prose text-center text-pretty">
              {t(
                "afin-de-simplifier-vos-choix-nous-avons-decline-l-ensemble-des-services-en",
              )}{" "}
              <Link
                href={"/services"}
                className="underline hover:opacity-80"
                title="fm4all services"
                aria-label="fm4all services"
              >
                services
              </Link>{" "}
              <strong>{t("3-gammes")}</strong> :
            </p>
            <div className="mb-10 flex flex-wrap justify-center gap-10 text-2xl">
              <div className="bg-fm4allessential w-48 rounded-lg px-6 py-10 text-center font-bold text-slate-200">
                {tGlobal("essentiel")}
              </div>
              <div className="bg-fm4allcomfort w-48 rounded-lg px-6 py-10 text-center font-bold text-slate-200">
                {tGlobal("confort")}
              </div>
              <div className="bg-fm4allexcellence w-48 rounded-lg px-6 py-10 text-center font-bold text-slate-200">
                {tGlobal("excellence")}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-16">
            <div className="mx-auto flex flex-col gap-8">
              <h2 className="border-fm4allessential text-fm4allessential border-l-4 px-4 text-2xl md:text-3xl">
                {t("gamme-essentiel")}
              </h2>
              <p className="mx-auto max-w-prose md:ml-10">
                {t(
                  "vous-recherchez-des-services-efficaces-et-optimises-qui-couvrent-lessentiel-sans-superflu-cette-gamme-est-faite-pour-vous-elle-vous-garantit-le-respect-des-reglementations-et-vous-apporte-les-prestations-indispensables-pour-assurer-le-bon-fonctionnement-de-votre-site-simplicite-et-efficacite-sont-au-rendez-vous",
                )}
              </p>
            </div>
            <div className="mx-auto flex flex-col gap-8">
              <h2 className="border-fm4allcomfort text-fm4allcomfort border-l-4 px-4 text-2xl md:text-3xl">
                {t("gamme-confort")}
              </h2>
              <p className="mx-auto max-w-prose md:ml-10">
                {t(
                  "pour-vous-le-bon-equilibre-entre-qualite-et-prix-est-essentiel-si-le-strict-minimum-ne-suffit-pas-la-gamme-confort-offre-une-solution-cle-en-main-sans-contraintes-vous-beneficiez-dune-gestion-complete-des-prestations-pour-un-confort-optimal-tout-en-restant-dans-une-logique-de-maitrise-des-couts",
                )}
              </p>
            </div>
            <div className="mx-auto flex flex-col gap-8">
              <h2 className="border-fm4allexcellence text-fm4allexcellence border-l-4 px-4 text-2xl md:text-3xl">
                {t("gamme-excellence")}
              </h2>
              <p className="mx-auto max-w-prose md:ml-10">
                {t(
                  "vous-placez-le-bien-etre-de-vos-collaborateurs-au-coeur-de-vos-priorites-avec-la-gamme-excellence-vous-investissez-dans-des-services-premium-qui-valorisent-votre-entreprise-et-garantissent-une-experience-optimale-lexcellence-du-service-vous-offre-une-tranquillite-desprit-totale-tout-en-renforcant-votre-marque-employeur",
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex w-full flex-col gap-6 text-wrap hyphens-auto">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("quelle-gamme-de-services-choisir")}
          </p>
          <div className="mx-auto flex flex-col justify-between gap-6 md:w-5/6 md:flex-row">
            <div className="relative hidden h-[180px] w-[300px] overflow-hidden rounded-xl lg:block">
              <Image
                src={"/img/baer_otis.webp"}
                alt={"photo Edouard Baer Asterix"}
                fill
                sizes="300px"
              />
            </div>
            <div className="flex flex-1 flex-col gap-4">
              <p>
                {t(
                  "comme-dirait-edouard-baer-il-ny-a-pas-de-bonne-ou-de-mauvaise-gamme-chaque-solution-repond-a-des-besoins-et-des-niveaux-dexigences-differents",
                )}
              </p>
              <p>
                {t(
                  "nous-noffrons-pas-de-services-low-cost-mais-des-options-adaptees-a-votre-strategie-a-votre-image-de-marque-et-a-vos-objectifs-budgetaires-vous-avez-ainsi-la-liberte-de-choisir-la-gamme-la-plus-en-phase-avec-vos-attentes-et-vos-priorites",
                )}
              </p>
            </div>
          </div>
          <p className="mx-auto md:w-5/6">
            {t(
              "pour-chaque-prestation-vous-pouvez-selectionner-un-niveau-de-gamme-qui-reflete-vos-ambitions-en-matiere-de-qualite-de-service-de-gestion-des-ressources-et-de-positionnement-strategique",
            )}
          </p>
        </div>
        <div className="mx-auto flex w-full flex-col gap-6 text-wrap hyphens-auto">
          <p className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("quels-prestataires-choisir")}
          </p>
          <p className="mx-auto md:w-5/6">
            {t(
              "la-bonne-nouvelle-cest-que-tous-les-prestataires-references-sur-notre-plateforme-ont-ete-rigoureusement-selectionnes-nous-collaborons-uniquement-avec-des-entreprises-qui-partagent-nos-valeurs-sens-du-service-reactivite-engagement-envers-la-qualite-et-tarifs-competitifs",
            )}
          </p>
          <p className="mx-auto md:w-5/6">
            {t(
              "tous-nos-partenaires-respectent-une-charte-dachat-exigeante-et-sengagent-a-respecter-nos",
            )}{" "}
            <Link href={"/cgv"} className="underline">
              {t("conditions-generales-de-vente-cgv")}
            </Link>{" "}
          </p>
          <p className="mx-auto md:w-5/6">
            {t(
              "vous-avez-donc-la-garantie-dun-service-aligne-sur-vos-attentes",
            )}
          </p>
        </div>
      </article>
    </main>
  );
};

export default page;
