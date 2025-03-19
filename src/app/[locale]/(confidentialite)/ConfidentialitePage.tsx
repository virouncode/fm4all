import { getScopedI18n } from "@/locales/server";
import Link from "next/link";

const ConfidentialitePage = async () => {
  const t = await getScopedI18n("privacyPolicyPage");

  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("title")}</h1>
        <div className="flex flex-col gap-2 md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
          <p className="text-base">{t("intro.part1")}</p>
          <p className="text-base">{t("intro.part2")}</p>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.whoWeAre.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">{t("sections.whoWeAre.content")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.dataCollected.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.dataCollected.intro")}</p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>
                  {t("sections.dataCollected.items.identification.title")}
                </strong>
                : {t("sections.dataCollected.items.identification.content")}{" "}
                <em>
                  {t("sections.dataCollected.items.identification.legal")}
                </em>
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.dataCollected.items.professional.title")}
                </strong>
                : {t("sections.dataCollected.items.professional.content")}{" "}
                <em>{t("sections.dataCollected.items.professional.legal")}</em>
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.dataCollected.items.connection.title")}
                </strong>
                : {t("sections.dataCollected.items.connection.content")}{" "}
                <em>{t("sections.dataCollected.items.connection.legal")}</em>
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.dataCollected.items.requests.title")}
                </strong>
                : {t("sections.dataCollected.items.requests.content")}{" "}
                <em>{t("sections.dataCollected.items.requests.legal")}</em>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.dataPurpose.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.dataPurpose.intro")}</p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>
                  {t("sections.dataPurpose.items.identification.title")}
                </strong>
                : {t("sections.dataPurpose.items.identification.content")}{" "}
                <em>{t("sections.dataPurpose.items.identification.legal")}</em>
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.dataPurpose.items.services.title")}
                </strong>
                : {t("sections.dataPurpose.items.services.content")}{" "}
                <em>{t("sections.dataPurpose.items.services.legal")}</em>
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.dataPurpose.items.customerRelation.title")}
                </strong>
                : {t("sections.dataPurpose.items.customerRelation.content")}{" "}
                <em>
                  {t("sections.dataPurpose.items.customerRelation.legal")}
                </em>
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.dataPurpose.items.serviceImprovement.title")}
                </strong>
                : {t("sections.dataPurpose.items.serviceImprovement.content")}{" "}
                <em>
                  {t("sections.dataPurpose.items.serviceImprovement.legal")}
                </em>
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.dataPurpose.items.marketing.title")}
                </strong>
                : {t("sections.dataPurpose.items.marketing.content")}{" "}
                <em>{t("sections.dataPurpose.items.marketing.legal")}</em>
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.dataPurpose.items.legalObligations.title")}
                </strong>
                : {t("sections.dataPurpose.items.legalObligations.content")}{" "}
                <em>
                  {t("sections.dataPurpose.items.legalObligations.legal")}
                </em>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.recipients.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.recipients.intro")}</p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>
                  {t("sections.recipients.items.providers.title")}
                </strong>
                : {t("sections.recipients.items.providers.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.recipients.items.technicalProviders.title")}
                </strong>
                : {t("sections.recipients.items.technicalProviders.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.recipients.items.authorities.title")}
                </strong>
                : {t("sections.recipients.items.authorities.content")}
              </li>
            </ul>
            <p className="text-base">{t("sections.recipients.assurance")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.retention.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.retention.intro")}</p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>
                  {t("sections.retention.items.accountData.title")}
                </strong>
                : {t("sections.retention.items.accountData.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.retention.items.requestData.title")}
                </strong>
                : {t("sections.retention.items.requestData.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.retention.items.marketingData.title")}
                </strong>
                : {t("sections.retention.items.marketingData.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.retention.items.billingData.title")}
                </strong>
                : {t("sections.retention.items.billingData.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.retention.items.cookiesData.title")}
                </strong>
                : {t("sections.retention.items.cookiesData.content")}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.yourRights.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.yourRights.intro")}</p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>{t("sections.yourRights.items.access.title")}</strong>:{" "}
                {t("sections.yourRights.items.access.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.yourRights.items.rectification.title")}
                </strong>
                : {t("sections.yourRights.items.rectification.content")}
              </li>
              <li className="list-disc">
                <strong>{t("sections.yourRights.items.deletion.title")}</strong>
                : {t("sections.yourRights.items.deletion.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.yourRights.items.limitation.title")}
                </strong>
                : {t("sections.yourRights.items.limitation.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.yourRights.items.objection.title")}
                </strong>
                : {t("sections.yourRights.items.objection.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.yourRights.items.portability.title")}
                </strong>
                : {t("sections.yourRights.items.portability.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.yourRights.items.complaint.title")}
                </strong>
                : {t("sections.yourRights.items.complaint.content")}
              </li>
            </ul>
            <p className="text-base">
              {t("sections.yourRights.exerciseRights")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.cookies.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">
              {t("sections.cookies.content")}{" "}
              <Link
                href="/politique-de-cookies"
                className="underline text-blue-500"
              >
                {t("sections.cookies.policyLink")}
              </Link>
              . {t("sections.cookies.consent")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.security.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.security.content")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.changes.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.changes.content")}</p>
            <p>{t("sections.changes.lastUpdate")}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ConfidentialitePage;
