import DevisButton from "@/components/devis-button";
import { getCurrentLocale, getScopedI18n } from "@/locales/server";
import Image from "next/image";

const Presentation = async () => {
  const t = await getScopedI18n("presentation");
  const locale = await getCurrentLocale();
  return (
    <section
      className="max-w-7xl w-full mx-auto flex flex-col gap-8 p-6 text-lg hyphens-auto text-wrap relative"
      id="presentation"
    >
      <div className="flex gap-8 justify-center">
        <div className="flex flex-col gap-6">
          <p className="text-center font-bold text-xl">
            {t("title_part1")} <br />
            {t("title_part2")} <br />
            {t("title_part3")}
          </p>
          <div className="flex flex-col gap-4 max-w-prose mx-auto">
            <p>
              <strong>{t("company_name")}</strong> {t("simplifies")}{" "}
              <strong>{t("platform")}</strong> {t("one_contact")}
            </p>
            <p>
              {t("choose")} <strong>{t("best_price")}</strong>{" "}
              {t("services_list")}
            </p>
            <p>
              {locale === "fr" && `${t("range_text")} `}
              <span className="text-fm4allessential font-bold">
                {t("essential")}
              </span>
              ,{" "}
              <span className="text-fm4allcomfort font-bold">
                {t("comfort")}
              </span>{" "}
              {t("or")}{" "}
              <span className="text-fm4allexcellence font-bold">
                {t("excellence")}
              </span>{" "}
              {locale === "en" && `${t("range_text")}`} {t("actions")}
            </p>
            <DevisButton
              title={t("button")}
              text={t("button")}
              size="lg"
              className="self-start mx-auto"
            />
          </div>
        </div>
        <div className="h-[470px] w-[450px] relative md:block hidden rounded-xl overflow-hidden">
          <Image
            src={"/img/zen.webp"}
            alt={"image-collaboratrice-zen"}
            fill={true}
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
};

export default Presentation;
