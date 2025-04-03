import ImgCardVertical from "@/components/cards/ImgCardVertical";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { ARTICLES_OF_CATEGORIE_QUERY } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";
import { Article, ArticleCategory } from "../../../../sanity.types";

type ArticlesCategorieCarouselProps = {
  categorie: ArticleCategory;
};

const ArticlesCategorieCarousel = async ({
  categorie,
}: ArticlesCategorieCarouselProps) => {
  const t = await getTranslations("Global");
  // const options = { next: { revalidate: 30 } };
  const locale = await getLocale();
  const articles = await client.fetch<Article[]>(ARTICLES_OF_CATEGORIE_QUERY, {
    language: locale,
    slug: categorie.slug?.current,
  });
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {articles.map((article) => {
          const articleImageUrl = article.imagePrincipale
            ? urlFor(article.imagePrincipale)
            : null; //TODO placeholder image
          const articleImageAlt =
            article.imagePrincipale?.alt ?? t("illustration-de-l-article");
          const articleSlug = categorie.slug?.current ?? "";
          const articleSubSlug = article.subSlug?.current ?? "";
          return articleImageUrl ? (
            <CarouselItem
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              key={article._id}
            >
              <ImgCardVertical
                src={articleImageUrl.width(800).url()}
                alt={articleImageAlt}
                href={{
                  pathname: `/blog/[slug]/[subSlug]`,
                  params: { slug: articleSlug, subSlug: articleSubSlug },
                }}
              >
                <div className="p-4 flex flex-col gap-4 h-56">
                  <p className="text-2xl">{article.titre}</p>
                  <p className="w-full overflow-hidden line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex-1 underline">{t("lire-la-suite")}</div>
                </div>
              </ImgCardVertical>
            </CarouselItem>
          ) : null;
        })}
      </CarouselContent>
      <CarouselPrevious className="right-12 -top-9 translate-y-0 left-auto" />
      <CarouselNext className="right-0 -top-9 translate-y-0" />
    </Carousel>
  );
};

export default ArticlesCategorieCarousel;
