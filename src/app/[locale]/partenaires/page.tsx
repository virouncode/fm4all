import CTAContactButtons from "@/components/cta-contact-buttons";
import { generateAlternates } from "@/lib/metadata-helpers";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import Partenaires from "../../Partenaires";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "partenaires",
    locale,
    locale === "fr"
      ? "Nos partenaires prestataires de services"
      : "Our partner service providers",
    locale === "fr"
      ? "Avec nos partenaires, nous établissons une collaboration fondée sur la qualité et la confiance"
      : "With our partners, we build a collaboration founded on quality and trust."
  );
};

const page = async () => {
  const t = await getTranslations("PartenairesPage");
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">
        {t("nos-prestataires-partenaires")}
      </h1>
      <article className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold">
            {t("une-collaboration-fondee-sur-la-qualite-et-la-confiance")}
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/partenaires.webp"}
              alt="illustration-partenaires"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            {t(
              "chez-fm4all-nos-partenaires-sont-bien-plus-que-de-simples-prestataires-ils-sont-des-acteurs-essentiels-de-notre-mission-doffrir-des-services-de-qualite-a-nos-clients-cest-pourquoi-nous-avons-mis-en-place-un-processus-de-selection-rigoureux-et-exigeant-ainsi-quun-cadre-de-suivi-collaboratif-base-sur-des-engagements-clairs-et-partages"
            )}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("un-processus-de-selection-exigeant")}
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            {t(
              "nous-ne-travaillons-quavec-des-partenaires-qui-partagent-nos-valeurs-dexcellence-de-fiabilite-et-de-respect-notre-selection-repose-sur-plusieurs-criteres-cles"
            )}
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              {t(
                "experience-et-expertise-les-prestataires-doivent-justifier-dune-experience-reconnue-et-dune-expertise-averee-dans-leur-domaine-dactivite"
              )}
            </li>
            <li className="list-disc">
              {t(
                "references-verifiables-chaque-candidat-est-evalue-sur-la-base-de-ses-realisations-passees-et-des-recommandations-de-ses-clients-existants"
              )}
            </li>
            <li className="list-disc">
              {t(
                "capacite-dadaptation-nous-privilegions-des-partenaires-capables-de-repondre-rapidement-et-efficacement-aux-besoins-specifiques-de-nos-clients"
              )}
            </li>
            <li className="list-disc">
              {t(
                "respect-des-normes-tous-les-prestataires-doivent-se-conformer-aux-normes-reglementaires-et-aux-meilleures-pratiques-de-leur-secteur"
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("une-charte-de-partenariat-engageante")}
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            {t(
              "pour-garantir-un-service-irreprochable-nous-demandons-a-nos-partenaires-de-signer-une-charte-de-qualite-et-de-responsabilite-cette-charte-inclut-des-engagements-forts"
            )}
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              {t(
                "qualite-de-service-maintenir-un-haut-niveau-de-prestation-conformement-aux-attentes-des-clients-et-aux-standards-de-fm4all"
              )}
            </li>
            <li className="list-disc">
              {t(
                "reactivite-et-transparence-assurer-une-communication-fluide-traiter-rapidement-les-reclamations-et-partager-les-informations-necessaires-pour-un-suivi-efficace"
              )}
            </li>
            <li className="list-disc">
              {t(
                "engagement-environnemental-privilegier-des-pratiques-ecoresponsables-comme-lutilisation-de-produits-durables-et-le-respect-des-principes-de-developpement-durable"
              )}
            </li>
            <li className="list-disc">
              {t(
                "ethique-professionnelle-respecter-les-droits-des-employes-garantir-des-conditions-de-travail-justes-et-adopter-une-conduite-exemplaire"
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("un-suivi-continu-pour-une-qualite-durable")}
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            {t(
              "collaborer-avec-fm4all-cest-rejoindre-un-reseau-ou-la-qualite-est-une-priorite-permanente-nous-effectuons"
            )}
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              {t(
                "des-audits-reguliers-pour-evaluer-la-performance-des-prestations-et-identifier-les-axes-damelioration"
              )}
            </li>
            <li className="list-disc">
              {t(
                "un-suivi-des-retours-clients-les-retours-des-utilisateurs-finaux-sont-systematiquement-pris-en-compte-pour-ajuster-les-prestations-si-necessaire"
              )}
            </li>
            <li className="list-disc">
              {t(
                "des-points-de-contact-dedies-nos-partenaires-beneficient-dun-interlocuteur-unique-pour-faciliter-les-echanges-et-garantir-une-collaboration-harmonieuse"
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("des-avantages-pour-nos-partenaires")}
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            {t(
              "rejoindre-le-reseau-fm4all-cest-aussi-beneficier-de-nombreux-avantages"
            )}
          </p>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              {t(
                "une-visibilite-accrue-accedez-a-un-portefeuille-de-clients-diversifie-et-en-constante-expansion"
              )}
            </li>
            <li className="list-disc">
              {t(
                "un-accompagnement-administratif-nous-prenons-en-charge-la-gestion-contractuelle-la-facturation-et-les-aspects-administratifs-pour-vous-permettre-de-vous-concentrer-sur-votre-coeur-de-metier"
              )}
            </li>
            <li className="list-disc">
              {t(
                "des-opportunites-de-croissance-integrez-un-ecosysteme-dynamique-qui-favorise-la-montee-en-competences-et-levolution-professionnelle"
              )}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-6">
          <p className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("rejoignez-une-communaute-engagee")}
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            {t(
              "chez-fm4all-nous-croyons-en-la-force-des-partenariats-pour-batir-un-environnement-de-travail-performant-et-harmonieux-nos-partenaires-ne-sont-pas-choisis-au-hasard-ils-incarnent-la-fiabilite-la-qualite-et-lexcellence-que-nous-souhaitons-offrir-a-nos-clients"
            )}
          </p>
          <p
            className="text-lg max-w-prose mx-auto
          hyphens-auto text-wrap"
          >
            {t(
              "vous-etes-un-prestataire-qui-partage-nos-valeurs-rejoignez-notre-reseau-et-contribuez-a-transformer-la-gestion-des-services-generaux-en-une-experience-simple-efficace-et-ethique"
            )}
          </p>
        </div>
        <Partenaires />
        <CTAContactButtons />
      </article>
    </main>
  );
};

export default page;
