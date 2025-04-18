import DevisButton from "@/components/devis-button";
import { getTranslations } from "next-intl/server";

const Mission = async () => {
  const t = await getTranslations("HomePage.mission");
  return (
    <section id="mission">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-10 pt-8 pb-20 px-6">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">
          {t("notre-mission")}
        </h2>
        <div className="flex flex-col gap-4 text-lg w-full max-w-prose hyphens-auto text-wrap mx-auto">
          <p>
            {t(
              "fm4all-a-analyse-des-centaines-dappels-doffres-de-matrices-de-chiffrage-et-contrats-pour-chaque-service-forts-de-cette-analyse-nous-avons-modelise-des"
            )}{" "}
            <strong>{t("solutions-standardisees-et-personnalisables")}</strong>
            {t(
              "permettant-d-automatiser-les-chiffrages-tout-en-s-adaptant-aux-besoins-specifiques-de-chaque-client"
            )}
          </p>
          <ul className="mx-auto ml-10">
            <li className="list-check">
              {t("un-vrai-choix-avec-3-gammes-de-services-claires")}
            </li>
            <li className="list-check">
              {t(
                "des-devis-que-lon-peut-comparer-et-personnaliser-sans-etre-ingenieur-metier"
              )}
            </li>
            <li className="list-check">
              {t(
                "des-cahiers-des-charges-et-des-contrats-faciles-a-mettre-en-place"
              )}
            </li>
          </ul>
          <p>
            {t(
              "selectionnez-vos-services-le-niveau-de-gamme-vos-options-et-voila"
            )}
          </p>
          <p>
            {t(
              "cahier-des-charges-contrats-planification-demarrage-fm4all-vous-offre-un-service-de-facility-management-cle-en-main"
            )}
          </p>
          <p>
            {t(
              "ne-perdez-plus-de-temps-a-lancer-des-appels-doffres-ou-a-attendre-des-devis-sans-reponse"
            )}
          </p>
          <DevisButton
            title={t(
              "beneficiez-de-notre-reseau-de-partenaires-en-quelques-clics"
            )}
            text={t(
              "beneficiez-de-notre-reseau-de-partenaires-en-quelques-clics"
            )}
            size="lg"
            className="self-start mx-auto hidden md:block mt-6"
          />
          <DevisButton
            title={t("beneficiez-de-notre-reseau")}
            text={t("beneficiez-de-notre-reseau")}
            size="lg"
            className="self-start mx-auto block md:hidden mt-6"
          />
        </div>
      </div>
    </section>
  );
};

export default Mission;
