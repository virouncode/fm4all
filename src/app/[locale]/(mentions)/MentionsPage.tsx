import { getScopedI18n } from "@/locales/server";

const MentionsPage = async () => {
  const t = await getScopedI18n("legalMentionsPage");

  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("title")}</h1>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.section1_title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">{t("sections.section1_content1")}</p>
            <p className="text-base">{t("sections.section1_content2")}</p>
            <p className="text-base">{t("sections.section1_content3")}</p>
            <p className="text-base">{t("sections.section1_content4")}</p>
            <p className="text-base">{t("sections.section1_content5")}</p>
            <p className="text-base">{t("sections.section1_content6")}</p>
            <p className="text-base">{t("sections.section1_content7")}</p>
            <p className="text-base">{t("sections.section1_content8")}</p>
            <p className="text-base font-bold">
              {t("sections.section1_contact_title")}
            </p>
            <ul className="ml-10 md:ml-14">
              <li className="list-disc">
                {t("sections.section1_contact_phone")}
              </li>
              <li className="list-disc">
                {t("sections.section1_contact_email")}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.section2_title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">{t("sections.section2_content1")}</p>
            <p className="text-base">{t("sections.section2_content2")}</p>
            <p className="text-base">{t("sections.section2_content3")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.section3_title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap gap-2 mx-auto">
            <p className="text-base">{t("sections.section3_content1")}</p>
            <p className="text-base">{t("sections.section3_content2")}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MentionsPage;
