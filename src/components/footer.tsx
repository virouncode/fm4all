import { Link } from "@/i18n/navigation";
import { client } from "@/sanity/lib/client";
import { getAllServices, LAST_ARTICLES_QUERY } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";
import { Article, ArticleCategory } from "../../sanity.types";

const Footer = async () => {
  const t = await getTranslations("footer");
  const locale = await getLocale();
  const services = await getAllServices(locale as "fr" | "en");
  const articles = await client.fetch<
    (Article & { categorie: ArticleCategory })[]
  >(LAST_ARTICLES_QUERY, { language: locale });

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
                <Link href="/contact" className="hover:opacity-80">
                  {t("nous-contacter")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:opacity-80">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/mentions" className="hover:opacity-80">
                  {t("mentions-legales")}
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:opacity-80">
                  {t("politique-de-confidentialite")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:opacity-80">
                  {t("politique-de-cookies")}
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:opacity-80">
                  {t("cgv")}
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="hover:opacity-80">
                  {t("cgu")}
                </Link>
              </li>
              <li>{t("touts-droits-reserves-and-copy-fm4all")}</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">
              <Link href="/services" className="hover:opacity-80">
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
                    >
                      {service.titre}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">
              <Link href="/blog" className="hover:opacity-80">
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
                    >
                      {article.titre}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">{t("prestataires")}</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <Link href="/prestataire" className="hover:opacity-80">
                  {t("devenir-prestataire")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
