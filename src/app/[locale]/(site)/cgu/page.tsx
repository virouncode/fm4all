import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "cgu",
    locale,
    locale === "fr"
      ? "Conditions Générales d'Utilisation (CGU)"
      : "Terms and Conditions of Use",
    locale === "fr"
      ? "Lisez nos conditions générales d'utilisation (CGU) pour en savoir plus sur les règles d'accès et d'utilisation de notre site."
      : "Read our terms and conditions of use (CGU) to learn more about the rules for accessing and using our site."
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async () => {
  const t = await getTranslations("CGUPage");
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">
          {t("conditions-generales-d-utilisation-cgu-du-site-fm4all-com")}
        </h1>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">{t("1-objet")}</h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "les-presentes-conditions-generales-d-utilisation-cgu-ont-pour-objet-de-definir-les-conditions-d-acces-et-d-utilisation-du-site-internet-www-fm4all-com-ci-apres-le-site-edite-par-fm4all-societe-specialisee-dans-le-facility-management"
              )}
            </p>
            <p className="text-base">
              {t(
                "en-accedant-au-site-l-utilisateur-ci-apres-l-utilisateur-accepte-sans-reserve-les-presentes-cgu-en-cas-de-desaccord-avec-ces-conditions-l-utilisateur-est-invite-a-ne-pas-utiliser-le-site"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("2-acces-au-site")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "le-site-est-accessible-gratuitement-a-tout-utilisateur-disposant-d-un-acces-a-internet-tous-les-couts-lies-a-l-acces-au-site-materiel-informatique-logiciels-connexion-internet-etc-sont-a-la-charge-de-l-utilisateur"
              )}
            </p>
            <p className="text-base">
              {t(
                "fm4all-met-en-oeuvre-tous-les-moyens-raisonnables-pour-assurer-un-acces-de-qualite-au-site-mais-n-est-tenue-a-aucune-obligation-de-resultat-l-acces-au-site-peut-etre-interrompu-pour-des-raisons-de-maintenance-ou-pour-toute-autre-raison-sans-preavis"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("3-utilisation-du-site")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "l-utilisateur-s-engage-a-utiliser-le-site-conformement-aux-presentes-cgu-et-aux-lois-en-vigueur-il-s-interdit-notamment"
              )}
            </p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                {t(
                  "d-utiliser-le-site-a-des-fins-illegales-ou-interdites-par-la-loi"
                )}
              </li>
              <li className="list-disc">
                {t("d-interferer-avec-le-bon-fonctionnement-du-site")}
              </li>
              <li className="list-disc">
                {t(
                  "de-tenter-d-acceder-de-maniere-non-autorisee-aux-systemes-informatiques-de-fm4all"
                )}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("4-responsabilite")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "fm4all-s-efforce-de-fournir-des-informations-precises-et-a-jour-sur-le-site-toutefois-fm4all-ne-garantit-pas-l-exactitude-l-exhaustivite-ou-l-actualite-des-informations-diffusees-sur-le-site"
              )}
            </p>
            <p className="text-base">
              {t(
                "fm4all-ne-pourra-etre-tenue-responsable-de-tout-dommage-direct-ou-indirect-resultant-de-l-utilisation-du-site-ou-de-l-impossibilite-d-y-acceder"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("5-propriete-intellectuelle")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "tous-les-contenus-presents-sur-le-site-textes-images-graphismes-logos-icones-logiciels-etc-sont-la-propriete-exclusive-de-fm4all-ou-de-ses-partenaires"
              )}
            </p>
            <p className="text-base">
              {t(
                "toute-reproduction-distribution-modification-adaptation-retransmission-ou-publication-meme-partielle-de-ces-differents-elements-est-strictement-interdite-sans-l-accord-prealable-ecrit-de-fm4all"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("6-donnees-personnelles")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "l-utilisateur-est-informe-que-lors-de-sa-navigation-sur-le-site-des-donnees-personnelles-peuvent-etre-collectees-par-fm4all-notamment-via-les-formulaires-de-contact-ou-les-cookies"
              )}
            </p>
            <p className="text-base">
              {t(
                "fm4all-s-engage-a-traiter-ces-donnees-conformement-a-sa-politique-de-confidentialite-et-en-respectant-la-reglementation-en-vigueur-sur-la-protection-des-donnees-personnelles-rgpd"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("7-liens-hypertextes")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "le-site-peut-contenir-des-liens-vers-des-sites-internet-tiers-fm4all-n-exerce-aucun-controle-sur-ces-sites-et-decline-toute-responsabilite-quant-a-leur-contenu"
              )}
            </p>
            <p className="text-base">
              {t(
                "l-insertion-de-liens-hypertextes-vers-le-site-est-autorisee-sous-reserve-de-ne-pas-porter-atteinte-a-l-image-de-fm4all-et-de-ne-pas-induire-en-erreur-sur-la-nature-des-liens-avec-fm4all"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("8-modification-des-cgu")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "fm4all-se-reserve-le-droit-de-modifier-a-tout-moment-les-presentes-cgu-les-nouvelles-conditions-seront-applicables-des-leur-mise-en-ligne-sur-le-site-l-utilisateur-est-donc-invite-a-consulter-regulierement-cette-page-pour-prendre-connaissance-de-toute-mise-a-jour"
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("9-droit-applicable-et-juridiction-competente")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t(
                "les-presentes-cgu-sont-regies-par-le-droit-francais-en-cas-de-litige-relatif-a-l-interpretation-ou-a-l-execution-des-presentes-les-tribunaux-competents-de-paris-seront-seuls-competents"
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
