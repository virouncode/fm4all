import { Button } from "@/components/ui/button";
import { getScopedI18n } from "@/locales/server";
import Link from "next/link";

const ContactPage = async () => {
  const t = await getScopedI18n("contactPage");

  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("title")}</h1>
        <div className="flex flex-col gap-6 text-xl max-w-prose mx-auto hyphens-auto text-wrap items-center">
          <p>{t("question_services")}</p>
          <p>{t("we_are_here")}</p>
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
              {t("schedule_meeting")}
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
            asChild
          >
            <Link href="tel:+33669311046">{t("contact_phone")}</Link>
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="text-base w-full sm:w-2/3 lg:w-1/3 flex items-center justify-center"
            asChild
          >
            <Link href="mailto:contact@fm4all.com">{t("contact_email")}</Link>
          </Button>
        </div>
        <div className="flex items-center justify-center w-full">
          <div>
            <p className="text-base text-center mt-4">{t("romuald_buffe")}</p>
            <p className="text-base text-center">{t("ceo")}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
