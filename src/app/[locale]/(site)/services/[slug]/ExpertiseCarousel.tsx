"use client";
import ImgCardVertical from "@/components/cards/ImgCardVertical";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { urlFor } from "@/sanity/lib/image";
import { useTranslations } from "next-intl";
import {
  Article,
  ArticleCategory,
  Secteur,
  Service,
} from "../../../../../../sanity.types";

type ExpertiseCarouselProps = {
  services: Service[];
  // sousServices: SousService[];
  secteurs: Secteur[];
  articles?: (Article & { categorie: ArticleCategory })[];
};

const ExpertiseCarousel = ({
  services,
  // sousServices,
  secteurs,
  articles,
}: ExpertiseCarouselProps) => {
  const t = useTranslations("Global");

  return (
    <Tabs
      defaultValue={
        services.length ? "services" : secteurs.length ? "secteurs" : "articles"
      }
    >
      <TabsList className="my-20 md:my-10 bg-transparent flex flex-col items-start md:flex-row md:items-center">
        {/* {[...(services || []), ...(sousServices || [])].length > 0 ? (
          <TabsTrigger value="services" className="text-lg">
            {t("services-associes")}
          </TabsTrigger>
        ) : null} */}
        {[...(services || [])].length > 0 ? (
          <TabsTrigger
            value="services"
            className="text-lg border-none outline-none"
          >
            | {t("services-associes")}
          </TabsTrigger>
        ) : null}
        {[...(secteurs || [])].length > 0 ? (
          <TabsTrigger value="secteurs" className="text-lg">
            | {t("secteurs-associes")}
          </TabsTrigger>
        ) : null}
        {articles && [...(articles || [])].length > 0 ? (
          <TabsTrigger value="articles" className="text-lg">
            | {t("articles-associes")}
          </TabsTrigger>
        ) : null}
      </TabsList>
      <TabsContent value="services">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="py-1">
            {/* {[...(services || []), ...(sousServices || [])] */}
            {[...(services || [])].map((service) => {
              const serviceImageUrl = service.imagePrincipale
                ? urlFor(service.imagePrincipale)
                : null; //TODO placeholder image
              const serviceImageAlt =
                service.imagePrincipale?.alt ?? t("illustration-du-service");
              const serviceUrl = service.slug?.current ?? "";
              return serviceImageUrl ? (
                <CarouselItem
                  className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  key={service._id}
                >
                  <ImgCardVertical
                    src={serviceImageUrl.width(500).height(500).url()}
                    alt={serviceImageAlt}
                    href={{
                      pathname: `/services/[slug]`,
                      params: { slug: serviceUrl },
                    }}
                    linkText={service.linkText ?? serviceUrl}
                  >
                    <div className="p-4 flex flex-col gap-4 h-56">
                      <p className="text-2xl">{service.titre}</p>
                      <p className="w-full overflow-hidden line-clamp-5">
                        {service.description}
                      </p>
                    </div>
                  </ImgCardVertical>
                </CarouselItem>
              ) : null;
            })}
          </CarouselContent>
          <CarouselPrevious className="right-12 -top-9 translate-y-0 left-auto" />
          <CarouselNext className="right-0 -top-9 translate-y-0" />
        </Carousel>
      </TabsContent>
      <TabsContent value="secteurs">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {[...(secteurs || [])].map((secteur) => {
              const secteurImageUrl = secteur.imagePrincipale
                ? urlFor(secteur.imagePrincipale)
                : null; //TODO placeholder image
              const secteurImageAlt =
                secteur.imagePrincipale?.alt ?? t("illustration-du-secteur");
              const secteurUrl = secteur.slug?.current ?? "";
              return secteurImageUrl ? (
                <CarouselItem
                  className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  key={secteur._id}
                >
                  <ImgCardVertical
                    src={secteurImageUrl.width(500).height(500).url()}
                    alt={secteurImageAlt}
                    href={{
                      pathname: `/secteurs/[slug]`,
                      params: { slug: secteurUrl },
                    }}
                    linkText={secteur.linkText ?? secteurUrl}
                  >
                    <div className="p-4 flex flex-col gap-4 h-56">
                      <p className="text-2xl">{secteur.titre}</p>
                      <p className="w-full overflow-hidden line-clamp-5">
                        {secteur.description}
                      </p>
                    </div>
                  </ImgCardVertical>
                </CarouselItem>
              ) : null;
            })}
          </CarouselContent>
          <CarouselPrevious className="right-12 -top-9 translate-y-0 left-auto" />
          <CarouselNext className="right-0 -top-9 translate-y-0" />
        </Carousel>
      </TabsContent>
      <TabsContent value="articles">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {[...(articles || [])].map((article) => {
              const articleImageUrl = article.imagePrincipale
                ? urlFor(article.imagePrincipale)
                : null; //TODO placeholder image
              const articleImageAlt =
                article.imagePrincipale?.alt ?? t("illustration-de-l-article");
              const categorie = article.categorie as ArticleCategory;
              const articleSlug = categorie.slug?.current ?? "";
              const articleSubSlug = article.subSlug?.current ?? "";

              return articleImageUrl ? (
                <CarouselItem
                  className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  key={article._id}
                >
                  <ImgCardVertical
                    src={articleImageUrl.width(500).height(500).url()}
                    alt={articleImageAlt}
                    href={{
                      pathname: "/blog/[slug]/[subSlug]",
                      params: { slug: articleSlug, subSlug: articleSubSlug },
                    }}
                    linkText={article.linkText ?? articleSubSlug}
                  >
                    <div className="p-4 flex flex-col gap-4 h-56">
                      <p className="text-2xl">{article.titre}</p>
                      <p className="w-full overflow-hidden line-clamp-5">
                        {article.description}
                      </p>
                    </div>
                  </ImgCardVertical>
                </CarouselItem>
              ) : null;
            })}
          </CarouselContent>
          <CarouselPrevious className="right-12 -top-9 translate-y-0 left-auto" />
          <CarouselNext className="right-0 -top-9 translate-y-0" />
        </Carousel>
      </TabsContent>
    </Tabs>
  );
};

export default ExpertiseCarousel;
