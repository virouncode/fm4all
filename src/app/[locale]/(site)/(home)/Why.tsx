import WhyCards from "@/components/cards/WhyCards";
import { useTranslations } from "next-intl";
import Image from "next/image";

const Why = () => {
  const t = useTranslations("HomePage.pourquoi");
  return (
    <section
      className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pt-8 pb-12"
      id="process"
    >
      <h2 className="border-l-2 px-4 text-2xl md:text-3xl">
        {t("pourquoi-ca-marche")}
      </h2>
      <WhyCards />
      <div className="mx-auto flex w-full max-w-prose flex-col gap-6 text-wrap hyphens-auto">
        <p className="text-center font-bold">
          {t("parce-que-tout-le-monde-est-gagnant-prestataires-comme-clients")}
        </p>
        <p>
          {t(
            "vous-ne-courez-pas-apres-vos-devis-et-vous-avez-de-meilleurs-prix-nos-prestataires-ne-perdent-pas-de-temps-ni-de-ressources-a-chiffrer-pour-rien-du-coup-ils-peuvent-vous-offrir-leurs-meilleurs-tarifs",
          )}
        </p>
        <p className="text-center font-bold">
          {t("parce-que-fm4all-centralise-tout")}
        </p>
        <p>
          {t(
            "nous-gerons-la-facturation-les-demandes-et-le-suivi-qualite-un-gain-de-temps-precieux-pour-tous",
          )}
        </p>
        <p className="font-bold">{t("pour-vous-clients")}</p>
        <ul className="mx-auto ml-10">
          <li className="list-thumb">{t("fini-la-course-aux-devis")}</li>
          <li className="list-thumb">
            {t("accedez-aux-prix-les-plus-avantageux")}
          </li>
        </ul>
        <p className="font-bold">{t("pour-nos-prestataires")}</p>
        <ul className="mx-auto ml-10">
          <li className="list-thumb">
            {t(
              "gain-de-temps-et-de-ressources-ils-se-concentrent-sur-leur-coeur-de-metier",
            )}
          </li>
          <li className="list-thumb">
            {t(
              "des-tarifs-plus-competitifs-grace-a-l-optimisation-des-processus",
            )}
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-10">
        <p>
          <strong>{t("le-probleme")}</strong>{" "}
          {t("un-marche-complexe-pour-les-petites-structures")}
        </p>
        <div className="mx-auto flex w-full flex-col overflow-hidden rounded-xl border bg-[rgb(250,250,250)] text-sm md:flex-row lg:w-3/4">
          <div className="order-last flex w-full flex-col gap-4 p-6 italic md:order-first md:w-2/3 md:px-16 md:py-10">
            <p>
              {t(
                "quand-on-est-client-utilisateur-de-bureaux-de-moins-de-3000m-beaucoup-de-demandes-de-devis-restent-sans-reponse-les-ressources-achats-sont-limitees-on-n-achete-pas-ca-tous-les-jours-et-dailleurs-que-mettre-dans-son-cahier-des-charges-on-perd-du-temps-a-obtenir-des-devis-et-pire-ceux-quon-obtient-paraissent-toujours-trop-chers",
              )}
            </p>
            <p>{t("pour-cause")}</p>
            <p>
              {t(
                "pour-les-prestataires-faire-un-devis-pour-un-site-de-petite-taille-est-un-risque-le-temps-de-visiter-chiffrer-negocier-et-demarrer-si-ca-ne-signe-pas-ou-sil-y-a-la-moindre-erreur-operationnelle-cest-la-marge-qui-seffondre-resultat-soit-ils-ne-repondent-pas-et-se-concentrent-sur-les-gros-soit-ils-repondent-avec-des-marges-gonflees-pour-compenser-ces-risques",
              )}
            </p>
            <p className="text-end text-sm font-bold not-italic">
              {t("romuald-buffe-fondateur-fm4all")} <br />
              {t(
                "ancien-directeur-commercial-de-iss-france-et-cbre-gws-france",
              )}
            </p>
          </div>
          <div className="relative h-[300px] w-full sm:h-[500px] md:h-auto md:w-1/3">
            <Image
              src="/img/portrait-dg.webp"
              alt="portrait-du-directeur-general"
              fill={true}
              className="h-full w-full object-cover"
              quality={100}
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-10">
        <p>
          <strong>{t("la-solution")}</strong>{" "}
          {t(
            "fm4all-simplifie-et-optimise-la-gestion-facility-management-pour-tous",
          )}
        </p>
        <div className="mx-auto max-w-prose text-center">
          <div className="text-fm4allsecondary mb-10 flex flex-col gap-1 text-5xl font-bold">
            <p>{t("1-contact")}</p>
            <p>{t("1-contrat")}</p>
            <p>{t("1-facture")}</p>
          </div>
          <p>
            {t("avec-fm4all-gerer-vos-bureaux-n-aura-jamais-ete-aussi-simple")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Why;
