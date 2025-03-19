import { Button } from "@/components/ui/button";
import { getScopedI18n } from "@/locales/server";
import Link from "next/link";

const FaqPage = async () => {
  const t = await getScopedI18n("faqPage");

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-3xl md:text-4xl">{t("title")}</h1>
        <div className="flex flex-col gap-6 text-lg mx-auto w-full max-w-prose">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question1.title")}</h2>
            <p>{t("questions.question1.content")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question2.title")}</h2>
            <p>{t("questions.question2.content")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question3.title")}</h2>
            <p>{t("questions.question3.content")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question4.title")}</h2>
            <p>{t("questions.question4.content")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question5.title")}</h2>
            <p>{t("questions.question5.content")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question6.title")}</h2>
            <p>{t("questions.question6.content")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question7.title")}</h2>
            <p>{t("questions.question7.content")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question8.title")}</h2>
            <p>{t("questions.question8.content")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question9.title")}</h2>
            <p>{t("questions.question9.content")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question10.title")}</h2>
            <p>{t("questions.question10.content")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-bold">{t("questions.question11.title")}</h2>
            <p>{t("questions.question11.content")}</p>
          </div>
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

export default FaqPage;
