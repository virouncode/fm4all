import { getScopedI18n } from "@/locales/server";
import ServiceCards from "./ServiceCards";

const ServicesPage = async () => {
  const t = await getScopedI18n("servicesPage");

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("title")}</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap text-lg">
            <p>
              {t("intro_part1")} <strong>{t("intro_part2")}</strong>{" "}
              {t("intro_part3")} <strong>{t("intro_part4")}</strong>{" "}
              {t("intro_part5")} <strong>{t("intro_part6")}</strong>{" "}
              {t("intro_part7")} <strong>{t("intro_part8")}</strong>.
            </p>
            <p className="text-center">{t("manage_for_you")}</p>
          </div>
          <ServiceCards />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("why_fm_for_all")}
          </h2>
          <div className="text-lg flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>{t("why_fm_for_all_description")}</p>
            <p>
              {t("fm_definition_part1")}{" "}
              <strong>{t("fm_definition_part2")}</strong>{" "}
              {t("fm_definition_part3")}
            </p>
            <p>
              <strong>{t("fm_services_part1")}</strong>
              {t("fm_services_part2")}
            </p>
            <p>
              {t("fm_outsourcing_part1")}{" "}
              <strong>{t("fm_outsourcing_part2")}</strong>
              {t("fm_outsourcing_part3")}
            </p>
            <p>{t("fm_for_all_sizes")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("save_time_money")}
          </h2>
          <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
            <p>
              {t("save_time_money_description_part1")}{" "}
              <strong>{t("save_time_money_description_part2")}</strong>
              {t("save_time_money_description_part3")}
            </p>
            <p>
              <strong>{t("one_invoice_part1")}</strong> {t("one_invoice_part2")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("hof_managers")}
          </h2>
          <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
            <p>
              {t("hof_managers_description_part1")}{" "}
              <strong>{t("hof_managers_description_part2")}</strong>{" "}
              {t("hof_managers_description_part3")}
            </p>
          </div>
        </div>
      </article>
    </main>
  );
};

export default ServicesPage;
