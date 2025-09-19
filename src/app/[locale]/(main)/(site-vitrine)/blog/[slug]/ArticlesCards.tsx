import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { urlFor } from "@/sanity/lib/image";
import { getTranslations } from "next-intl/server";
import { Article, ArticleCategory } from "../../../../../../../sanity.types";

type ArticlesCardsProps = {
  articles: Article[];
  categorie: ArticleCategory;
};

const ArticlesCards = async ({ articles, categorie }: ArticlesCardsProps) => {
  const t = await getTranslations("Global");

  return (
    <div className="mt-6 grid w-full grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-center gap-6">
      {articles.map((article, index) => {
        const articleImageUrl = article.imagePrincipale
          ? urlFor(article.imagePrincipale)
          : null; //TODO placeholder image
        const articleImageAlt = article.imagePrincipale?.alt
          ? article.imagePrincipale.alt
          : t("illustration-de-l-article");
        const articleSlug = categorie.slug?.current;
        const articleSubSlug = article.subSlug?.current;

        return articleImageUrl && articleSlug && articleSubSlug ? (
          <ImgCardVertical
            key={article._id}
            src={articleImageUrl.width(500).height(500).url()}
            alt={articleImageAlt}
            href={{
              pathname: "/blog/[slug]/[subSlug]",
              params: { slug: articleSlug, subSlug: articleSubSlug },
            }}
            linkText={article.linkText ?? articleSubSlug}
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "auto"}
          >
            <div className="flex h-52 flex-col gap-4 p-4">
              <p className="text-2xl">{article.titre}</p>
              <p className="line-clamp-5 w-full overflow-hidden text-sm">
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
