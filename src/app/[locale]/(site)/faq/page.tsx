import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generateAlternates(
    "faq",
    locale,
    locale === "fr"
      ? "Foire aux questions sur nos services aux entreprises"
      : "Frequently asked questions about business services",
    locale === "fr"
      ? "Foire aux questions sur les services aux entreprises de fm4all"
      : "Frequently asked questions about fm4all business services"
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("FAQPage");

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-3xl md:text-4xl">{t("foire-aux-questions")}</h1>
        <div className="flex flex-col gap-6 text-lg mx-auto w-full max-w-prose">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("vous-payez-trop-cher")}</h2>
            <p>
              {t(
                "sur-fm4all-comparez-des-centaines-de-devis-aux-meilleurs-prix-en-quelques-clics"
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              {t("vous-voulez-de-meilleurs-tarifs")}
            </h2>
            <p>
              {t(
                "sur-fm4all-beneficiez-de-tarifs-groupes-negocies-d-une-garantie-qualite-et-d-un-suivi-professionnel"
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              {t("marre-d-avoir-des-prix-a-la-tete-du-client")}
            </h2>
            <p>
              {t(
                "sur-fm4all-obtenez-vos-tarifs-en-quelques-clics-en-toute-transparence"
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("vous-demenagez")}</h2>
            <p>
              {t(
                "sur-fm4all-mettez-en-place-tous-les-services-necessaires-au-bon-fonctionnement-de-vos-bureaux-nous-realisons-vos-contrats-et-vos-cahiers-des-charges-nous-accompagnons-votre-installation-dans-les-meilleurs-delais"
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              {t(
                "vous-vous-agrandissez-besoin-de-professionnaliser-la-gestion-de-vos-bureaux"
              )}
            </h2>
            <p>
              {t(
                "avec-fm4all-deleguez-la-gestion-de-tous-vos-contrats-de-services-a-un-office-manager"
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              {t("gerez-le-nettoyage-n-est-pas-votre-coeur-de-metier")}
            </h2>
            <p>
              {t(
                "chez-fm4all-nous-gerons-les-services-du-quotidien-pour-que-vos-equipes-se-focalisent-sur-leurs-vrais-metiers"
              )}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              {t(
                "envie-d-attirer-et-retenir-des-talents-de-creer-une-identite-a-vos-bureaux-qui-vous-ressemble"
              )}
            </h2>
            <p>
              {t(
                "passez-a-un-service-5-etoiles-chez-fm4all-nous-mettons-en-place-un-service-hospitality-et-animons-vos-bureaux-selon-votre-image"
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              {t("la-securite-de-vos-collaborateurs-est-importante-pour-vous")}
            </h2>
            <p>
              {t(
                "avec-fm4all-transferez-vos-risques-et-assurez-vous-de-la-conformite-reglementaire-de-vos-locaux"
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              {t("marre-de-courir-apres-des-devis")}
            </h2>
            <p>
              {t(
                "sur-fm4all-obtenez-des-tarifs-pour-tous-vos-services-au-bureau-en-quelques-clics"
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              {t("vous-n-etes-pas-expert-en-achats-de-services")}
            </h2>
            <p>
              {t(
                "essentiel-confort-ou-excellence-nous-simplifions-vos-choix-pour-vous-permettre-d-acheter-comme-des-experts"
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">
              {t(
                "pas-le-temps-ni-les-ressources-pour-ecrire-un-cahier-des-charges"
              )}
              <br />
              {t(
                "gerer-un-appel-d-offres-ou-obtenir-des-devis-est-chronophage"
              )}
            </h2>
            <p>
              {t(
                "sur-fm4all-en-moins-de-5-min-construisez-une-offre-de-facility-management-qui-vous-ressemble-rassemblez-tous-les-services-de-vos-bureaux-sous-un-seul-contrat-une-seule-facture-et-un-seul-interlocuteur-gagner-du-temps-et-de-l-argent"
              )}
            </p>
          </div>
        </div>
        <CTAContactButtons />
      </article>
    </main>
  );
};

export default page;
