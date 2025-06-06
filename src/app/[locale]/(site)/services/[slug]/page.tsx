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
import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import {
  getServicesSlugEn,
  getServicesSlugFr,
} from "@/i18n/servicesSlugMappings";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { urlFor } from "@/sanity/lib/image";
import {
  fetchServiceSlugs,
  getAssociatedToService,
  getService,
} from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponentProps,
} from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Slug } from "sanity";
import { ArticleCategory } from "../../../../../../sanity.types";

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

export const generateStaticParams = async () => {
  // Récupérer tous les slugs de services depuis Sanity
  const slugsFr = await fetchServiceSlugs();
  const slugsEn = await fetchServiceSlugs("en");

  return [
    ...slugsFr.map((slug) => ({ slug, locale: "fr" })),
    ...slugsEn.map((slug) => ({ slug, locale: "en" })),
  ];
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> => {
  const { slug, locale } = await params;
  const service = await getService(slug);
  return generateAlternates(
    "servicePresentation",
    locale,
    service.baliseTitle ?? "",
    service.baliseDescription ?? "",
    service.imagePrincipale ? urlFor(service.imagePrincipale).url() : undefined,
    {
      fr: locale === "fr" ? slug : getServicesSlugFr(slug),
      en: locale === "en" ? slug : getServicesSlugEn(slug),
    }
  );
};

export const dynamic = "force-static";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string; locale: LocaleType }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const tGlobal = await getTranslations({ locale, namespace: "Global" }); //car force-static
  const t = await getTranslations({ locale, namespace: "ServicesPage" });

  const service = await getService(slug);
  if (!service) {
    console.log("Service not found");
    notFound();
  }
  const tagsSortants = service.tagsSortants as {
    _id: string;
    nom: string;
    slug: Slug;
  }[];

  const associated = await getAssociatedToService(
    locale as LocaleType,
    tagsSortants.map((tag) => tag._id),
    service._id
  );

  const serviceImageUrl = service.imagePrincipale
    ? urlFor(service.imagePrincipale)
    : null; //TODO placeholder image
  const serviceImageAlt = service.imagePrincipale?.alt
    ? service.imagePrincipale.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc1Url = service.imageBloc1
    ? urlFor(service.imageBloc1)
    : null;
  const serviceImageBloc1Alt = service.imageBloc1?.alt
    ? service.imageBloc1.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc2Url = service.imageBloc2
    ? urlFor(service.imageBloc2)
    : null;
  const serviceImageBloc2Alt = service.imageBloc2?.alt
    ? service.imageBloc2.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc3Url = service.imageBloc3
    ? urlFor(service.imageBloc3)
    : null;
  const serviceImageBloc3Alt = service.imageBloc3?.alt
    ? service.imageBloc3.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc4Url = service.imageBloc4
    ? urlFor(service.imageBloc4)
    : null;
  const serviceImageBloc4Alt = service.imageBloc4?.alt
    ? service.imageBloc4.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc5Url = service.imageBloc5
    ? urlFor(service.imageBloc5)
    : null;
  const serviceImageBloc5Alt = service.imageBloc5?.alt
    ? service.imageBloc5.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc6Url = service.imageBloc6
    ? urlFor(service.imageBloc6)
    : null;
  const serviceImageBloc6Alt = service.imageBloc6?.alt
    ? service.imageBloc6.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc7Url = service.imageBloc7
    ? urlFor(service.imageBloc7)
    : null;
  const serviceImageBloc7Alt = service.imageBloc7?.alt
    ? service.imageBloc7.alt
    : tGlobal("illustration-du-service");

  const serviceImageBloc8Url = service.imageBloc8
    ? urlFor(service.imageBloc8)
    : null;
  const serviceImageBloc8Alt = service.imageBloc8?.alt
    ? service.imageBloc8.alt
    : tGlobal("illustration-du-service");

  const serviceImageBloc9Url = service.imageBloc9
    ? urlFor(service.imageBloc9)
    : null;
  const serviceImageBloc9Alt = service.imageBloc9?.alt
    ? service.imageBloc9.alt
    : tGlobal("illustration-du-service");

  const serviceImageBloc10Url = service.imageBloc10
    ? urlFor(service.imageBloc10)
    : null;
  const serviceImageBloc10Alt = service.imageBloc10?.alt
    ? service.imageBloc10.alt
    : tGlobal("illustration-du-service");

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
            <BreadcrumbLink className="flex items-center" asChild>
              <Link
                href={`/services`}
                locale={locale}
                title={t("nos-services")}
              >
                {t("nos-services")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{service.titre}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-4xl md:text-5xl mb-10">{service.titre}</h1>
      <section className="flex flex-row gap-10 mb-16">
        <div className="flex flex-col flex-1 justify-start text-lg gap-8">
          <div className="flex flex-row gap-2 flex-wrap">
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
            <p className="font-bold">{service.description}</p>
            {Array.isArray(service.tltr) && (
              <PortableText value={service.tltr} />
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
        {serviceImageUrl ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={serviceImageUrl.url()}
              alt={serviceImageAlt}
              quality={100}
              className="object-cover object-center"
              fill={true}
              unoptimized={true}
            />
          </div>
        ) : null}
      </section>
      {(associated.articles || associated.services || associated.secteurs) && (
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
        {serviceImageBloc1Url ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={serviceImageBloc1Url.url()}
              alt={serviceImageBloc1Alt}
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
          {Array.isArray(service.bloc1) && (
            <PortableText value={service.bloc1} components={ptComponents} />
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
          {Array.isArray(service.bloc2) && (
            <PortableText value={service.bloc2} components={ptComponents} />
          )}
        </div>
        {serviceImageBloc2Url ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={serviceImageBloc2Url.url()}
              alt={serviceImageBloc2Alt}
              quality={100}
              className="object-cover object-center"
              fill={true}
              unoptimized={true}
            />
          </div>
        ) : null}
      </section>

      {/* Bloc 3 */}
      {Array.isArray(service.bloc3) && service.bloc3.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {serviceImageBloc3Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc3Url.url()}
                alt={serviceImageBloc3Alt}
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
            <PortableText value={service.bloc3} components={ptComponents} />
          </div>
        </section>
      )}

      {/* Bloc 4 */}
      {Array.isArray(service.bloc4) && service.bloc4.length > 0 && (
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
            <PortableText value={service.bloc4} components={ptComponents} />
          </div>
          {serviceImageBloc4Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc4Url.url()}
                alt={serviceImageBloc4Alt}
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
      {Array.isArray(service.bloc5) && service.bloc5.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {serviceImageBloc5Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc5Url.url()}
                alt={serviceImageBloc5Alt}
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
            <PortableText value={service.bloc5} components={ptComponents} />
          </div>
        </section>
      )}
      {/* Bloc 6 */}
      {Array.isArray(service.bloc6) && service.bloc6.length > 0 && (
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
            <PortableText value={service.bloc6} components={ptComponents} />
          </div>
          {serviceImageBloc6Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc6Url.url()}
                alt={serviceImageBloc6Alt}
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
      {Array.isArray(service.bloc7) && service.bloc7.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {serviceImageBloc7Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc7Url.url()}
                alt={serviceImageBloc7Alt}
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
            <PortableText value={service.bloc7} components={ptComponents} />
          </div>
        </section>
      )}
      {/* Bloc 8 */}
      {Array.isArray(service.bloc8) && service.bloc8.length > 0 && (
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
            <PortableText value={service.bloc8} components={ptComponents} />
          </div>
          {serviceImageBloc8Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc8Url.url()}
                alt={serviceImageBloc8Alt}
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
      {Array.isArray(service.bloc9) && service.bloc9.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {serviceImageBloc9Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc9Url.url()}
                alt={serviceImageBloc9Alt}
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
            <PortableText value={service.bloc9} components={ptComponents} />
          </div>
        </section>
      )}
      {/* Bloc 10 */}
      {Array.isArray(service.bloc10) && service.bloc10.length > 0 && (
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
            <PortableText value={service.bloc10} components={ptComponents} />
          </div>
          {serviceImageBloc10Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc10Url.url()}
                alt={serviceImageBloc10Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
        </section>
      )}

      <CTAContactButtons />
    </main>
  );
}
