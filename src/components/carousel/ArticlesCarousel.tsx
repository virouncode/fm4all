import ImgCardVertical from "@/components/cards/ImgCardVertical";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LocaleType } from "@/i18n/routing";
import { urlFor } from "@/sanity/lib/image";
import { getLastArticles } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";
import { ArticleCategory } from "../../../sanity.types";

type ArticlesCarouselProps = {
  obfuscated?: boolean;
};

const ArticlesCarousel = async ({
  obfuscated = false,
}: ArticlesCarouselProps) => {
  const t = await getTranslations("Global");
  // const options = { next: { revalidate: 30 } };
  const locale = await getLocale();
  const articles = await getLastArticles(locale as LocaleType);

  if (!articles || articles.length === 0) return null;

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="py-1">
        {articles.map((article) => {
          const articleImageUrl = article.imagePrincipale
            ? urlFor(article.imagePrincipale)
            : null; //TODO placeholder image
          const articleImageAlt =
            article.imagePrincipale?.alt ?? t("illustration-de-l-article");

          const categorie = article.categorie as ArticleCategory;
          const articleSlug = categorie.slug?.current;
          const articleSubSlug = article.subSlug?.current;
          return articleImageUrl && articleSlug && articleSubSlug ? (
            <CarouselItem
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              key={article._id}
            >
              <ImgCardVertical
                src={articleImageUrl.width(500).height(500).url()}
                alt={articleImageAlt}
                href={{
                  pathname: `/blog/[slug]/[subSlug]`,
                  params: { slug: articleSlug, subSlug: articleSubSlug },
                }}
                linkText={article.linkText ?? articleSubSlug}
                obfuscated={obfuscated}
              >
                <div className="flex h-60 flex-col gap-4 p-4">
                  <p className="text-2xl">{article.titre}</p>
                  <p className="line-clamp-5 w-full overflow-hidden text-sm">
                    {article.description}
                  </p>
                </div>
              </ImgCardVertical>
            </CarouselItem>
          ) : null;
        })}
      </CarouselContent>
      <CarouselPrevious className="-top-9 left-auto right-12 translate-y-0" />
      <CarouselNext className="-top-9 right-0 translate-y-0" />
    </Carousel>
  );
};

export default ArticlesCarousel;
