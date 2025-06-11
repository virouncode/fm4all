import ImgCardVertical from "@/components/cards/ImgCardVertical";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocaleType } from "@/i18n/routing";
import { getTagSlugEn, getTagSlugFr } from "@/i18n/tagsSlugMappings";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { capitalize } from "@/lib/utils/capitalize";
import { urlFor } from "@/sanity/lib/image";
import {
  fetchTagsSlugs,
  getTagNom,
  getTagRelatedArticles,
  getTagRelatedSecteurs,
  getTagRelatedServices,
} from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArticleCategory } from "../../../../../../sanity.types";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) => {
  const { slug, locale } = await params;
  return generateAlternates(
    "tag",
    locale,
    locale === "fr"
      ? `Page des articles, services et secteurs associés au tag : ${capitalize(slug)}`
      : `Tag page for articles, services and sectors associated with: ${capitalize(slug)}`,
    locale === "fr"
      ? `Découvrez nos articles, services et secteurs associés au tag "${slug}"`
      : `Discover our articles, services and sectors associated with the tag "${slug}"`,
    undefined,
    {
      fr: locale === "fr" ? slug : getTagSlugFr(slug),
      en: locale === "en" ? slug : getTagSlugEn(slug),
    }
  );
};

export const dynamic = "force-static";

export const generateStaticParams = async () => {
  // Récupérer tous les slugs de services depuis Sanity
  const slugsFr = await fetchTagsSlugs();
  const slugsEn = await fetchTagsSlugs("en");

  return [
    ...slugsFr.map((slug) => ({ slug, locale: "fr" })),
    ...slugsEn.map((slug) => ({ slug, locale: "en" })),
  ];
};

const page = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: LocaleType }>;
}) => {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Global" });
  const query = Promise.all([
    getTagRelatedServices(locale, slug),
    getTagRelatedArticles(locale, slug),
    getTagRelatedSecteurs(locale, slug),
  ]);
  const [services, articles, secteurs] = await query;
  const tag = await getTagNom(slug);

  if (!tag) {
    notFound();
  }

  const nom = tag.nom;

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="text-sm lg:text-base flex flex-wrap">
          <BreadcrumbItem>
            <BreadcrumbLink
              className="flex items-center"
              href={`/`}
              title={t("accueil")}
            >
              <HomeIcon size={14} />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>tag</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{nom}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-4xl mb-10">Tag &quot;{nom}&quot;</h1>
      <section className="flex flex-row gap-10 mb-16">
        <div className="flex flex-col flex-1 justify-start gap-10 w-full">
          <Tabs
            defaultValue={
              services.length
                ? "services"
                : secteurs.length
                  ? "secteurs"
                  : "articles"
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
                      service.imagePrincipale?.alt ??
                      t("illustration-du-service");
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
                          locale={locale}
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
                      secteur.imagePrincipale?.alt ??
                      t("illustration-du-secteur");
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
                          locale={locale}
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
                      article.imagePrincipale?.alt ??
                      t("illustration-de-l-article");
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
                            params: {
                              slug: articleSlug,
                              subSlug: articleSubSlug,
                            },
                          }}
                          locale={locale}
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
        </div>
      </section>
    </main>
  );
};

export default page;
