import WhyCard from "@/components/cards/WhyCard";
import { getScopedI18n } from "@/locales/server";
import { Euro, Feather, Handshake, Rabbit, Waves } from "lucide-react";
import Image from "next/image";

const Why = async () => {
  const t = await getScopedI18n("why");

  return (
    <section
      className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6"
      id="process"
    >
      <h2 className="text-2xl md:text-3xl border-l-2 px-4">{t("title")}</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
        <WhyCard
          title={t("simplicity.title")}
          content={t("simplicity.content")}
          icon={Feather}
        />
        <WhyCard
          title={t("speed.title")}
          content={t("speed.content")}
          icon={Rabbit}
        />
        <WhyCard
          title={t("reliability.title")}
          content={t("reliability.content")}
          icon={Handshake}
        />
        <WhyCard
          title={t("serenity.title")}
          content={t("serenity.content")}
          icon={Waves}
        />
        <WhyCard
          title={t("optimized.title")}
          content={t("optimized.content")}
          icon={Euro}
        />
      </div>
      <div className="text-lg flex flex-col gap-4 w-full max-w-prose mx-auto hyphens-auto text-wrap">
        <p className="text-center font-bold">{t("winning")}</p>
        <p>{t("better_prices")}</p>
        <p className="text-center font-bold">{t("centralization")}</p>
        <p>{t("management")}</p>
        <p className="font-bold">{t("for_clients")}</p>
        <ul className="mx-auto ml-10">
          <li className="list-thumb">{t("no_chasing")}</li>
          <li className="list-thumb">{t("best_prices")}</li>
        </ul>
        <p className="font-bold">{t("for_providers")}</p>
        <ul className="mx-auto ml-10">
          <li className="list-thumb">{t("time_saving")}</li>
          <li className="list-thumb">{t("competitive_prices")}</li>
        </ul>
      </div>
      <div className="flex flex-col gap-10">
        <p className="text-lg">
          <strong>{t("problem")}</strong>
        </p>
        <div className="flex flex-col md:flex-row w-full lg:w-3/4 mx-auto border rounded-xl overflow-hidden">
          <div className="w-full md:w-2/3 p-6 md:py-10 md:px-16 flex flex-col gap-4 italic order-last md:order-first">
            <p>{t("quote")}</p>
            <p>{t("cause")}</p>
            <p>{t("risk")}</p>
            <p className="text-end not-italic font-bold text-sm">
              {t("founder")}
            </p>
          </div>
          <div className="w-full md:w-1/3 h-[300px] sm:h-[500px] md:h-auto relative">
            <Image
              src="/img/portrait-dg.webp"
              alt="portrait-du-directeur-general"
              fill={true}
              className="w-full h-full object-cover"
              quality={100}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col text-lg gap-10">
        <p>
          <strong>{t("solution")}</strong>
        </p>
        <div className="text-center max-w-prose mx-auto">
          <div className="flex flex-col gap-1 text-5xl mb-10 font-bold text-fm4allsecondary">
            <p>{t("one_contact")}</p>
            <p>{t("one_contract")}</p>
            <p>{t("one_invoice")}</p>
          </div>
          <p>{t("simple_management")}</p>
        </div>
      </div>
    </section>
  );
};

export default Why;
