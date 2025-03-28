import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Nos 3 gammes",
  description:
    "Découvrez nos 3 gammes de services (essentiel, confort, excellence) pour le Facility Management.",
};

const page = async () => {
  const tGlobal = await getTranslations("Global");
  const t = await getTranslations("GammesPage");
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("nos-3-gammes")}</h1>
        <div className="flex flex-col gap-10 w-full mx-auto hyphens-auto text-wrap">
          <div className="flex flex-col gap-10 text-lg">
            <p className="text-center max-w-prose mx-auto text-pretty">
              {t(
                "afin-de-simplifier-vos-choix-nous-avons-decline-l-ensemble-des-services-en"
              )}{" "}
              <strong>{t("3-gammes")}</strong> :
            </p>
            <div className="flex flex-wrap gap-10 justify-center text-2xl mb-10">
              <div className="w-48 text-center px-6 py-10 bg-fm4allessential rounded-lg text-slate-200 font-bold">
                {tGlobal("essentiel")}
              </div>
              <div className="w-48 text-center px-6 py-10 bg-fm4allcomfort rounded-lg text-slate-200  font-bold">
                {tGlobal("confort")}
              </div>
              <div className="w-48 text-center px-6 py-10 bg-fm4allexcellence rounded-lg text-slate-200 font-bold">
                {tGlobal("excellence")}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allessential px-4 text-2xl md:text-3xl text-fm4allessential">
                {t("gamme-essentiel")}
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                {t(
                  "vous-recherchez-des-services-efficaces-et-optimises-qui-couvrent-lessentiel-sans-superflu-cette-gamme-est-faite-pour-vous-elle-vous-garantit-le-respect-des-reglementations-et-vous-apporte-les-prestations-indispensables-pour-assurer-le-bon-fonctionnement-de-votre-site-simplicite-et-efficacite-sont-au-rendez-vous"
                )}
              </p>
            </div>
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allcomfort px-4 text-2xl md:text-3xl text-fm4allcomfort">
                {t("gamme-confort")}
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                {t(
                  "pour-vous-le-bon-equilibre-entre-qualite-et-prix-est-essentiel-si-le-strict-minimum-ne-suffit-pas-la-gamme-confort-offre-une-solution-cle-en-main-sans-contraintes-vous-beneficiez-dune-gestion-complete-des-prestations-pour-un-confort-optimal-tout-en-restant-dans-une-logique-de-maitrise-des-couts"
                )}
              </p>
            </div>
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allexcellence px-4 text-2xl md:text-3xl text-fm4allexcellence">
                {t("gamme-excellence")}
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                {t(
                  "vous-placez-le-bien-etre-de-vos-collaborateurs-au-coeur-de-vos-priorites-avec-la-gamme-excellence-vous-investissez-dans-des-services-premium-qui-valorisent-votre-entreprise-et-garantissent-une-experience-optimale-lexcellence-du-service-vous-offre-une-tranquillite-desprit-totale-tout-en-renforcant-votre-marque-employeur"
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full mx-auto hyphens-auto text-wrap text-lg mt-10">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("quelle-gamme-de-services-choisir")}
          </p>
          <div className="flex flex-col gap-6 justify-between md:w-5/6 mx-auto md:flex-row">
            <div className="h-[180px] w-[300px] relative rounded-xl overflow-hidden hidden lg:block">
              <Image
                src={"/img/baer_otis.webp"}
                alt={"photo Edouard Baer Asterix"}
                fill={true}
              />
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <p>
                {t(
                  "comme-dirait-edouard-baer-il-ny-a-pas-de-bonne-ou-de-mauvaise-gamme-chaque-solution-repond-a-des-besoins-et-des-niveaux-dexigences-differents"
                )}
              </p>
              <p>
                {t(
                  "nous-noffrons-pas-de-services-low-cost-mais-des-options-adaptees-a-votre-strategie-a-votre-image-de-marque-et-a-vos-objectifs-budgetaires-vous-avez-ainsi-la-liberte-de-choisir-la-gamme-la-plus-en-phase-avec-vos-attentes-et-vos-priorites"
                )}
              </p>
            </div>
          </div>
          <p className="md:w-5/6 mx-auto">
            {t(
              "pour-chaque-prestation-vous-pouvez-selectionner-un-niveau-de-gamme-qui-reflete-vos-ambitions-en-matiere-de-qualite-de-service-de-gestion-des-ressources-et-de-positionnement-strategique"
            )}
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full mx-auto hyphens-auto text-wrap text-lg">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("quels-prestataires-choisir")}
          </p>
          <p className="md:w-5/6 mx-auto">
            {t(
              "la-bonne-nouvelle-cest-que-tous-les-prestataires-references-sur-notre-plateforme-ont-ete-rigoureusement-selectionnes-nous-collaborons-uniquement-avec-des-entreprises-qui-partagent-nos-valeurs-sens-du-service-reactivite-engagement-envers-la-qualite-et-tarifs-competitifs"
            )}
          </p>
          <p className="md:w-5/6 mx-auto">
            {t(
              "tous-nos-partenaires-respectent-une-charte-dachat-exigeante-et-sengagent-a-respecter-nos"
            )}{" "}
            <Link href={"/cgv"} className="underline">
              {t("conditions-generales-de-vente-cgv")}
            </Link>{" "}
          </p>
        </div>
      </article>
    </main>
  );
};

export default page;
