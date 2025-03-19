import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getScopedI18n } from "@/locales/server";

const CookiesPage = async () => {
  const t = await getScopedI18n("cookiePolicyPage");

  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">{t("heading")}</h1>
        <div className="flex flex-col gap-2 md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
          <p className="text-base">{t("lastUpdate")}</p>
          <p className="text-base">{t("intro")}</p>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.whatIsCookie.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto">
            <p className="text-base">{t("sections.whatIsCookie.content")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.typesOfCookies.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.typesOfCookies.intro")}</p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>
                  {t("sections.typesOfCookies.items.necessary.title")}
                </strong>
                : {t("sections.typesOfCookies.items.necessary.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.typesOfCookies.items.performance.title")}
                </strong>
                : {t("sections.typesOfCookies.items.performance.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.typesOfCookies.items.functionality.title")}
                </strong>
                : {t("sections.typesOfCookies.items.functionality.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.typesOfCookies.items.targeting.title")}
                </strong>
                : {t("sections.typesOfCookies.items.targeting.content")}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.cookiesList.title")}
          </h2>
          <div className="flex flex-col w-full md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2 overflow-x-auto">
            <Table>
              <TableCaption>{t("sections.cookiesList.caption")}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("sections.cookiesList.headers.name")}
                  </TableHead>
                  <TableHead>
                    {t("sections.cookiesList.headers.provider")}
                  </TableHead>
                  <TableHead>
                    {t("sections.cookiesList.headers.purpose")}
                  </TableHead>
                  <TableHead>
                    {t("sections.cookiesList.headers.duration")}
                  </TableHead>
                  <TableHead>
                    {t("sections.cookiesList.headers.type")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Using hardcoded cookie data since we can't directly access the array from i18n */}
                <TableRow>
                  <TableCell>_ga</TableCell>
                  <TableCell>Google Analytics</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.0.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.0.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.0.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>_ga_GPWGXZXVW0</TableCell>
                  <TableCell>Google Analytics</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.1.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.1.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.1.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ADS_VISITOR_ID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.2.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.2.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.2.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AEC</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.3.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.3.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.3.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>APISID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.4.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.4.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.4.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>HSID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.5.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.5.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.5.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>NID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.6.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.6.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.6.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>OTZ</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.7.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.7.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.7.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SAPISID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.8.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.8.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.8.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SEARCH_SAMESITE</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.9.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.9.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.9.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.10.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.10.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.10.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SIDCC</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.11.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.11.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.11.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SSID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.12.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.12.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.12.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PAPISID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.13.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.13.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.13.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PSID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.14.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.14.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.14.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PSIDCC</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.15.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.15.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.15.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-1PSIDTS</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.16.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.16.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.16.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PAPISID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.17.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.17.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.17.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PSID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.18.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.18.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.18.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PSIDCC</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.19.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.19.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.19.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-3PSIDTS</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.20.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.20.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.20.type")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>__Secure-ENID</TableCell>
                  <TableCell>YouTube (Google)</TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.21.purpose")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.21.duration")}
                  </TableCell>
                  <TableCell>
                    {t("sections.cookiesList.cookies.21.type")}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.manageCookies.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.manageCookies.intro")}</p>
            <ul className="ml-10 flex flex-col gap-2">
              <li className="list-disc">
                <strong>
                  {t("sections.manageCookies.items.banner.title")}
                </strong>
                : {t("sections.manageCookies.items.banner.content")}
              </li>
              <li className="list-disc">
                <strong>
                  {t("sections.manageCookies.items.browser.title")}
                </strong>
                : {t("sections.manageCookies.items.browser.content")}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.consent.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.consent.content")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.changes.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.changes.content")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            {t("sections.contact.title")}
          </h2>
          <div className="flex flex-col md:3/4 lg:w-2/3 hyphens-auto text-wrap mx-auto gap-2">
            <p className="text-base">{t("sections.contact.intro")}</p>
            <p className="text-base">{t("sections.contact.company")}</p>
            <p className="text-base">{t("sections.contact.address")}</p>
            <p className="text-base">{t("sections.contact.email")}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CookiesPage;
