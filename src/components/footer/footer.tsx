import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import {
  getAllSecteurs,
  getAllServices,
  getLastArticles,
} from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";
import { ArticleCategory } from "../../../sanity.types";
import { ObfuscatedLink } from "../links/ObfuscatedLink";

const Footer = async () => {
  const t = await getTranslations("footer");
  const locale = await getLocale();

  const [services, articles, secteurs] = await Promise.all([
    getAllServices(locale as LocaleType),
    getLastArticles(locale as LocaleType),
    getAllSecteurs(locale as LocaleType),
  ]);

  return (
    <footer className="from-fm4allsecondary/100 to-fm4allsecondary/60 bg-gradient-to-r">
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex w-52 flex-col gap-2">
            <ul className="text-secondary flex flex-col gap-2 text-sm">
              <li className="text-xl">
                <Link
                  href="/"
                  className="hover:underline hover:opacity-80"
                  title={t("page-d-accueil")}
                  aria-label={t("page-d-accueil")}
                >
                  fm4all
                </Link>
              </li>
              <li>
                <Link href="/contact">{t("nous-contacter")}</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/mentions">{t("mentions-legales")}</Link>
              </li>
              <li>
                <Link href="/confidentialite">
                  {t("politique-de-confidentialite")}
                </Link>
              </li>
              <li>
                <Link href="/cookies">{t("politique-de-cookies")}</Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:opacity-80">
                  {t("cgv")}
                </Link>
              </li>
              <li>
                <Link href="/cgu">{t("cgu")}</Link>
              </li>
              <li className="italic">
                {t("touts-droits-reserves-and-copy-fm4all")}
              </li>
            </ul>
          </div>
          <div className="flex w-52 flex-col gap-2">
            <ul className="text-secondary flex flex-col gap-2 text-sm">
              <li className="text-xl">
                <Link
                  href="/services"
                  className="hover:underline hover:opacity-80"
                  title={t("services")}
                >
                  {t("services")}
                </Link>
              </li>
              {services.map((service) => {
                const serviceUrl = service.slug?.current ?? "";
                return (
                  <li key={service._id}>
                    <Link
                      href={{
                        pathname: "/services/[slug]",
                        params: { slug: serviceUrl },
                      }}
                      className="hover:underline hover:opacity-80"
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
          <div className="flex w-52 flex-col gap-2">
            <ul className="text-secondary flex flex-col gap-2 text-sm">
              <li className="text-secondary text-xl">
                <Link href="/secteurs">{t("secteurs")}</Link>
              </li>
              {secteurs.map((secteur) => {
                const secteurUrl = secteur.slug?.current ?? "";
                return (
                  <li key={secteur._id}>
                    <ObfuscatedLink
                      href={{
                        pathname: "/secteurs/[slug]",
                        params: { slug: secteurUrl },
                      }}
                    >
                      {secteur.titre}
                    </ObfuscatedLink>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex w-52 flex-col gap-2">
            <ul className="text-secondary flex flex-col gap-2 text-sm">
              <li className="text-secondary text-xl">
                <Link href="/blog">{t("derniers-articles")}</Link>
              </li>
              {articles.map((article) => {
                const categorie = article.categorie as ArticleCategory;
                const articleSlug = categorie.slug?.current ?? "";
                const articleSubSlug = article.subSlug?.current ?? "";
                return (
                  <li key={article._id}>
                    <ObfuscatedLink
                      href={{
                        pathname: "/blog/[slug]/[subSlug]",
                        params: { slug: articleSlug, subSlug: articleSubSlug },
                      }}
                    >
                      {article.titre}
                    </ObfuscatedLink>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex w-52 flex-col gap-2">
            <p className="text-secondary text-xl">{t("prestataires")}</p>
            <ul className="text-secondary flex flex-col gap-2 text-sm">
              <li>
                <Link href="/prestataire">{t("devenir-prestataire")}</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
