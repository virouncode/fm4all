import ArticlesCarousel from "@/app/ArticlesCarousel";
import { Link } from "@/i18n/navigation";
import { generateAlternates } from "@/lib/metadata-helpers";
import { client } from "@/sanity/lib/client";
import { TOUTES_CATEGORIES_QUERY } from "@/sanity/queries";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ArticleCategory } from "../../../../sanity.types";
import ArticlesCategorieCarousel from "./ArticlesCategorieCarousel";
export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "cgu",
    locale,
    locale === "fr" ? "Articles" : "Posts",
    locale === "fr"
      ? "Blog : nos articles sur les services aux entreprises"
      : "Blog: Our posts on business services in Paris"
  );
};

const page = async () => {
  const t = await getTranslations("BlogPage");
  const tArticles = await getTranslations("HomePage.articles");
  const locale = await getLocale();
  const categories = await client.fetch<ArticleCategory[]>(
    TOUTES_CATEGORIES_QUERY,
    { language: locale }
  );

  return (
    <main className="max-w-7xl min-h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
      <section className="mt-6 flex flex-col gap-20">
        <h1 className="text-4xl">
          {t("blog-nos-articles-sur-les-services-aux-entreprises")}
        </h1>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4">
            {tArticles("nos-derniers-articles")}
          </h2>
          <ArticlesCarousel />
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="border-l-2 px-4 text-3xl mb-4">
            {t("par-categorie")}
          </h2>
          <div className="flex flex-col gap-14">
            {categories.map((categorie) => (
              <div key={categorie._id} className="flex flex-col gap-6">
                <Link
                  href={{
                    pathname: "/blog/[slug]",
                    params: { slug: categorie.slug?.current ?? "" },
                  }}
                  className="text-2xl underline hover:opacity-80"
                >
                  {categorie.titre}
                </Link>
                <ArticlesCategorieCarousel categorie={categorie} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
