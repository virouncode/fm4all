import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import DevisButton from "@/components/buttons/devis-button";
import ImgCardVertical from "@/components/cards/ImgCardVertical";
import TagButton from "@/components/tags/tag-button";
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
import {
  getArticlesSlugEn,
  getArticlesSlugFr,
  getArticlesSubSlugEn,
  getArticlesSubSlugFr,
} from "@/i18n/articlesSlugMappings";
import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { capitalize } from "@/lib/utils/capitalize";
import { urlFor } from "@/sanity/lib/image";
import {
  fetchArticleSlugs,
  getArticle,
  getAssociatedToArticle,
} from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { DateTime } from "luxon";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponentProps,
} from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArticleCategory,
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot,
  Slug,
} from "../../../../../../../sanity.types";

// Custom components for PortableText
type BlockComponentProps = PortableTextComponentProps<PortableTextBlock>;
type SanityImageValue = {
  asset?: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
  };
  crop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  alt?: string;
  _type: "image";
  _key?: string;
};
const ptComponents = {
  types: {
    image: ({ value }: { value: SanityImageValue }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="relative w-full  h-[200px] md:h-[400px] my-6 mx-auto">
          <Image
            quality={100}
            src={urlFor(value).url()}
            alt={value.alt || "illustration du service"}
            fill
            className="object-contain m-0"
            unoptimized={true}
          />
        </div>
      );
    },
  },
  block: {
    essentiel: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allessential font-bold text-2xl mt-10">
          {props.children}
        </p>
      );
    },
    confort: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allcomfort font-bold text-2xl mt-10">
          {props.children}
        </p>
      );
    },
    excellence: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allexcellence font-bold text-2xl mt-10">
          {props.children}
        </p>
      );
    },
  },
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string; locale: string }>;
}) => {
  const { slug, subSlug, locale } = await params;
  const article = await getArticle(subSlug);

  return generateAlternates(
    "blogArticle",
    locale,
    article.baliseTitle ?? "",
    article.baliseDescription ?? "",
    article.imagePrincipale ? urlFor(article.imagePrincipale).url() : undefined,
    {
      fr: {
        slug: locale === "fr" ? slug : getArticlesSlugFr(slug),
        subSlug: locale === "fr" ? subSlug : getArticlesSubSlugFr(subSlug),
      },
      en: {
        slug: locale === "en" ? slug : getArticlesSlugEn(slug),
        subSlug: locale === "en" ? subSlug : getArticlesSubSlugEn(subSlug),
      },
    }
  );
};

export const dynamic = "force-static";

export const generateStaticParams = async () => {
  const slugsSubSlugsFr = await fetchArticleSlugs("fr");
  const slugsSubSlugsEn = await fetchArticleSlugs("en");
  return [
    ...slugsSubSlugsFr.map((item) => ({
      locale: "fr",
      slug: item.slug,
      subSlug: item.subSlug,
    })),
    ...slugsSubSlugsEn.map((item) => ({
      locale: "en",
      slug: item.slug,
      subSlug: item.subSlug,
    })),
  ];
};

