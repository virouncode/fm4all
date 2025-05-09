import { Link } from "@/i18n/navigation";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "confidentialite",
    locale,
    locale === "fr" ? "Politique de confidentialité" : "Privacy policy",
    locale === "fr"
      ? "Lisez notre politique de confidentialité pour en savoir plus sur la collecte et le traitement de vos données personnelles."
      : "Read our privacy policy to learn more about the collection and processing of your personal data."
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async () => {
  const t = await getTranslations("ConfidentialitePage");
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("politique-de-confidentialite")}</h1>
        <div className="flex flex-col gap-2 md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
          <p className="text-base">
            {t(
              "chez-fm4all-societe-par-actions-simplifiee-en-cours-d-immatriculation-numero-siret-communique-des-obtention-domiciliee-au-3-rue-de-nantes-75019-paris-nous-accordons-une-grande-importance-a-la-protection-de-vos-donnees-personnelles"
            )}
          </p>
          <p className="text-base">
            {t(
              "la-presente-politique-de-confidentialite-explique-comment-nous-collectons-utilisons-partageons-et-protegeons-vos-donnees-conformement-au-reglement-general-sur-la-protection-des-donnees-rgpd-et-a-la-loi-informatique-et-libertes"
            )}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("1-qui-sommes-nous")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">
              {t(
                "le-responsable-du-traitement-des-donnees-est-la-societe-fm4all-societe-par-actions-simplifiee-en-cours-d-immatriculation-numero-siret-communique-des-obtention-domiciliee-au-3-rue-de-nantes-75019-paris-vous-pouvez-nous-contacter-pour-toute-question-relative-a-la-protection-des-donnees-a-l-adresse-suivante-admin-fm4all-com"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("2-quelles-donnees-personnelles-collectons-nous")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "nous-collectons-les-categories-de-donnees-personnelles-suivantes"
              )}
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>{t("donnees-d-identification")}</strong>{" "}
                {t(
                  "nom-prenom-adresse-e-mail-numero-de-telephone-adresse-postale-nom-de-l-entreprise"
                )}{" "}
                <em>
                  {t("base-legale-execution-du-contrat-mise-en-relation")}
                </em>
              </li>
              <li className="list-disc">
                <strong>
                  {t("donnees-relatives-a-l-activite-professionnelle")}
                </strong>{" "}
                {t("fonction-secteur-d-activite-taille-de-l-entreprise")}{" "}
                <em>
                  {t(
                    "base-legale-interet-legitime-profilage-pour-proposer-des-services-pertinents"
                  )}
                </em>
              </li>
              <li className="list-disc">
                <strong>{t("donnees-de-connexion")}</strong>{" "}
                {t(
                  "adresse-ip-donnees-de-navigation-sur-notre-site-web-cookies-de-session-pour-le-fonctionnement-du-site-cookies-d-analyse-d-audience-google-analytics-avec-ip-anonymisee-pour-ameliorer-nos-services"
                )}{" "}
                <em>
                  {t(
                    "base-legale-consentement-pour-les-cookies-non-essentiels-interet-legitime-pour-les-cookies-strictement-necessaires-au-fonctionnement-du-site"
                  )}
                </em>
              </li>
              <li className="list-disc">
                <strong>
                  {t(
                    "donnees-relatives-aux-demandes-de-devis-et-aux-prestations"
                  )}
                </strong>{" "}
                {t(
                  "type-de-service-demande-date-de-la-demande-budget-estime-description-des-besoins-informations-sur-les-prestataires-contactes-les-contrats-conclus-les-evaluations-des-prestations"
                )}{" "}
                <em>
                  {t(
                    "base-legale-execution-du-contrat-mise-en-relation-suivi-des-prestations"
                  )}
                </em>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("3-pourquoi-collectons-nous-vos-donnees-personnelles")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "nous-collectons-vos-donnees-personnelles-pour-les-finalites-suivantes"
              )}
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>{t("donnees-d-identification")}</strong>{" "}
                {t(
                  "nom-prenom-adresse-e-mail-numero-de-telephone-adresse-postale-nom-de-l-entreprise"
                )}{" "}
                <em>
                  {t("base-legale-execution-du-contrat-mise-en-relation")}
                </em>
              </li>
              <li className="list-disc">
                <strong>{t("fourniture-de-nos-services")}</strong>{" "}
                {t(
                  "mise-en-relation-avec-des-prestataires-de-services-generaux-gestion-des-demandes-de-devis-suivi-des-prestations-facturation"
                )}{" "}
                <em>{t("base-legale-execution-du-contrat")}</em>
              </li>
              <li className="list-disc">
                <strong>{t("gestion-de-la-relation-client")}</strong>{" "}
                {t(
                  "communication-avec-les-utilisateurs-support-client-traitement-des-reclamations"
                )}{" "}
                <em>
                  {t(
                    "base-legale-execution-du-contrat-interet-legitime-amelioration-de-la-relation-client"
                  )}
                </em>
              </li>
              <li className="list-disc">
                <strong>{t("amelioration-de-nos-services")}</strong>{" "}
                {t(
                  "analyse-des-donnees-d-utilisation-de-notre-plateforme-avec-donnees-anonymisees-lorsque-cela-est-possible-developpement-de-nouvelles-fonctionnalites"
                )}{" "}
                <em>
                  {t(
                    "base-legale-interet-legitime-amelioration-continue-de-nos-services"
                  )}
                </em>
              </li>
              <li className="list-disc">
                <strong>{t("marketing-et-communication")}</strong>{" "}
                {t(
                  "sous-reserve-de-votre-consentement-explicite-case-a-cocher-dediee-nous-pouvons-utiliser-vos-donnees-pour-vous-envoyer-des-informations-sur-nos-services-et-offres-promotionnelles-vous-pouvez-retirer-votre-consentement-a-tout-moment-en-cliquant-sur-le-lien-de-desabonnement-present-dans-chaque-email-ou-en-nous-contactant-a-l-adresse-mentionnee-au-point-1"
                )}{" "}
                <em>{t("base-legale-consentement")}</em>
              </li>
              <li className="list-disc">
                <strong>{t("respect-des-obligations-legales")}</strong>{" "}
                {t(
                  "gestion-des-obligations-comptables-et-fiscales-reponse-aux-demandes-des-autorites-competentes"
                )}{" "}
                <em>{t("base-legale-obligation-legale")}</em>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("4-qui-sont-les-destinataires-de-vos-donnees")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "vos-donnees-personnelles-peuvent-etre-communiquees-aux-destinataires-suivants"
              )}
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>
                  {t(
                    "les-prestataires-de-services-references-sur-notre-plateforme"
                  )}
                </strong>{" "}
                {t(
                  "uniquement-les-informations-necessaires-a-la-mise-en-relation-et-a-l-execution-de-la-prestation-par-exemple-le-nom-et-les-coordonnees-de-l-entreprise-cliente-le-type-de-service-demande"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("nos-prestataires-techniques")}</strong>{" "}
                {t("a-remplir")}
              </li>
              <li className="list-disc">
                <strong>{t("les-autorites-competentes")}</strong>{" "}
                {t("en-cas-d-obligation-legale-ou-de-demande-judiciaire")}
              </li>
            </ul>
            <p className="text-base">
              {t(
                "nous-nous-assurons-que-nos-partenaires-et-prestataires-respectent-les-memes-exigences-en-matiere-de-protection-des-donnees-que-les-notres-notamment-par-le-biais-de-contrats-incluant-les-clauses-contractuelles-types-de-la-commission-europeenne-si-des-transferts-hors-ue-ont-lieu"
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("5-combien-de-temps-conservons-nous-vos-donnees")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "nous-conservons-vos-donnees-personnelles-pendant-les-durees-suivantes"
              )}
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>{t("donnees-relatives-a-la-gestion-de-compte")}</strong>{" "}
                {t(
                  "tant-que-le-compte-est-actif-et-pendant-3-ans-apres-la-suppression-du-compte-pour-gerer-les-eventuelles-reclamations"
                )}
              </li>
              <li className="list-disc">
                <strong>
                  {t(
                    "donnees-relatives-aux-demandes-de-devis-et-aux-prestations-0"
                  )}
                </strong>{" "}
                {t(
                  "3-ans-apres-la-fin-de-la-prestation-ou-le-dernier-contact-actif-sauf-obligation-legale-de-conservation-plus-longue-par-exemple-10-ans-pour-les-factures"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("donnees-de-prospection-commerciale")}</strong>{" "}
                {t("3-ans-apres-le-dernier-contact-actif")}
              </li>
              <li className="list-disc">
                <strong>{t("donnees-de-facturation")}</strong>{" "}
                {t("10-ans-conformement-aux-obligations-legales")}
              </li>
              <li className="list-disc">
                <strong>{t("cookies")} </strong>{" "}
                {t(
                  "voir-notre-politique-de-cookies-pour-la-duree-de-conservation-specifique-a-chaque-cookie"
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("6-quels-sont-vos-droits")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "conformement-a-la-reglementation-applicable-vous-disposez-des-droits-suivants"
              )}
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>{t("droit-d-acces")}</strong>{" "}
                {t(
                  "vous-pouvez-obtenir-la-confirmation-que-vos-donnees-sont-traitees-et-demander-a-y-acceder"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("droit-de-rectification")}</strong>{" "}
                {t(
                  "vous-pouvez-demander-la-correction-de-donnees-inexactes-ou-incompletes"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("droit-a-l-effacement")}</strong>{" "}
                {t(
                  "vous-pouvez-demander-la-suppression-de-vos-donnees-dans-certains-cas-par-exemple-si-les-donnees-ne-sont-plus-necessaires-aux-finalites-pour-lesquelles-elles-ont-ete-collectees"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("droit-a-la-limitation-du-traitement")}</strong>{" "}
                {t(
                  "vous-pouvez-demander-la-suspension-temporaire-du-traitement-de-vos-donnees-dans-certains-cas"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("droit-d-opposition")}</strong>{" "}
                {t(
                  "vous-pouvez-vous-opposer-au-traitement-de-vos-donnees-pour-des-motifs-legitimes-notamment-au-traitement-a-des-fins-de-prospection-commerciale"
                )}
              </li>
              <li className="list-disc">
                <strong>{t("droit-a-la-portabilite")}</strong>{" "}
                {t(
                  "vous-pouvez-recuperer-vos-donnees-dans-un-format-structure-et-lisible-par-machine"
                )}
              </li>
              <li className="list-disc">
                <strong>
                  {t("droit-d-introduire-une-reclamation-aupres-de-la-cnil")}
                </strong>{" "}
                {t(
                  "si-vous-estimez-que-vos-droits-ne-sont-pas-respectes-vous-pouvez-saisir-la-cnil-commission-nationale-de-l-informatique-et-des-libertes"
                )}
              </li>
            </ul>
            <p className="text-base">
              {t(
                "pour-exercer-vos-droits-vous-pouvez-nous-contacter-par-email-a-admin-fm4all-com-ou-par-courrier-a-l-adresse-mentionnee-au-point-1-veuillez-joindre-une-copie-de-votre-piece-d-identite-a-votre-demande"
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("7-utilisation-des-cookies")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "notre-site-web-utilise-des-cookies-pour-en-savoir-plus-sur-les-types-de-cookies-que-nous-utilisons-leur-finalite-et-comment-les-gerer-veuillez-consulter-notre"
              )}{" "}
              <Link href="/cookies" className="underline text-blue-500">
                {t("politique-de-cookies")}
              </Link>
              {t(
                "une-banniere-de-consentement-aux-cookies-s-affiche-lors-de-votre-premiere-visite-sur-notre-site"
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("8-securite-des-donnees")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "nous-mettons-en-oeuvre-des-mesures-de-securite-techniques-et-organisationnelles-appropriees-pour-proteger-vos-donnees-personnelles-contre-tout-acces-non-autorise-toute-divulgation-toute-alteration-ou-toute-destruction-notamment-le-chiffrement-des-donnees-en-transit-https-le-controle-d-acces-aux-donnees-et-des-mesures-de-protection-contre-les-intrusions"
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("9-modifications-de-la-politique-de-confidentialite")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "nous-nous-reservons-le-droit-de-modifier-la-presente-politique-de-confidentialite-a-tout-moment-les-modifications-seront-publiees-sur-notre-site-web-et-nous-vous-informerons-des-changements-importants-par-un-message-sur-la-plateforme-ou-par-email"
              )}
            </p>
            <p>{t("date-de-derniere-mise-a-jour-01-02-2025")}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
