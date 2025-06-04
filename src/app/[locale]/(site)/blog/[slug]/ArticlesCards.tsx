import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { LocaleType } from "@/i18n/routing";
import { urlFor } from "@/sanity/lib/image";
import { getTranslations } from "next-intl/server";
import { Article, ArticleCategory } from "../../../../../../sanity.types";

type ArticlesCardsProps = {
  articles: Article[];
  locale: LocaleType;
  categorie: ArticleCategory;
};

const ArticlesCards = async ({
  articles,
  locale,
  categorie,
}: ArticlesCardsProps) => {
  const t = await getTranslations({ locale, namespace: "Global" });

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
            src={articleImageUrl.width(500).height(500).url()}
            alt={articleImageAlt}
            href={{
              pathname: "/blog/[slug]/[subSlug]",
              params: { slug: articleSlug, subSlug: articleSubSlug },
            }}
            locale={locale}
          >
            <div className="p-4 flex flex-col gap-4 h-52">
              <p className="text-2xl">{article.titre}</p>
              <p className="w-full overflow-hidden line-clamp-5">
                {article.description}
              </p>
            </div>
          </ImgCardVertical>
        ) : null;
      })}
    </div>
  );
};

export default ArticlesCards;
