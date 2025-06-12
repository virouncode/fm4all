import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import {
  getAllSecteurs,
  getAllServices,
  getLastArticles,
} from "@/sanity/queries";
import { getTranslations } from "next-intl/server";

type FooterProps = {
  locale: LocaleType;
};

const Footer = async ({ locale }: FooterProps) => {
  const t = await getTranslations({ locale, namespace: "footer" });

  const [services, articles, secteurs] = await Promise.all([
    getAllServices(locale as LocaleType),
    getLastArticles(locale as LocaleType),
    getAllSecteurs(locale as LocaleType),
  ]);

  return (
    <footer className="bg-fm4allsecondary">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">fm4all</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link href="/" className="hover:opacity-80">
                  {t("page-d-accueil")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:opacity-80"
                  title={t("nous-contacter")}
                >
                  {t("nous-contacter")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:opacity-80" title="FAQ">
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions"
                  className="hover:opacity-80"
                  title={t("mentions-legales")}
                >
                  {t("mentions-legales")}
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="hover:opacity-80"
                  title={t("politique-de-confidentialite")}
                >
                  {t("politique-de-confidentialite")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="hover:opacity-80"
                  title={t("politique-de-cookies")}
                >
                  {t("politique-de-cookies")}
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:opacity-80" title={t("cgv")}>
                  {t("cgv")}
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="hover:opacity-80" title={t("cgu")}>
                  {t("cgu")}
                </Link>
              </li>
              <li>{t("touts-droits-reserves-and-copy-fm4all")}</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">
              <Link
                href="/services"
                className="hover:opacity-80"
                title={t("services")}
              >
                {t("services")}
              </Link>
            </p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              {services.map((service) => {
                const serviceUrl = service.slug?.current ?? "";
                return (
                  <li key={service._id}>
                    <Link
                      href={{
                        pathname: "/services/[slug]",
                        params: { slug: serviceUrl },
                      }}
                      className="hover:opacity-80"
                      title={service.linkText}
                      aria-label={service.linkText}
                    >
                      {service.linkText}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">
              <Link
                href="/secteurs"
                className="hover:opacity-80"
                title={t("secteurs")}
              >
                {t("secteurs")}
              </Link>
            </p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              {secteurs.map((secteur) => {
                const secteurUrl = secteur.slug?.current ?? "";
                return (
                  <li key={secteur._id}>
                    <Link
                      href={{
                        pathname: "/secteurs/[slug]",
                        params: { slug: secteurUrl },
                      }}
                      className="hover:opacity-80"
                      title={secteur.titre || secteurUrl}
                    >
                      {secteur.titre}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div> */}
          {/* <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">
              <Link
                href="/blog"
                className="hover:opacity-80"
                title={t("derniers-articles")}
              >
                {t("derniers-articles")}
              </Link>
            </p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              {articles.map((article) => {
                const categorie = article.categorie as ArticleCategory;
                const articleSlug = categorie.slug?.current ?? "";
                const articleSubSlug = article.subSlug?.current ?? "";
                return (
                  <li key={article._id}>
                    <Link
                      href={{
                        pathname: "/blog/[slug]/[subSlug]",
                        params: { slug: articleSlug, subSlug: articleSubSlug },
                      }}
                      className="hover:opacity-80"
                      title={
                        article.linkText || article.titre || articleSubSlug
                      }
                    >
                      {article.titre}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div> */}
          {/* <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">{t("prestataires")}</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link
                  href="/prestataire"
                  className="hover:opacity-80"
                  title={t("devenir-prestataire")}
                >
                  {t("devenir-prestataire")}
                </Link>
              </li>
            </ul>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
