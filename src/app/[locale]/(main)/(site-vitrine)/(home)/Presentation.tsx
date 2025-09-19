import DevisButton from "@/components/buttons/devis-button";
import { useTranslations } from "next-intl";
import Image from "next/image";

const Presentation = () => {
  const tGlobal = useTranslations("Global");
  const t = useTranslations("HomePage.presentation");
  return (
    <section id="presentation">
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-8 pb-12 text-lg text-wrap hyphens-auto">
        <h2 className="border-l-2 px-4 text-2xl md:text-3xl">
          {t("notre-plateforme")}
        </h2>
        <div className="from-fm4allsecondary/100 to-fm4allsecondary/60 flex items-center justify-center gap-8 rounded-xl bg-gradient-to-r p-8 text-white md:items-start md:px-16 md:py-14">
          <div className="flex w-full flex-col gap-6 md:w-auto">
            {/* <div className="text-center fle flex-col font-bold text-xl">
              <p>{t("vous-emmenagez-dans-de-nouveaux-bureaux")}</p>
              <p>{t("ou-envie-dameliorer-vos-services-actuels")}</p>
            </div> */}
            <div className="mx-auto flex w-full max-w-prose flex-col gap-6 text-base md:w-auto">
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
                  "nettoyage-cafe-fontaine-a-eau-securite-incendie-office-management-et-plus-encore",
                )}
              </p>
              <p>
                {t("gamme")}{" "}
                <span className="font-bold">{tGlobal("essentiel")}</span>,{" "}
                <span className="font-bold">{tGlobal("confort")}</span>{" "}
                {tGlobal("ou")}{" "}
                <span className="font-bold">{tGlobal("excellence")}</span>{" "}
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
                className="bg-fm4alldestructive ring-fm4alldestructive hover:bg-fm4alldestructive/90 mx-auto mt-10 w-full self-start border-none text-white shadow-lg md:w-auto"
              />
            </div>
          </div>
          <div className="relative hidden h-[500px] w-[450px] overflow-hidden rounded-xl md:block">
            <Image
              src={"/img/zen.webp"}
              alt={"image-collaboratrice-zen"}
              fill
              sizes="450px"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Presentation;
