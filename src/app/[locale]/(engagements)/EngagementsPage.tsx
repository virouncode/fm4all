import WhyCard from "@/components/cards/WhyCard";
import { Button } from "@/components/ui/button";
import { getScopedI18n } from "@/locales/server";
import { Euro, Feather, Handshake, Rabbit, Waves } from "lucide-react";
import Link from "next/link";

const EngagementsPage = async () => {
  const t = await getScopedI18n("commitmentsPage");
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">{t("title")}</h1>
      <article className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold">
            {t("intro.part1")} <strong>{t("intro.part2")}</strong>{" "}
            {t("intro.part3")}
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 mt-10 mb-10">
            <WhyCard
              title={t("whyCards.simplicity.title")}
              content={t("whyCards.simplicity.content")}
              icon={Feather}
            />
            <WhyCard
              title={t("whyCards.speed.title")}
              content={t("whyCards.speed.content")}
              icon={Rabbit}
            />
            <WhyCard
              title={t("whyCards.reliability.title")}
              content={t("whyCards.reliability.content")}
              icon={Handshake}
            />
            <WhyCard
              title={t("whyCards.serenity.title")}
              content={t("whyCards.serenity.content")}
              icon={Waves}
            />
            <WhyCard
              title={t("whyCards.costOptimization.title")}
              content={t("whyCards.costOptimization.content")}
              icon={Euro}
            />
          </div>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            {t("outro.part1")} {t("outro.part2")}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
            asChild
          >
            <Link
              href="https://calendly.com/romuald-fm4all/rdv-fm4all"
              target="_blank"
            >
              {t("contact.schedule_meeting")}
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
            asChild
          >
            <Link href="tel:+33669311046">{t("contact.contact_phone")}</Link>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
            asChild
          >
            <Link href="mailto:contact@fm4all.com">
              {t("contact.contact_email")}
            </Link>
          </Button>
        </div>
      </article>
    </main>
  );
};

export default EngagementsPage;
