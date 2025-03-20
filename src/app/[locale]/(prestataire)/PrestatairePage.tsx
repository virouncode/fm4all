import { Button } from "@/components/ui/button";
import { getScopedI18n } from "@/locales/server";
import Link from "next/link";

const PrestatairePage = async () => {
  const t = await getScopedI18n("providerPage");

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("title")}</h1>
        <div className="flex flex-col gap-6 text-lg w-full max-w-prose mx-auto hyphens-auto text-wrap">
          <h2 className="text-center font-bold">
            {t("subtitle_1")}
            <br />
            {t("subtitle_2")}
          </h2>
          <p className="text-center">{t("description")}</p>
        </div>
        <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap text-lg">
          <ul className="ml-10 md:ml-20">
            <li className="list-rocket">{t("benefits.free_business")}</li>
            <li className="list-rocket">{t("benefits.guaranteed_payment")}</li>
            <li className="list-rocket">{t("benefits.admin_management")}</li>
            <li className="list-rocket">{t("benefits.free_leads")}</li>
            <li className="list-rocket">
              {t("benefits.platform_partnership")}
            </li>
            <li className="list-rocket">{t("benefits.free_clients")}</li>
            <li className="list-rocket">{t("benefits.your_rules")}</li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            {t("commitments.title")}
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <ul className="ml-10 md:ml-20">
              <li className="list-thumb">{t("commitments.free_business")}</li>
              <li className="list-thumb">
                {t("commitments.guaranteed_payment")}
              </li>
              <li className="list-thumb">{t("commitments.time_saving")}</li>
              <li className="list-thumb">
                {t("commitments.daily_management")}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            {t("counterpart.title")}
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <ul className="ml-10 md:ml-20">
              <li className="list-handshake">
                {t("counterpart.fixed_contract")}
              </li>
              <li className="list-handshake">
                {t("counterpart.indefinite_contracts")}
              </li>
              <li className="list-handshake">{t("counterpart.paris_area")}</li>
              <li className="list-handshake">
                {t("counterpart.quality_guarantee")}
              </li>
              <li className="list-handshake">
                {t("counterpart.professionalism")}
              </li>
              <li className="list-handshake">
                {t("counterpart.preferential_rates")}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-lg">
          <h2 className="border-l-2 px-4 text-2xl md:text-3xl mb-4 ml-6">
            {t("client_benefits.title")}
          </h2>
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <ul className="ml-10 md:ml-20">
              <li className="list-smile">{t("client_benefits.wide_choice")}</li>
              <li className="list-smile">
                {t("client_benefits.preferential_rates")}
              </li>
              <li className="list-smile">
                {t("client_benefits.single_contact")}
              </li>
              <li className="list-smile">
                {t("client_benefits.onsite_manager")}
              </li>
              <li className="list-smile">{t("client_benefits.online_tool")}</li>
            </ul>
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

export default PrestatairePage;
