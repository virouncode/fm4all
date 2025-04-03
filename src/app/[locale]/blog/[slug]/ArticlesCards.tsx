import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { ARTICLES_OF_CATEGORIE_QUERY } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";
import { Article, ArticleCategory } from "../../../../../sanity.types";

type ArticlesCardsProps = {
  categorie: ArticleCategory;
};

const ArticlesCards = async ({ categorie }: ArticlesCardsProps) => {
  const t = await getTranslations("Global");
  const locale = await getLocale();
  const articles = await client.fetch<Article[]>(ARTICLES_OF_CATEGORIE_QUERY, {
    language: locale,
    slug: categorie.slug?.current,
  });
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center mt-6 w-full">
      {articles.map((article) => {
        const articleImageUrl = article.imagePrincipale
          ? urlFor(article.imagePrincipale)
          : null; //TODO placeholder image
        const articleImageAlt = article.imagePrincipale?.alt
          ? article.imagePrincipale.alt
          : t("illustration-de-l-article");
        const articleSlug = categorie.slug?.current ?? "";
        const articleSubSlug = article.subSlug?.current ?? "";

        return articleImageUrl ? (
          <ImgCardVertical
            key={article._id}
            src={articleImageUrl.width(800).url()}
            alt={articleImageAlt}
            href={{
              pathname: "/blog/[slug]/[subSlug]",
              params: { slug: articleSlug, subSlug: articleSubSlug },
            }}
          >
            <div className="p-4 flex flex-col gap-4 h-52">
              <p className="text-2xl">{article.titre}</p>
              <p className="w-full overflow-hidden line-clamp-3">
                {article.description}
              </p>
              <div className="flex-1 underline">{t("lire-la-suite")}</div>
            </div>
          </ImgCardVertical>
        ) : null;
      })}
    </div>
  );
};

export default ArticlesCards;
