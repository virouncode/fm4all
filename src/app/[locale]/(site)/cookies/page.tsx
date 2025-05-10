import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "cookies",
    locale,
    locale === "fr" ? "Politique de cookies" : "Cookie policy",
    locale === "fr"
      ? "Lisez notre politique de cookies pour en savoir plus sur l'utilisation des cookies sur notre site."
      : "Read our cookie policy to learn more about the use of cookies on our website."
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CookiesPage");
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">
          {t("politique-relative-aux-cookies-de-fm4all")}
        </h1>
        <div className="flex flex-col gap-2 md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
          <p className="text-base">{t("derniere-mise-a-jour-04-03-2025")}</p>
          <p className="text-base">
            {t(
              "la-presente-politique-relative-aux-cookies-explique-comment-fm4all-and-quot-nous-and-quot-and-quot-notre-and-quot-and-quot-nos-and-quot-utilise-des-cookies-et-des-technologies-similaires-sur-son-site-web-https-www-fm4all-com-le-and-quot-site-and-quot"
            )}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("1-qu-est-ce-qu-un-cookie")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">
              {t(
                "les-cookies-sont-de-petits-fichiers-texte-qui-sont-places-sur-votre-ordinateur-ou-votre-appareil-mobile-lorsque-vous-visitez-un-site-web-ils-sont-largement-utilises-pour-permettre-aux-sites-web-de-fonctionner-plus-efficacement-ainsi-que-pour-fournir-des-informations-aux-proprietaires-du-site"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("2-types-de-cookies-que-nous-utilisons")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t("nous-utilisons-les-types-de-cookies-suivants")}
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>{t("cookies-strictement-necessaires")}</strong>{" "}
                {t(
                  "ces-cookies-sont-essentiels-au-fonctionnement-du-site-et-vous-permettent-d-utiliser-ses-fonctionnalites-de-base-telles-que-la-navigation-sur-les-pages-et-l-acces-aux-zones-securisees-ces-cookies-ne-collectent-aucune-information-vous-concernant-qui-pourrait-etre-utilisee-a-des-fins-de-marketing-ou-pour-memoriser-les-sites-que-vous-avez-visites-sur-internet-base-legale-interet-legitime"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("cookies-de-performance-analyse")}</strong>{" "}
                {t(
                  "ces-cookies-nous-permettent-de-compter-les-visites-et-les-sources-de-trafic-afin-de-mesurer-et-d-ameliorer-les-performances-de-notre-site-ils-nous-aident-a-savoir-quelles-pages-sont-les-plus-et-les-moins-populaires-et-a-voir-comment-les-visiteurs-se-deplacent-sur-le-site-toutes-les-informations-collectees-par-ces-cookies-sont-agregees-et-donc-anonymes-nous-utilisons-google-analytics-pour-cette-finalite-base-legale-consentement"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("cookies-de-fonctionnalite")}</strong>{" "}
                {t(
                  "ces-cookies-permettent-au-site-de-se-souvenir-des-choix-que-vous-avez-faits-tels-que-votre-langue-ou-votre-region-et-de-fournir-des-fonctionnalites-ameliorees-et-plus-personnelles-ils-peuvent-egalement-etre-utilises-pour-fournir-des-services-que-vous-avez-demandes-tels-que-regarder-une-video-ou-commenter-un-blog-les-informations-collectees-par-ces-cookies-peuvent-etre-anonymisees-et-ils-ne-peuvent-pas-suivre-votre-activite-de-navigation-sur-d-autres-sites-web-base-legale-consentement"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("cookies-de-ciblage-publicite")}</strong>{" "}
                {t(
                  "ces-cookies-sont-utilises-pour-diffuser-des-publicites-plus-pertinentes-pour-vous-et-vos-interets-ils-sont-egalement-utilises-pour-limiter-le-nombre-de-fois-que-vous-voyez-une-publicite-ainsi-que-pour-aider-a-mesurer-l-efficacite-des-campagnes-publicitaires-ils-sont-generalement-places-par-des-reseaux-publicitaires-avec-la-permission-de-l-operateur-du-site-web-base-legale-consentement"
                )}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("3-liste-des-cookies-utilises")}
          </h2>
          <div className="flex flex-col w-full md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2 overflow-x-auto">
            <Table>
              <TableCaption>{t("list-des-cookies-utilises")}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("nom-du-cookie")}</TableHead>
                  <TableHead>{t("nom-du-fournisseur")}</TableHead>
                  <TableHead>{t("finalite")}</TableHead>
                  <TableHead>{t("duree-de-conservation")}</TableHead>
                  <TableHead>{t("type-de-cookie")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>_ga</TableCell>
                  <TableCell>{t("google-analytics")}</TableCell>
                  <TableCell>
                    {t("utilise-pour-distinguer-les-utilisateurs")}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("suivi-analytique")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>_ga_GPWGXZXVW0</TableCell>
                  <TableCell>{t("google-analytics")}</TableCell>
                  <TableCell>
                    {t(
                      "identifie-de-maniere-unique-un-visiteur-sur-plusieurs-sessions"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("suivi-analytique")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ADS_VISITOR_ID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "identifie-un-utilisateur-unique-pour-le-suivi-des-publicites-et-du-remarketing"
                    )}
                  </TableCell>
                  <TableCell>{t("13-mois")}</TableCell>
                  <TableCell>{t("suivi-publicitaire-et-analytique")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AEC</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "assure-que-les-requetes-des-utilisateurs-ne-sont-pas-falsifiees"
                    )}
                  </TableCell>
                  <TableCell>{t("6-mois")}</TableCell>
                  <TableCell>{t("securite")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>APISID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "stockage-des-preferences-et-informations-de-session-de-l-utilisateur"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("suivi-et-personnalisation")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>HSID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "stockage-des-informations-de-session-liees-a-l-authentification-et-la-securisation-des-comptes-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-authentification")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>NID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "personnaliser-les-annonces-qui-sont-affichees-sur-google-et-ses-partenaires"
                    )}
                  </TableCell>
                  <TableCell>{t("6-mois")}</TableCell>
                  <TableCell>
                    {t("suivi-publicitaire-et-personnalisation")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>OTZ</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t("optimiser-la-diffusion-des-publicites")}
                  </TableCell>
                  <TableCell>{t("28-jours")}</TableCell>
                  <TableCell>
                    {t("suivi-publicitaire-et-personnalisation")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SAPISID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "authentifier-un-utilisateur-lorsque-ce-dernier-est-connecte-a-son-compte-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-authentification")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SEARCH_SAMESITE</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "proteger-les-utilisateurs-contre-certains-types-d-attaques-en-particulier-les-attaques-de-falsification-de-requetes-inter-sites"
                    )}
                  </TableCell>
                  <TableCell>{t("quelques-h")}</TableCell>
                  <TableCell>{t("securite-et-gestion-de-session")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "maintenir-l-authentification-active-lorsque-l-utilisateur-navigue-sur-des-services-comme-gmail-google-drive-youtube"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-gestion-de-session")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SIDCC</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "renforcer-la-securite-de-la-session-de-l-utilisateur-connecte-a-son-compte-google"
                    )}
                  </TableCell>
                  <TableCell>{t("3-mois")}</TableCell>
                  <TableCell>{t("securite-et-personnalisation")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SSID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "maintenir-la-session-d-un-utilisateur-qui-est-connecte-a-son-compte-google-en-garantissant-qu-il-ne-soit-pas-oblige-de-se-reconnecter-a-chaque-page"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-gestion-de-session")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PAPISID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "assurer-la-securite-des-sessions-utilisateurs-particulierement-dans-le-cadre-des-services-de-publicite-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-personnalisation")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PSID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "maintenir-et-securiser-la-session-des-utilisateurs-lorsqu-ils-sont-connectes-a-leurs-comptes-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-personnalisation")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PSIDCC</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "empecher-les-utilisateurs-d-etre-deconnectes-lorsqu-ils-naviguent-entre-les-pages-des-services-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-personnalisation")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PSIDTS</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "empecher-les-utilisateurs-d-etre-deconnectes-lorsqu-ils-naviguent-entre-les-pages-des-services-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-personnalisation")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PAPISID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "assurer-la-securite-des-sessions-utilisateurs-particulierement-lorsqu-ils-interagissent-avec-les-services-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-personnalisation")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PSID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "assurer-la-securite-des-sessions-utilisateurs-particulierement-lorsqu-ils-interagissent-avec-les-services-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-personnalisation")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PSIDCC</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "assurer-la-securite-des-sessions-utilisateurs-particulierement-lorsqu-ils-interagissent-avec-les-services-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-personnalisation")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PSIDTS</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "assurer-la-securite-des-sessions-utilisateurs-particulierement-lorsqu-ils-interagissent-avec-les-services-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-personnalisation")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-ENID</TableCell>
                  <TableCell>{t("youtube-google")}</TableCell>
                  <TableCell>
                    {t(
                      "assurer-la-securite-des-sessions-utilisateurs-particulierement-lorsqu-ils-interagissent-avec-les-services-google"
                    )}
                  </TableCell>
                  <TableCell>{t("2-ans")}</TableCell>
                  <TableCell>{t("securite-et-personnalisation")}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("4-comment-gerer-les-cookies")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "vous-pouvez-gerer-vos-preferences-en-matiere-de-cookies-a-tout-moment"
              )}
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>{t("banniere-cookies")}</strong>{" "}
                {t(
                  "lors-de-chaque-session-vous-verrez-apparaitre-une-baniere-de-consentement-aux-cookies-vous-pouvez-accepter-ou-refuser-les-cookies-non-essentiels"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("parametres-du-navigateur")}</strong>{" "}
                {t(
                  "la-plupart-des-navigateurs-web-vous-permettent-de-controler-les-cookies-via-leurs-parametres-vous-pouvez-generalement-configurer-votre-navigateur-pour-qu-il-refuse-tous-les-cookies-ou-pour-qu-il-vous-avertisse-lorsqu-un-cookie-est-envoye-cependant-si-vous-desactivez-les-cookies-certaines-parties-de-notre-site-peuvent-ne-pas-fonctionner-correctement-pour-plus-d-informations-sur-la-facon-de-gerer-les-cookies-dans-votre-navigateur-veuillez-consulter-la-documentation-de-votre-navigateur"
                )}
              </li>
              {/* <li className="list-disc">
                <strong>Outil de gestion des cookies</strong> :  [Si vous utilisez un outil tiers de gestion des cookies (Cookiebot, Tarteaucitron, etc.), mentionnez-le ici et fournissez un lien vers cet outil.]
              </li> */}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("5-consentement-aux-cookies")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "lors-de-votre-premiere-visite-sur-notre-site-une-banniere-de-consentement-aux-cookies-s-affiche-cette-banniere-vous-permet-d-accepter-ou-de-refuser-les-cookies-non-essentiels-votre-consentement-est-enregistre-pour-une-duree-de-6-mois"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("6-modifications-de-cette-politique")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "nous-pouvons-mettre-a-jour-cette-politique-relative-aux-cookies-de-temps-a-autre-toute-modification-sera-publiee-sur-cette-page-avec-une-date-de-mise-a-jour-revisee"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("7-nous-contacter")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "si-vous-avez-des-questions-concernant-cette-politique-relative-aux-cookies-veuillez-nous-contacter-a"
              )}
            </p>
            <p className="text-base">fm4all</p>
            <p className="text-base">{t("3-rue-de-nantes-75019-paris")}</p>
            <p className="text-base">admin@fm4all.com</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
