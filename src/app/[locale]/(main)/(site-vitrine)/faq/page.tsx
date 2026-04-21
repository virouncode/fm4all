import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import { LocaleType } from "@/i18n/routing";
import { generatePageMetadata } from "@/lib/metadata/metadata-helpers";
import { FaqJsonLd } from "@/lib/seo/faq-jsonld";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generatePageMetadata(
    "faq",
    locale,
    locale === "fr"
      ? "Foire aux questions sur nos services aux entreprises"
      : "Frequently asked questions about business services",
    locale === "fr"
      ? "Foire aux questions sur les services aux entreprises de fm4all"
      : "Frequently asked questions about fm4all business services",
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const FAQ_PAIRS: Array<{ questionKey: string; answerKey: string }> = [
  {
    questionKey: "vous-payez-trop-cher",
    answerKey:
      "sur-fm4all-comparez-des-centaines-de-devis-aux-meilleurs-prix-en-quelques-clics",
  },
  {
    questionKey: "vous-voulez-de-meilleurs-tarifs",
    answerKey:
      "sur-fm4all-beneficiez-de-tarifs-groupes-negocies-d-une-garantie-qualite-et-d-un-suivi-professionnel",
  },
  {
    questionKey: "marre-d-avoir-des-prix-a-la-tete-du-client",
    answerKey:
      "sur-fm4all-obtenez-vos-tarifs-en-quelques-clics-en-toute-transparence",
  },
  {
    questionKey: "vous-demenagez",
    answerKey:
      "sur-fm4all-mettez-en-place-tous-les-services-necessaires-au-bon-fonctionnement-de-vos-bureaux-nous-realisons-vos-contrats-et-vos-cahiers-des-charges-nous-accompagnons-votre-installation-dans-les-meilleurs-delais",
  },
  {
    questionKey:
      "vous-vous-agrandissez-besoin-de-professionnaliser-la-gestion-de-vos-bureaux",
    answerKey:
      "avec-fm4all-deleguez-la-gestion-de-tous-vos-contrats-de-services-a-un-office-manager",
  },
  {
    questionKey: "gerez-le-nettoyage-n-est-pas-votre-coeur-de-metier",
    answerKey:
      "chez-fm4all-nous-gerons-les-services-du-quotidien-pour-que-vos-equipes-se-focalisent-sur-leurs-vrais-metiers",
  },
  {
    questionKey:
      "envie-d-attirer-et-retenir-des-talents-de-creer-une-identite-a-vos-bureaux-qui-vous-ressemble",
    answerKey:
      "passez-a-un-service-5-etoiles-chez-fm4all-nous-mettons-en-place-un-service-hospitality-et-animons-vos-bureaux-selon-votre-image",
  },
  {
    questionKey: "la-securite-de-vos-collaborateurs-est-importante-pour-vous",
    answerKey:
      "avec-fm4all-transferez-vos-risques-et-assurez-vous-de-la-conformite-reglementaire-de-vos-locaux",
  },
  {
    questionKey: "marre-de-courir-apres-des-devis",
    answerKey:
      "sur-fm4all-obtenez-des-tarifs-pour-tous-vos-services-au-bureau-en-quelques-clics",
  },
  {
    questionKey: "vous-n-etes-pas-expert-en-achats-de-services",
    answerKey:
      "essentiel-confort-ou-excellence-nous-simplifions-vos-choix-pour-vous-permettre-d-acheter-comme-des-experts",
  },
];

const page = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("FAQPage");

  const faqJsonLdItems = [
    ...FAQ_PAIRS.map(({ questionKey, answerKey }) => ({
      question: t(questionKey),
      answer: t(answerKey),
    })),
    {
      question: `${t("pas-le-temps-ni-les-ressources-pour-ecrire-un-cahier-des-charges")} ${t("gerer-un-appel-d-offres-ou-obtenir-des-devis-est-chronophage")}`,
      answer: t(
        "sur-fm4all-en-moins-de-5-min-construisez-une-offre-de-facility-management-qui-vous-ressemble-rassemblez-tous-les-services-de-vos-bureaux-sous-un-seul-contrat-une-seule-facture-et-un-seul-interlocuteur-gagner-du-temps-et-de-l-argent",
      ),
    },
  ];

  return (
    <main className="mx-auto mb-24 max-w-7xl px-6 py-4 md:px-20">
      <FaqJsonLd items={faqJsonLdItems} />
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-3xl md:text-4xl">{t("foire-aux-questions")}</h1>
        <div className="mx-auto flex w-full max-w-prose flex-col gap-6">
          {FAQ_PAIRS.map(({ questionKey, answerKey }) => (
            <div key={questionKey} className="flex flex-col gap-1">
              <h2 className="font-bold">{t(questionKey)}</h2>
              <p>{t(answerKey)}</p>
            </div>
          ))}
          <div className="mb-10 flex flex-col gap-1">
            <h2 className="font-bold">
              {t(
                "pas-le-temps-ni-les-ressources-pour-ecrire-un-cahier-des-charges",
              )}
              <br />
              {t(
                "gerer-un-appel-d-offres-ou-obtenir-des-devis-est-chronophage",
              )}
            </h2>
            <p>
              {t(
                "sur-fm4all-en-moins-de-5-min-construisez-une-offre-de-facility-management-qui-vous-ressemble-rassemblez-tous-les-services-de-vos-bureaux-sous-un-seul-contrat-une-seule-facture-et-un-seul-interlocuteur-gagner-du-temps-et-de-l-argent",
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
