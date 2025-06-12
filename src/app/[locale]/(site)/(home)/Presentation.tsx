import DevisButton from "@/components/buttons/devis-button";
import { useTranslations } from "next-intl";
import Image from "next/image";

const Presentation = () => {
  const tGlobal = useTranslations("Global");
  const t = useTranslations("HomePage.presentation");
  return (
    <section id="presentation">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-8 text-lg hyphens-auto text-wrap relative pt-8 pb-12 px-6">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">
          {t("notre-plateforme")}
        </h2>
        <div className="flex gap-8 justify-center items-center bg-[rgb(250,250,250)] rounded-xl p-8">
          <div className="flex flex-col gap-6">
            <div className="text-center fle flex-col font-bold text-xl">
              <p>{t("vous-emmenagez-dans-de-nouveaux-bureaux")}</p>
              <p>{t("ou-envie-dameliorer-vos-services-actuels")}</p>
            </div>
            <div className="flex flex-col gap-4 max-w-prose mx-auto">
              <p>
                {t("fm4all-est-une")}{" "}
                <strong>{t("entreprise-de-facility-management")}</strong>{" "}
                {t("qui-simplifie-vos-demarches-d")}
                <strong>{t("externalisation-des-services")}</strong>{" "}
                {t("de-votre-entreprise")}
              </p>
              <p>
                {t("nous-confier-le")}{" "}
                <strong>
                  {t("pilotage-et-la-gestion-des-services-generaux")}
                </strong>
                {t("cest-garantir-l")}
                <strong>{t("optimisation-des-couts")}</strong> {t("lies-au")}{" "}
                <strong>{t("bien-etre-au-travail")}</strong>{" "}
                {t("et-au-confort-des-occupants-de-vos-sites")}
              </p>
              <p>
                {t("choisissez-en-ligne-des-prestataires-de-confiance")}
                <strong> {t("au-meilleur-prix")} </strong>
                {t(
                  "nettoyage-cafe-fontaine-a-eau-securite-incendie-office-management-et-plus-encore"
                )}
              </p>
              <p>
                {t("gamme")}{" "}
                <span className="text-fm4allessential font-bold">
                  {tGlobal("essentiel")}
                </span>
                ,{" "}
                <span className="text-fm4allcomfort font-bold">
                  {tGlobal("confort")}
                </span>{" "}
                {tGlobal("ou")}{" "}
                <span className="text-fm4allexcellence font-bold">
                  {tGlobal("excellence")}
                </span>{" "}
                {t("tiers")}
                {t("simplifiez-comparez-et-deleguez-en-quelques-clics")}
              </p>
              <p>
                {t("fm4all-est-la-seule-plateforme-de-facility-management")}{" "}
                <strong>{t("multiservices")}</strong>{" "}
                {t("integrant-a-la-fois-un")}{" "}
                <strong>{t("comparateur")}</strong>{" "}
                {t("doffres-et-un-generateur-de")}{" "}
                <strong>{t("devis-en-ligne")}</strong>.
              </p>
              <p>{t("pret-a-ameliorer-votre-environnement-de-travail")}</p>
              <DevisButton
                title={t("obtenez-votre-devis-en-quelques-clics")}
                text={t("obtenez-votre-devis-en-quelques-clics")}
                size="lg"
                className="self-start mx-auto mt-10"
              />
            </div>
          </div>
          <div className="h-[500px] w-[450px] relative md:block hidden rounded-xl overflow-hidden">
            <Image
              src={"/img/zen.webp"}
              alt={"image-collaboratrice-zen"}
              fill={true}
              sizes="300px"
              className="object-cover object-center"
              loading="lazy"
              quality={100}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Presentation;
