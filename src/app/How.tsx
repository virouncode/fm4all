import WhyCard from "@/components/cards/WhyCard";
import DevisButton from "@/components/devis-button";
import { getScopedI18n } from "@/locales/server";
import { Euro, HandPlatter, House, ReceiptText, Star } from "lucide-react";

const How = async () => {
  const t = await getScopedI18n("how");

  return (
    <section
      className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6"
      id="process"
    >
      <h2 className="text-2xl md:text-3xl border-l-2 px-4">{t("title")}</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
        <WhyCard
          title={t("step1.title")}
          content={t("step1.content")}
          icon={House}
        />
        <WhyCard
          title={t("step2.title")}
          content={t("step2.content")}
          icon={HandPlatter}
        />
        <WhyCard
          title={t("step3.title")}
          content={t("step3.content")}
          icon={Star}
        />
        <WhyCard
          title={t("step4.title")}
          content={t("step4.content")}
          icon={Euro}
        />
        <WhyCard
          title={t("step5.title")}
          content={t("step5.content")}
          icon={ReceiptText}
        />
      </div>
      <DevisButton
        title={t("start_now")}
        text={t("start_now")}
        size="lg"
        className="self-start mx-auto"
      />
    </section>
  );
};

export default How;
