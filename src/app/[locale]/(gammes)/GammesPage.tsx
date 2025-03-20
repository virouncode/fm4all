import { getScopedI18n } from "@/locales/server";
import Image from "next/image";

const GammesPage = async () => {
  const t = await getScopedI18n("rangesPage");
  const t2 = await getScopedI18n("range");

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("title")}</h1>
        <div className="flex flex-col gap-10 w-full mx-auto hyphens-auto text-wrap">
          <div className="flex flex-col gap-10 text-lg">
            <p className="text-center max-w-prose mx-auto text-pretty">
              {t("intro.part1")} <strong>{t("intro.part2")}</strong> :
            </p>
            <div className="flex flex-wrap gap-10 justify-center text-2xl mb-10">
              <div className="w-48 text-center px-6 py-10 bg-fm4allessential rounded-lg text-slate-200 font-bold">
                {t2("essential")}
              </div>
              <div className="w-48 text-center px-6 py-10 bg-fm4allcomfort rounded-lg text-slate-200 font-bold">
                {t2("comfort")}
              </div>
              <div className="w-48 text-center px-6 py-10 bg-fm4allexcellence rounded-lg text-slate-200 font-bold">
                {t2("excellence")}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allessential px-4 text-2xl md:text-3xl text-fm4allessential">
                {t("essential.title")}
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                {t("essential.description")}
              </p>
            </div>
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allcomfort px-4 text-2xl md:text-3xl text-fm4allcomfort">
                {t("comfort.title")}
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                {t("comfort.description")}
              </p>
            </div>
            <div className="flex flex-col gap-4 mx-auto">
              <h2 className="border-l-4 border-fm4allexcellence px-4 text-2xl md:text-3xl text-fm4allexcellence">
                {t("excellence.title")}
              </h2>
              <p className="text-lg md:ml-10 max-w-prose mx-auto">
                {t("excellence.description")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full mx-auto hyphens-auto text-wrap text-lg mt-10">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("questions.which_range")}
          </h2>
          <div className="flex flex-col gap-6 justify-between md:w-5/6 mx-auto md:flex-row">
            <div className="h-[180px] w-[300px] relative rounded-xl overflow-hidden hidden lg:block">
              <Image
                src={"/img/baer_otis.webp"}
                alt={"photo d'otis mon scribe"}
                fill={true}
              />
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <p>
                {t("edouard_quote.part1")}{" "}
                <strong>{t("edouard_quote.part2")}</strong>{" "}
                {t("edouard_quote.part3")}
              </p>
              <p>{t("strategy.part1")}</p>
            </div>
          </div>
          <p className="md:w-5/6 mx-auto">{t("strategy.part2")}</p>
        </div>
        <div className="flex flex-col gap-6 w-full mx-auto hyphens-auto text-wrap text-lg mt-10">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("questions.which_providers")}
          </h2>
          <p className="md:w-5/6 mx-auto">{t("providers.part1")}</p>
          <p className="md:w-5/6 mx-auto">{t("providers.part2")}</p>
        </div>
      </article>
    </main>
  );
};

export default GammesPage;