const page = async ({
  params,
}: {
  params: Promise<{ subSlug: string; locale: LocaleType }>;
}) => {
  const { subSlug, locale } = await params;
  setRequestLocale(locale);
  const tGlobal = await getTranslations({ locale, namespace: "Global" });
  const t = await getTranslations({ locale, namespace: "ServicesPage" });
  const tBlog = await getTranslations({
    locale,
    namespace: "BlogPage",
  });
  const article = await getArticle(subSlug);
  if (!article) {
    notFound();
  }
  const auteur = article.auteur as {
    _id: string;
    prenom: string;
    nom: string;
    image: {
      asset?: {
        _ref: string;
        _type: "reference";
        _weak?: boolean;
        [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
      };
      hotspot?: SanityImageHotspot;
      crop?: SanityImageCrop;
      alt?: string;
      _type: "image";
    };
  };
  const tagsSortants = article.tagsSortants as {
    _id: string;
    nom: string;
    slug: Slug;
  }[];
  const associated = await getAssociatedToArticle(
    locale,
    tagsSortants.map((tag) => tag._id),
    article._id
  );
  const auteurImageUrl = auteur.image ? urlFor(auteur.image) : null; //TODO placeholder image
  const auteurImageAlt = auteur.image?.alt
    ? auteur.image.alt
    : tGlobal("illustration-de-l-auteur");

  const articleImageUrl = article.imagePrincipale
    ? urlFor(article.imagePrincipale)
    : null; //TODO placeholder image
  const articleImageAlt = article.imagePrincipale?.alt
    ? article.imagePrincipale.alt
    : tGlobal("illustration-de-l-article");
  const articleImageBloc1Url = article.imageBloc1
    ? urlFor(article.imageBloc1)
    : null;
  const articleImageBloc1Alt = article.imageBloc1?.alt
    ? article.imageBloc1.alt
    : tGlobal("illustration-de-l-article");
  const articleImageBloc2Url = article.imageBloc2
    ? urlFor(article.imageBloc2)
    : null;
  const articleImageBloc2Alt = article.imageBloc2?.alt
    ? article.imageBloc2.alt
    : tGlobal("illustration-de-l-article");
  const articleImageBloc3Url = article.imageBloc3
    ? urlFor(article.imageBloc3)
    : null;
  const articleImageBloc3Alt = article.imageBloc3?.alt
    ? article.imageBloc3.alt
    : tGlobal("illustration-de-l-article");
  const articleImageBloc4Url = article.imageBloc4
    ? urlFor(article.imageBloc4)
    : null;
  const articleImageBloc4Alt = article.imageBloc4?.alt
    ? article.imageBloc4.alt
    : tGlobal("illustration-de-l-article");
  const articleImageBloc5Url = article.imageBloc5
    ? urlFor(article.imageBloc5)
    : null;
  const articleImageBloc5Alt = article.imageBloc5?.alt
    ? article.imageBloc5.alt
    : tGlobal("illustration-de-l-article");
  const articleImageBloc6Url = article.imageBloc6
    ? urlFor(article.imageBloc6)
    : null;
  const articleImageBloc6Alt = article.imageBloc6?.alt
    ? article.imageBloc6.alt
    : tGlobal("illustration-de-l-article");

  const articleImageBloc7Url = article.imageBloc7
    ? urlFor(article.imageBloc7)
    : null;
  const articleImageBloc7Alt = article.imageBloc7?.alt
    ? article.imageBloc7.alt
    : tGlobal("illustration-de-l-article");

  const articleImageBloc8Url = article.imageBloc8
    ? urlFor(article.imageBloc8)
    : null;
  const articleImageBloc8Alt = article.imageBloc8?.alt
    ? article.imageBloc8.alt
    : tGlobal("illustration-de-l-article");

  const articleImageBloc9Url = article.imageBloc9
    ? urlFor(article.imageBloc9)
    : null;
  const articleImageBloc9Alt = article.imageBloc9?.alt
    ? article.imageBloc9.alt
    : tGlobal("illustration-de-l-article");

  const articleImageBloc10Url = article.imageBloc10
    ? urlFor(article.imageBloc10)
    : null;
  const articleImageBloc10Alt = article.imageBloc10?.alt
    ? article.imageBloc10.alt
    : tGlobal("illustration-de-l-article");
  const categorie = article.categorie as ArticleCategory;

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="text-sm lg:text-base flex flex-wrap">
          <BreadcrumbItem>
            <BreadcrumbLink
              className="flex items-center"
              href={`/`}
              title={tBlog("accueil")}
            >
              <HomeIcon size={14} />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center" asChild>
              <Link href={"/blog"} locale={locale}>
                {tGlobal("articles")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {categorie.slug?.current && (
            <BreadcrumbItem>
              <BreadcrumbLink className="flex items-center" asChild>
                <Link
                  href={{
                    pathname: `/blog/[slug]`,
                    params: { slug: categorie.slug?.current },
                  }}
                  locale={locale}
                >
                  {capitalize(categorie.titre)}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{article.titre}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-4xl md:text-5xl mb-10">{article.titre}</h1>
      <section className="flex flex-row gap-10 mb-16">
        <div className="flex flex-col flex-1 justify-start text-lg gap-10">
          <div className="flex flex-row gap-4 flex-wrap">
            {tagsSortants.map((tag) => (
              <TagButton tag={tag} key={tag._id} locale={locale} />
            ))}
          </div>
          <div
            className="flex flex-col gap-4 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto prose-p:m-0
          prose-li:list-disc prose-li:m-0
          prose-a:underline"
          >
            <p className="font-bold">{article.description}</p>
            {Array.isArray(article.tltr) && (
              <PortableText value={article.tltr} />
            )}
          </div>
          <div className="flex justify-center">
            <DevisButton
              title={tGlobal("mon-devis-en-ligne")}
              text={tGlobal("mon-devis-en-ligne")}
              size="lg"
            />
          </div>
        </div>
        {articleImageUrl ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={articleImageUrl.url()}
              alt={articleImageAlt}
              quality={100}
              className="object-cover object-center"
              fill={true}
              unoptimized={true}
            />
          </div>
        ) : null}
      </section>
      {(associated.secteurs || associated.services || associated.articles) && (
        <section className="flex flex-row gap-10 mb-16">
          <div className="w-full">
            <h2 className="border-l-2 px-4 text-4xl mb-10">
              {t("notre-expertise")}
            </h2>
            <Tabs
              defaultValue={
                associated.services.length
                  ? "services"
                  : associated.secteurs.length
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
                {[...(associated.services || [])].length > 0 ? (
                  <TabsTrigger
                    value="services"
                    className="text-lg border-none outline-none"
                  >
                    | {tGlobal("services-associes")}
                  </TabsTrigger>
                ) : null}
                {[...(associated.secteurs || [])].length > 0 ? (
                  <TabsTrigger value="secteurs" className="text-lg">
                    | {tGlobal("secteurs-associes")}
                  </TabsTrigger>
                ) : null}
                {associated.articles &&
                [...(associated.articles || [])].length > 0 ? (
                  <TabsTrigger value="articles" className="text-lg">
                    | {tGlobal("articles-associes")}
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
                    {[...(associated.services || [])].map((service) => {
                      const serviceImageUrl = service.imagePrincipale
                        ? urlFor(service.imagePrincipale)
                        : null; //TODO placeholder image
                      const serviceImageAlt =
                        service.imagePrincipale?.alt ??
                        tGlobal("illustration-du-service");
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
                    {[...(associated.secteurs || [])].map((secteur) => {
                      const secteurImageUrl = secteur.imagePrincipale
                        ? urlFor(secteur.imagePrincipale)
                        : null; //TODO placeholder image
                      const secteurImageAlt =
                        secteur.imagePrincipale?.alt ??
                        tGlobal("illustration-du-secteur");
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
                    {[...(associated.articles || [])].map((article) => {
                      const articleImageUrl = article.imagePrincipale
                        ? urlFor(article.imagePrincipale)
                        : null; //TODO placeholder image
                      const articleImageAlt =
                        article.imagePrincipale?.alt ??
                        tGlobal("illustration-de-l-article");
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
      )}

      <section className="flex flex-row gap-10 mb-16">
        {articleImageBloc1Url ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={articleImageBloc1Url.url()}
              alt={articleImageBloc1Alt}
              quality={100}
              className="object-cover object-center"
              fill={true}
              unoptimized={true}
            />
          </div>
        ) : null}
        <div
          className="flex-1 prose-lg 
        prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
        prose-h3:font-bold prose-h3:text-xl
        prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
        prose-p:text-pretty prose-p:hyphens-auto
        prose-li:list-disc prose-li:m-0
        prose-a:underline
        "
        >
          {Array.isArray(article.bloc1) && (
            <PortableText value={article.bloc1} components={ptComponents} />
          )}
        </div>
      </section>
      <section className="flex flex-row gap-10 mb-16">
        <div
          className="flex-1 prose-lg 
        prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
        prose-h3:font-bold prose-h3:text-xl
        prose-p:text-pretty prose-p:hyphens-auto
        prose-li:list-disc prose-li:m-0
        prose-a:underline
        "
        >
          {Array.isArray(article.bloc2) && (
            <PortableText value={article.bloc2} components={ptComponents} />
          )}
        </div>
        {articleImageBloc2Url ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={articleImageBloc2Url.url()}
              alt={articleImageBloc2Alt}
              quality={100}
              className="object-cover object-center"
              fill={true}
              unoptimized={true}
            />
          </div>
        ) : null}
      </section>

      {/* Bloc 3 */}
      {Array.isArray(article.bloc3) && article.bloc3.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {articleImageBloc3Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={articleImageBloc3Url.url()}
                alt={articleImageBloc3Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-disc prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={article.bloc3} components={ptComponents} />
          </div>
        </section>
      )}

      {/* Bloc 4 */}
      {Array.isArray(article.bloc4) && article.bloc4.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-disc prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={article.bloc4} components={ptComponents} />
          </div>
          {articleImageBloc4Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={articleImageBloc4Url.url()}
                alt={articleImageBloc4Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
        </section>
      )}

      {/* Bloc 6 */}
      {Array.isArray(article.bloc5) && article.bloc5.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {articleImageBloc5Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={articleImageBloc5Url.url()}
                alt={articleImageBloc5Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-disc prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={article.bloc5} components={ptComponents} />
          </div>
        </section>
      )}
      {/* Bloc 6 */}
      {Array.isArray(article.bloc6) && article.bloc6.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-disc prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={article.bloc6} components={ptComponents} />
          </div>
          {articleImageBloc6Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={articleImageBloc6Url.url()}
                alt={articleImageBloc6Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
        </section>
      )}
      {/* Bloc 7 */}
      {Array.isArray(article.bloc7) && article.bloc7.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {articleImageBloc7Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={articleImageBloc7Url.url()}
                alt={articleImageBloc7Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-disc prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={article.bloc7} components={ptComponents} />
          </div>
        </section>
      )}
      {/* Bloc 8 */}
      {Array.isArray(article.bloc8) && article.bloc8.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-disc prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={article.bloc8} components={ptComponents} />
          </div>
          {articleImageBloc8Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={articleImageBloc8Url.url()}
                alt={articleImageBloc8Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
        </section>
      )}
      {/* Bloc 9 */}
      {Array.isArray(article.bloc9) && article.bloc9.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {articleImageBloc9Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={articleImageBloc9Url.url()}
                alt={articleImageBloc9Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-disc prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={article.bloc9} components={ptComponents} />
          </div>
        </section>
      )}
      {/* Bloc 10 */}
      {Array.isArray(article.bloc10) && article.bloc10.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-disc prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={article.bloc10} components={ptComponents} />
          </div>
          {articleImageBloc10Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={articleImageBloc10Url.url()}
                alt={articleImageBloc10Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
        </section>
      )}
      <div className="flex gap-4 items-center justify-end mb-10">
        {auteurImageUrl ? (
          <div className="rounded-full w-[40px] h-[40px] relative overflow-hidden">
            <Image
              src={auteurImageUrl.url()}
              alt={auteurImageAlt}
              quality={100}
              className="object-cover object-center"
              fill={true}
              unoptimized={true}
            />
          </div>
        ) : null}
        <p>
          {auteur.prenom} {auteur.nom},{" "}
          {DateTime.fromISO(article.date || "")
            .setLocale(locale)
            .toLocaleString(DateTime.DATETIME_SHORT)}
        </p>
      </div>
      <CTAContactButtons />
    </main>
  );
};

export default page;
