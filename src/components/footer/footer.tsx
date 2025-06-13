import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import {
  getAllSecteurs,
  getAllServices,
  getLastArticles,
} from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import { ArticleCategory } from "../../../sanity.types";
import { ObfuscatedLink } from "../links/ObfuscatedLink";

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
                <Link
                  href="/"
                  className="hover:opacity-80"
                  title={t("page-d-accueil")}
                  aria-label={t("page-d-accueil")}
                >
                  {t("page-d-accueil")}
                </Link>
              </li>
              <li>
                <ObfuscatedLink href="/contact">
                  {t("nous-contacter")}
                </ObfuscatedLink>
              </li>
              <li>
                <ObfuscatedLink href="/faq">FAQ</ObfuscatedLink>
              </li>
              <li>
                <ObfuscatedLink href="/mentions">
                  {t("mentions-legales")}
                </ObfuscatedLink>
              </li>
              <li>
                <ObfuscatedLink href="/confidentialite">
                  {t("politique-de-confidentialite")}
                </ObfuscatedLink>
              </li>
              <li>
                <ObfuscatedLink href="/cookies">
                  {t("politique-de-cookies")}
                </ObfuscatedLink>
              </li>
              <li>
                <ObfuscatedLink href="/cgv" className="hover:opacity-80">
                  {t("cgv")}
                </ObfuscatedLink>
              </li>
              <li>
                <ObfuscatedLink href="/cgu">{t("cgu")}</ObfuscatedLink>
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
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">
              <ObfuscatedLink href="/secteurs">{t("secteurs")}</ObfuscatedLink>
            </p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
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
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">
              <ObfuscatedLink href="/blog">
                {t("derniers-articles")}
              </ObfuscatedLink>
            </p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
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
          <div className="flex flex-col gap-2 w-52">
            <p className="text-secondary text-xl">{t("prestataires")}</p>
            <ul className="text-secondary text-sm flex flex-col gap-2">
              <li>
                <ObfuscatedLink href="/prestataire">
                  {t("devenir-prestataire")}
                </ObfuscatedLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
