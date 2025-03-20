import DevisButton from "@/components/devis-button";
import { getScopedI18n } from "@/locales/server";

const Mission = async () => {
  const t = await getScopedI18n("mission");

  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6">
      <h2 className="text-2xl md:text-3xl border-l-2 px-4">{t("title")}</h2>
      <div className="flex flex-col gap-4 text-lg w-full max-w-prose hyphens-auto text-wrap mx-auto">
        <p dangerouslySetInnerHTML={{ __html: t("description1") }} />
        <ul className="mx-auto ml-10">
          <li className="list-thumb">{t("item1")}</li>
          <li className="list-thumb">{t("item2")}</li>
          <li className="list-thumb">{t("item3")}</li>
        </ul>
        <p>{t("description2")}</p>
        <p>{t("description3")}</p>
        <p>{t("description4")}</p>
        <div className="mt-10">
          <DevisButton
            title={t("button1")}
            text={t("button1")}
            size="lg"
            className="self-start mx-auto hidden md:block"
          />
          <DevisButton
            title={t("button2")}
            text={t("button2")}
            size="lg"
            className="self-start mx-auto block md:hidden"
          />
        </div>
      </div>
    </section>
  );
};

export default Mission;
