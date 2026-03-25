import DevisButton from "@/components/buttons/devis-button";
import { useTranslations } from "next-intl";

const Mission = () => {
  const t = useTranslations("HomePage.mission");
  return (
    <section id="mission" className="bg-muted">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pt-8 pb-20">
        <h2 className="border-l-2 px-4 text-2xl md:text-3xl">
          {t("notre-mission")}
        </h2>
        <div className="mx-auto flex w-full max-w-prose flex-col gap-6 text-wrap hyphens-auto">
          <p>
            {t(
              "fm4all-a-analyse-des-centaines-dappels-doffres-de-matrices-de-chiffrage-et-contrats-pour-chaque-service-forts-de-cette-analyse-nous-avons-modelise-des",
            )}{" "}
            <strong>{t("solutions-standardisees-et-personnalisables")}</strong>
            {t(
              "permettant-d-automatiser-les-chiffrages-tout-en-s-adaptant-aux-besoins-specifiques-de-chaque-client",
            )}
          </p>
          <ul className="mx-auto ml-10">
            <li className="list-check">
              {t("un-vrai-choix-avec-3-gammes-de-services-claires")}
            </li>
            <li className="list-check">
              {t(
                "des-devis-que-lon-peut-comparer-et-personnaliser-sans-etre-ingenieur-metier",
              )}
            </li>
            <li className="list-check">
              {t(
                "des-cahiers-des-charges-et-des-contrats-faciles-a-mettre-en-place",
              )}
            </li>
          </ul>
          <p>
            {t(
              "selectionnez-vos-services-le-niveau-de-gamme-vos-options-et-voila",
            )}
          </p>
          <p>
            {t(
              "cahier-des-charges-contrats-planification-demarrage-fm4all-vous-offre-un-service-de-facility-management-cle-en-main",
            )}
          </p>
          <p>
            {t(
              "ne-perdez-plus-de-temps-a-lancer-des-appels-doffres-ou-a-attendre-des-devis-sans-reponse",
            )}
          </p>
          <DevisButton
            title={t(
              "beneficiez-de-notre-reseau-de-partenaires-en-quelques-clics",
            )}
            text={t(
              "beneficiez-de-notre-reseau-de-partenaires-en-quelques-clics",
            )}
            size="lg"
            className="mx-auto mt-6 hidden self-start md:block"
          />
          <DevisButton
            title={t("beneficiez-de-notre-reseau")}
            text={t("beneficiez-de-notre-reseau")}
            size="lg"
            className="mx-auto mt-6 block self-start md:hidden"
          />
        </div>
      </div>
    </section>
  );
};

export default Mission;
