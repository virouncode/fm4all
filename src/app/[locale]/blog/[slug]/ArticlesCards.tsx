import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { urlFor } from "@/sanity/lib/image";
import { getArticlesOfCategorie } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";
import { ArticleCategory } from "../../../../../sanity.types";

type ArticlesCardsProps = {
  categorie: ArticleCategory;
};

const ArticlesCards = async ({ categorie }: ArticlesCardsProps) => {
  const t = await getTranslations("Global");
  const locale = await getLocale();
  const articles = await getArticlesOfCategorie(
    locale as "fr" | "en",
    categorie.slug?.current ?? ""
  );
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
