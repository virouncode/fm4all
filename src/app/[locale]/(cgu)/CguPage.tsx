import { getScopedI18n } from "@/locales/server";

const CguPage = async () => {
  const t = await getScopedI18n("cguPage");
  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("title")}</h1>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("headings.section1")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("content.section1_part1")}</p>
            <p className="text-base">{t("content.section1_part2")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("headings.section2")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("content.section2_part1")}</p>
            <p className="text-base">{t("content.section2_part2")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("headings.section3")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("content.section3_part1")}</p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">{t("content.section3_item1")}</li>
              <li className="list-disc">{t("content.section3_item2")}</li>
              <li className="list-disc">{t("content.section3_item3")}</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("headings.section4")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("content.section4_part1")}</p>
            <p className="text-base">{t("content.section4_part2")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("headings.section5")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("content.section5_part1")}</p>
            <p className="text-base">{t("content.section5_part2")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("headings.section6")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("content.section6_part1")}</p>
            <p className="text-base">{t("content.section6_part2")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("headings.section7")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("content.section7_part1")}</p>
            <p className="text-base">{t("content.section7_part2")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("headings.section8")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("content.section8_part1")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("headings.section9")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("content.section9_part1")}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CguPage;
