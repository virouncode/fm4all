import { generatePageMetadata } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CookiesTable from "./CookiesTable";
import { LocaleType } from "@/i18n/routing";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generatePageMetadata(
    "cookies",
    locale,
    locale === "fr" ? "Politique de cookies" : "Cookie policy",
    locale === "fr"
      ? "Lisez notre politique de cookies pour en savoir plus sur l'utilisation des cookies sur notre site."
      : "Read our cookie policy to learn more about the use of cookies on our website.",
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
  const t = await getTranslations("CookiesPage");

  const cookiesRows = [
    // Gestion du consentement
    {
      nom: "cookie_consent",
      fournisseur: t("fm4all"),
      finalite: t("memorise-le-choix-de-consentement-aux-cookies"),
      duree: t("6-mois-si-accepte-1-mois-si-refuse"),
      type: t("gestion-du-consentement"),
    },
    {
      nom: "cookie_consent_date",
      fournisseur: t("fm4all"),
      finalite: t("memorise-la-date-du-choix-de-consentement"),
      duree: t("6-mois-si-accepte-1-mois-si-refuse"),
      type: t("gestion-du-consentement"),
    },
    // Personnalisation
    {
      nom: "NEXT_LOCALE",
      fournisseur: t("librairie-next-intl"),
      finalite: t("memorise-la-langue-preferee-de-lutilisateur"),
      duree: t("indeterminee"),
      type: t("personnalisation-de-lexperience-utilisateur"),
    },
    // Analytique (après consentement)
    {
      nom: "_ga",
      fournisseur: t("google-analytics"),
      finalite: t("utilise-pour-distinguer-les-utilisateurs"),
      duree: t("2-ans"),
      type: t("suivi-analytique"),
    },
    {
      nom: "_ga_GPWGXZXVW0",
      fournisseur: t("google-analytics"),
      finalite: t(
        "identifie-de-maniere-unique-un-visiteur-sur-plusieurs-sessions",
      ),
      duree: t("2-ans"),
      type: t("suivi-analytique"),
    },
    // Publicitaire (après consentement)
    {
      nom: "_gcl_au",
      fournisseur: t("google-ads"),
      finalite: t(
        "mesure-les-conversions-publicitaires-apres-clic-sur-une-publicite-google-ads",
      ),
      duree: t("3-mois"),
      type: t("suivi-publicitaire"),
    },
    // YouTube – vidéo de présentation (youtube-nocookie.com), posés à la lecture
    {
      nom: "VISITOR_INFO1_LIVE",
      fournisseur: t("youtube-google"),
      finalite: t(
        "identifie-le-navigateur-pour-les-preferences-video-youtube",
      ),
      duree: t("6-mois"),
      type: t("fonctionnalite-video"),
    },
    {
      nom: "YSC",
      fournisseur: t("youtube-google"),
      finalite: t(
        "enregistre-les-vues-de-video-youtube-incorporee-pour-eviter-les-comptages-frauduleux",
      ),
      duree: t("session"),
      type: t("fonctionnalite-video"),
    },
    {
      nom: "AEC",
      fournisseur: t("youtube-google"),
      finalite: t(
        "assure-que-les-requetes-des-utilisateurs-ne-sont-pas-falsifiees",
      ),
      duree: t("6-mois"),
      type: t("securite"),
    },
    {
      nom: "APISID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "stockage-des-preferences-et-informations-de-session-de-l-utilisateur",
      ),
      duree: t("2-ans"),
      type: t("suivi-et-personnalisation"),
    },
    {
      nom: "HSID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "stockage-des-informations-de-session-liees-a-l-authentification-et-la-securisation-des-comptes-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-authentification"),
    },
    {
      nom: "NID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "personnaliser-les-annonces-qui-sont-affichees-sur-google-et-ses-partenaires",
      ),
      duree: t("6-mois"),
      type: t("suivi-publicitaire-et-personnalisation"),
    },
    {
      nom: "OTZ",
      fournisseur: t("youtube-google"),
      finalite: t("optimiser-la-diffusion-des-publicites"),
      duree: t("28-jours"),
      type: t("suivi-publicitaire-et-personnalisation"),
    },
    {
      nom: "SAPISID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "authentifier-un-utilisateur-lorsque-ce-dernier-est-connecte-a-son-compte-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-authentification"),
    },
    {
      nom: "SEARCH_SAMESITE",
      fournisseur: t("youtube-google"),
      finalite: t(
        "proteger-les-utilisateurs-contre-certains-types-d-attaques-en-particulier-les-attaques-de-falsification-de-requetes-inter-sites",
      ),
      duree: t("quelques-h"),
      type: t("securite-et-gestion-de-session"),
    },
    {
      nom: "SID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "maintenir-l-authentification-active-lorsque-l-utilisateur-navigue-sur-des-services-comme-gmail-google-drive-youtube",
      ),
      duree: t("2-ans"),
      type: t("securite-et-gestion-de-session"),
    },
    {
      nom: "SIDCC",
      fournisseur: t("youtube-google"),
      finalite: t(
        "renforcer-la-securite-de-la-session-de-l-utilisateur-connecte-a-son-compte-google",
      ),
      duree: t("3-mois"),
      type: t("securite-et-personnalisation"),
    },
    {
      nom: "SSID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "maintenir-la-session-d-un-utilisateur-qui-est-connecte-a-son-compte-google-en-garantissant-qu-il-ne-soit-pas-oblige-de-se-reconnecter-a-chaque-page",
      ),
      duree: t("2-ans"),
      type: t("securite-et-gestion-de-session"),
    },
    {
      nom: "__Secure-1PAPISID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "assurer-la-securite-des-sessions-utilisateurs-particulierement-dans-le-cadre-des-services-de-publicite-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-personnalisation"),
    },
    {
      nom: "__Secure-1PSID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "maintenir-et-securiser-la-session-des-utilisateurs-lorsqu-ils-sont-connectes-a-leurs-comptes-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-personnalisation"),
    },
    {
      nom: "__Secure-1PSIDCC",
      fournisseur: t("youtube-google"),
      finalite: t(
        "empecher-les-utilisateurs-d-etre-deconnectes-lorsqu-ils-naviguent-entre-les-pages-des-services-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-personnalisation"),
    },
    {
      nom: "__Secure-1PSIDTS",
      fournisseur: t("youtube-google"),
      finalite: t(
        "empecher-les-utilisateurs-d-etre-deconnectes-lorsqu-ils-naviguent-entre-les-pages-des-services-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-personnalisation"),
    },
    {
      nom: "__Secure-3PAPISID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "assurer-la-securite-des-sessions-utilisateurs-particulierement-lorsqu-ils-interagissent-avec-les-services-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-personnalisation"),
    },
    {
      nom: "__Secure-3PSID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "assurer-la-securite-des-sessions-utilisateurs-particulierement-lorsqu-ils-interagissent-avec-les-services-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-personnalisation"),
    },
    {
      nom: "__Secure-3PSIDCC",
      fournisseur: t("youtube-google"),
      finalite: t(
        "assurer-la-securite-des-sessions-utilisateurs-particulierement-lorsqu-ils-interagissent-avec-les-services-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-personnalisation"),
    },
    {
      nom: "__Secure-3PSIDTS",
      fournisseur: t("youtube-google"),
      finalite: t(
        "assurer-la-securite-des-sessions-utilisateurs-particulierement-lorsqu-ils-interagissent-avec-les-services-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-personnalisation"),
    },
    {
      nom: "__Secure-ENID",
      fournisseur: t("youtube-google"),
      finalite: t(
        "assurer-la-securite-des-sessions-utilisateurs-particulierement-lorsqu-ils-interagissent-avec-les-services-google",
      ),
      duree: t("2-ans"),
      type: t("securite-et-personnalisation"),
    },
  ];

  return (
    <main className="mx-auto mb-24 min-h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">
          {t("politique-relative-aux-cookies-de-fm4all")}
        </h1>
        <div className="md:3/4 mx-auto flex flex-col gap-6 text-wrap hyphens-auto lg:w-2/3">
          <p>{t("derniere-mise-a-jour-04-03-2025")}</p>
          <p>
            {t(
              "la-presente-politique-relative-aux-cookies-explique-comment-fm4all-and-quot-nous-and-quot-and-quot-notre-and-quot-and-quot-nos-and-quot-utilise-des-cookies-et-des-technologies-similaires-sur-son-site-web-https-www-fm4all-com-le-and-quot-site-and-quot",
            )}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("1-qu-est-ce-qu-un-cookie")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col text-wrap hyphens-auto lg:w-2/3">
            <p>
              {t(
                "les-cookies-sont-de-petits-fichiers-texte-qui-sont-places-sur-votre-ordinateur-ou-votre-appareil-mobile-lorsque-vous-visitez-un-site-web-ils-sont-largement-utilises-pour-permettre-aux-sites-web-de-fonctionner-plus-efficacement-ainsi-que-pour-fournir-des-informations-aux-proprietaires-du-site",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("2-types-de-cookies-que-nous-utilisons")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-6 text-wrap hyphens-auto lg:w-2/3">
            <p>{t("nous-utilisons-les-types-de-cookies-suivants")}</p>
            <ul className="ml-10 flex flex-col gap-4">
              <li className="list-disc">
                <strong>{t("cookies-strictement-necessaires")}</strong>{" "}
                {t(
                  "ces-cookies-sont-essentiels-au-fonctionnement-du-site-et-vous-permettent-d-utiliser-ses-fonctionnalites-de-base-telles-que-la-navigation-sur-les-pages-et-l-acces-aux-zones-securisees-ces-cookies-ne-collectent-aucune-information-vous-concernant-qui-pourrait-etre-utilisee-a-des-fins-de-marketing-ou-pour-memoriser-les-sites-que-vous-avez-visites-sur-internet-base-legale-interet-legitime",
                )}
              </li>
              <li className="list-disc">
                <strong>{t("cookies-de-performance-analyse")}</strong>{" "}
                {t(
                  "ces-cookies-nous-permettent-de-compter-les-visites-et-les-sources-de-trafic-afin-de-mesurer-et-d-ameliorer-les-performances-de-notre-site-ils-nous-aident-a-savoir-quelles-pages-sont-les-plus-et-les-moins-populaires-et-a-voir-comment-les-visiteurs-se-deplacent-sur-le-site-toutes-les-informations-collectees-par-ces-cookies-sont-agregees-et-donc-anonymes-nous-utilisons-google-analytics-pour-cette-finalite-base-legale-consentement",
                )}
              </li>
              <li className="list-disc">
                <strong>{t("cookies-de-fonctionnalite")}</strong>{" "}
                {t(
                  "ces-cookies-permettent-au-site-de-se-souvenir-des-choix-que-vous-avez-faits-tels-que-votre-langue-ou-votre-region-et-de-fournir-des-fonctionnalites-ameliorees-et-plus-personnelles-ils-peuvent-egalement-etre-utilises-pour-fournir-des-services-que-vous-avez-demandes-tels-que-regarder-une-video-ou-commenter-un-blog-les-informations-collectees-par-ces-cookies-peuvent-etre-anonymisees-et-ils-ne-peuvent-pas-suivre-votre-activite-de-navigation-sur-d-autres-sites-web-base-legale-consentement",
                )}
              </li>
              <li className="list-disc">
                <strong>{t("cookies-de-ciblage-publicite")}</strong>{" "}
                {t(
                  "ces-cookies-sont-utilises-pour-diffuser-des-publicites-plus-pertinentes-pour-vous-et-vos-interets-ils-sont-egalement-utilises-pour-limiter-le-nombre-de-fois-que-vous-voyez-une-publicite-ainsi-que-pour-aider-a-mesurer-l-efficacite-des-campagnes-publicitaires-ils-sont-generalement-places-par-des-reseaux-publicitaires-avec-la-permission-de-l-operateur-du-site-web-base-legale-consentement",
                )}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("3-liste-des-cookies-utilises")}
          </h2>
          <CookiesTable cookiesRows={cookiesRows} />
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("4-comment-gerer-les-cookies")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-6 text-wrap hyphens-auto lg:w-2/3">
            <p>
              {t(
                "vous-pouvez-gerer-vos-preferences-en-matiere-de-cookies-a-tout-moment",
              )}
            </p>
            <ul className="ml-10 flex flex-col gap-4">
              <li className="list-disc">
                <strong>{t("banniere-cookies")}</strong>{" "}
                {t(
                  "lors-de-chaque-session-vous-verrez-apparaitre-une-baniere-de-consentement-aux-cookies-vous-pouvez-accepter-ou-refuser-les-cookies-non-essentiels",
                )}
              </li>
              <li className="list-disc">
                <strong>{t("parametres-du-navigateur")}</strong>{" "}
                {t(
                  "la-plupart-des-navigateurs-web-vous-permettent-de-controler-les-cookies-via-leurs-parametres-vous-pouvez-generalement-configurer-votre-navigateur-pour-qu-il-refuse-tous-les-cookies-ou-pour-qu-il-vous-avertisse-lorsqu-un-cookie-est-envoye-cependant-si-vous-desactivez-les-cookies-certaines-parties-de-notre-site-peuvent-ne-pas-fonctionner-correctement-pour-plus-d-informations-sur-la-facon-de-gerer-les-cookies-dans-votre-navigateur-veuillez-consulter-la-documentation-de-votre-navigateur",
                )}
              </li>
              {/* <li className="list-disc">
                <strong>Outil de gestion des cookies</strong> :  [Si vous utilisez un outil tiers de gestion des cookies (Cookiebot, Tarteaucitron, etc.), mentionnez-le ici et fournissez un lien vers cet outil.]
              </li> */}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("5-consentement-aux-cookies")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-2 text-wrap hyphens-auto lg:w-2/3">
            <p>
              {t(
                "lors-de-votre-premiere-visite-sur-notre-site-une-banniere-de-consentement-aux-cookies-s-affiche-cette-banniere-vous-permet-d-accepter-ou-de-refuser-les-cookies-non-essentiels-votre-consentement-est-enregistre-pour-une-duree-de-6-mois",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("6-modifications-de-cette-politique")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-2 text-wrap hyphens-auto lg:w-2/3">
            <p>
              {t(
                "nous-pouvons-mettre-a-jour-cette-politique-relative-aux-cookies-de-temps-a-autre-toute-modification-sera-publiee-sur-cette-page-avec-une-date-de-mise-a-jour-revisee",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 ml-6 border-l-2 px-4 text-3xl">
            {t("7-nous-contacter")}
          </h2>
          <div className="md:3/4 mx-auto flex flex-col gap-2 text-wrap hyphens-auto lg:w-2/3">
            <p>
              {t(
                "si-vous-avez-des-questions-concernant-cette-politique-relative-aux-cookies-veuillez-nous-contacter-a",
              )}
            </p>
            <p>fm4all</p>
            <p>{t("3-rue-de-nantes-75019-paris")}</p>
            <p>admin@fm4all.com</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
