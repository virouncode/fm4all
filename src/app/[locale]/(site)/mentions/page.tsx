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
    "mentions",
    locale,
    locale === "fr" ? "Mentions légales" : "Legal notice",
    locale === "fr"
      ? "Mentions légales du site fm4all.com"
      : "Legal notice of fm4all.com website",
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MentionsPage");
  return (
    <main className="mx-auto mb-24 min-h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("mentions-legales")}</h1>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("1-identification-de-l-editeur-du-site")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col hyphens-auto text-wrap lg:w-2/3">
            <p>{t("nom-de-la-societe-fm4all")}</p>
            <p>{t("forme-juridique-sas")}</p>
            <p>{t("capital-social-30-000-eur")}</p>
            <p>{t("siege-social-3-rue-de-nantes-75019-paris")}</p>
            <p>{t("numero-siret-941-928-640-00015")}</p>
            <p>{t("numero-rcs-941-928-640")}</p>
            <p>
              {t(
                "code-ape-81-10z-activites-combinees-de-soutien-lie-aux-batiments",
              )}
            </p>
            <p>{t("representant-legal-romuald-buffe-president-de-fm4all")}</p>
            <p>{t("coordonnees-de-contact")} </p>
            <ul className="ml-10 md:ml-14">
              <li className="list-disc">{t("tel-33-6-69-31-10-46")}</li>
              <li className="list-disc">{t("email-contact-fm4all-com")}</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("2-identification-de-l-hebergeur-du-site")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col hyphens-auto text-wrap lg:w-2/3">
            <p>{t("nom-de-l-hebergeur-vercel-inc")}</p>
            <p>{t("addresse-340-s-lemon-ave-4133-walnut-ca-91789-us")}</p>
            <p>{t("tel-559-288-7060")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("3-propriete-intellectuelle")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-6 hyphens-auto text-wrap lg:w-2/3">
            <p>
              {t(
                "tous-les-contenus-presents-sur-le-site-www-fm4all-com-incluant-de-maniere-non-limitative-les-graphismes-images-textes-videos-animations-sons-logos-gifs-et-icones-ainsi-que-leur-mise-en-forme-sont-la-propriete-exclusive-de-fm4all-a-l-exception-des-marques-logos-ou-contenus-appartenant-a-d-autres-societes-partenaires-ou-auteurs",
              )}
            </p>
            <p>
              {t(
                "toute-reproduction-distribution-modification-adaptation-retransmission-ou-publication-meme-partielle-de-ces-differents-elements-est-strictement-interdite-sans-l-accord-expres-par-ecrit-de-fm4all-cette-representation-ou-reproduction-par-quelque-procede-que-ce-soit-constitue-une-contrefacon-sanctionnee-par-les-articles-l-335-2-et-suivants-du-code-de-la-propriete-intellectuelle",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("4-donnees-personnelles-rgpd")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-6 hyphens-auto text-wrap lg:w-2/3">
            <p>
              {t(
                "fm4all-s-engage-a-ce-que-la-collecte-et-le-traitement-de-vos-donnees-effectues-a-partir-du-site-www-fm4all-com-soient-conformes-au-reglement-general-sur-la-protection-des-donnees-rgpd-et-a-la-loi-informatique-et-libertes",
              )}
            </p>
            <p>
              {t(
                "les-donnees-personnelles-collectees-sur-le-site-incluent-notamment-nom-prenom-adresse-email-numero-de-telephone-ces-donnees-sont-collectees-dans-le-cadre-de-demandes-d-information-de-devis-ou-lors-de-la-souscription-a-nos-services",
              )}
            </p>
            <p>
              {t(
                "les-utilisateurs-disposent-d-un-droit-d-acces-de-rectification-de-suppression-et-d-opposition-au-traitement-de-leurs-donnees-personnelles-pour-exercer-ces-droits-veuillez-nous-contacter-a-l-adresse-suivante-dpo-fm4all-com",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("5-limite-de-responsabilite")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-6 hyphens-auto text-wrap lg:w-2/3">
            <p>
              {t(
                "fm4all-s-efforce-de-fournir-sur-le-site-www-fm4all-com-des-informations-aussi-precises-que-possible-toutefois-la-societe-ne-pourra-etre-tenue-responsable-des-omissions-des-inexactitudes-et-des-carences-dans-la-mise-a-jour-qu-elles-soient-de-son-fait-ou-du-fait-des-tiers-partenaires-qui-lui-fournissent-ces-informations",
              )}
            </p>
            <p>
              {t(
                "l-utilisateur-du-site-www-fm4all-com-reconnait-disposer-de-la-competence-et-des-moyens-necessaires-pour-acceder-et-utiliser-ce-site-l-utilisateur-reconnait-egalement-avoir-verifie-que-la-configuration-informatique-utilisee-ne-contient-aucun-virus-et-qu-elle-est-en-parfait-etat-de-fonctionnement",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("6-conditions-dutilisation-du-site")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-6 hyphens-auto text-wrap lg:w-2/3">
            <p>
              {t(
                "l-utilisation-du-site-www-fm4all-com-implique-l-acceptation-pleine-et-entiere-des-conditions-generales-d-utilisation-ci-apres-decrites-ces-conditions-d-utilisation-sont-susceptibles-d-etre-modifiees-ou-completees-a-tout-moment-les-utilisateurs-du-site-sont-donc-invites-a-les-consulter-de-maniere-reguliere",
              )}
            </p>
            <p>
              {t(
                "le-site-www-fm4all-com-est-normalement-accessible-a-tout-moment-aux-utilisateurs-une-interruption-pour-raison-de-maintenance-technique-peut-etre-toutefois-decidee-par-fm4all-qui-s-efforcera-alors-de-communiquer-prealablement-aux-utilisateurs-les-dates-et-heures-de-l-intervention",
              )}
            </p>
            <p>
              {t(
                "les-utilisateurs-disposent-d-un-droit-d-acces-de-rectification-de-suppression-et-d-opposition-au-traitement-de-leurs-donnees-personnelles-pour-exercer-ces-droits-veuillez-nous-contacter-a-l-adresse-suivante-dpo-fm4all-com-0",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("7-reglement-des-litiges")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-6 hyphens-auto text-wrap lg:w-2/3">
            <p>
              {t(
                "les-presentes-mentions-legales-sont-regies-par-le-droit-francais-en-cas-de-litige-relatif-a-l-utilisation-du-site-www-fm4all-com-la-competence-exclusive-est-attribuee-aux-tribunaux-competents-de-paris-sous-reserve-d-une-attribution-de-competence-specifique-decoulant-d-un-texte-de-loi-ou-reglementaire-particulier",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("8-services-fournis")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-6 hyphens-auto text-wrap lg:w-2/3">
            <p>
              {t(
                "le-site-www-fm4all-com-a-pour-objet-de-fournir-une-information-concernant-lensemble-des-activites-de-la-societe-fm4all-sefforce-de-fournir-sur-le-site-des-informations-aussi-precises-que-possible-toutefois-elle-ne-pourra-etre-tenue-responsable-des-omissions-des-inexactitudes-et-des-carences-dans-la-mise-a-jour-quelles-soient-de-son-fait-ou-du-fait-des-tiers-partenaires-qui-lui-fournissent-ces-informations",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("9-credits-et-conception-du-site")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-6 hyphens-auto text-wrap lg:w-2/3">
            <p>{t("conception-du-site-tiao-viroun-kattygnarath")}</p>
            <p>
              {t(
                "credits-photos-et-ressources-les-credits-des-photos-videos-et-autres-ressources-multimedias-utilisees-sont-a-romuald-buffe-ou-a-defaut-sont-indiques-directement-sur-les-elements-concernes-ou-dans-une-section-dediee",
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
