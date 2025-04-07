import ExpertiseCarousel from "@/app/[locale]/services/[slug]/ExpertiseCarousel";
import CTAContactButtons from "@/components/cta-contact-buttons";
import DevisButton from "@/components/devis-button";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  getArticlesSlugEn,
  getArticlesSlugFr,
  getArticlesSubSlugFr,
} from "@/i18n/articlesSlugMappings";
import { capitalize } from "@/lib/capitalize";
import { generateAlternates } from "@/lib/metadata-helpers";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { ARTICLE_QUERY } from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { DateTime } from "luxon";
import { getLocale, getTranslations } from "next-intl/server";
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponentProps,
} from "next-sanity";
import Image from "next/image";
import {
  Article,
  ArticleCategory,
  Auteur,
  Secteur,
  Service,
  SousService,
} from "../../../../../../sanity.types";

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
  params: Promise<{ slug: string; subSlug: string }>;
}) => {
  const { slug, subSlug } = await params;
  const locale = await getLocale();
  const article = await client.fetch<
    Article & {
      categorie: ArticleCategory;
      auteur: Auteur;
      servicesAssocies: Service[];
      sousServicesAssocies: SousService[];
      secteursAssocies: Secteur[];
      articlesAssocies: Article[];
    }
  >(
    ARTICLE_QUERY,
    { subSlug }
    // options
  );
  return generateAlternates(
    "blogArticle",
    locale,
    article.baliseTitle ?? "",
    article.baliseDescription ?? "",
    article.imagePrincipale
      ? urlFor(article.imagePrincipale).url()
      : "/img/logo_full_white.webp.png",
    {
      fr: {
        slug: locale === "fr" ? slug : getArticlesSlugFr(slug),
        subSlug: locale === "fr" ? subSlug : getArticlesSubSlugFr(slug),
      },
      en: {
        slug: locale === "en" ? slug : getArticlesSlugEn(slug),
        subSlug: locale === "en" ? subSlug : getArticlesSubSlugFr(slug),
      },
    }
  );
};

const page = async ({ params }: { params: Promise<{ subSlug: string }> }) => {
  const tGlobal = await getTranslations("Global");
  const t = await getTranslations("ServicesPage");
  const locale = await getLocale();
  // const options = { next: { revalidate: 30 } };
  const article = await client.fetch<
    Article & {
      categorie: ArticleCategory;
      auteur: Auteur;
      servicesAssocies: Service[];
      sousServicesAssocies: SousService[];
      secteursAssocies: Secteur[];
      articlesAssocies: Article[];
    }
  >(
    ARTICLE_QUERY,
    await params
    // options
  );
  const auteur = article.auteur as Auteur;
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
        <BreadcrumbList className="text-sm lg:text-base">
          <BreadcrumbLink className="flex items-center" href={`/`}>
            <HomeIcon size={14} />
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href={"/blog"} className="flex items-center">
            {tGlobal("articles")}
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink
            href={`/blog/${categorie.slug?.current}`}
            className="flex items-center"
          >
            {capitalize(categorie.titre)}
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{article.titre}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <section className="flex flex-row gap-10 mb-16">
        <div className="flex flex-col flex-1 justify-start text-lg gap-10">
          <h1 className="text-5xl">{article.titre}</h1>
          <div className="flex gap-4 items-center">
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
              {auteur.prenom} {auteur.nom}, le{" "}
              {DateTime.fromISO(article.date || "")
                .setLocale(locale)
                .toLocaleString(DateTime.DATETIME_SHORT)}
            </p>
          </div>
          <div
            className="flex flex-col gap-4 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto prose-p:m-0
          prose-li:list-check prose-li:m-0
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
      {(article.secteursAssocies ||
        article.servicesAssocies ||
        article.sousServicesAssocies) && (
        <section className="flex flex-row gap-10 mb-16">
          <div className="w-full">
            <h2 className="border-l-2 px-4 text-4xl mb-10">
              {t("notre-expertise")}
            </h2>
            <ExpertiseCarousel
              services={article.servicesAssocies}
              // sousServices={article.sousServicesAssocies}
              secteurs={article.secteursAssocies}
            />
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
        prose-li:list-check prose-li:m-0
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
        prose-li:list-check prose-li:m-0
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
          prose-li:list-check prose-li:m-0
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
          prose-li:list-check prose-li:m-0
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
          prose-li:list-check prose-li:m-0
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
          prose-li:list-check prose-li:m-0
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
          prose-li:list-check prose-li:m-0
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
          prose-li:list-check prose-li:m-0
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
          prose-li:list-check prose-li:m-0
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
          prose-li:list-check prose-li:m-0
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

      <CTAContactButtons />
    </main>
  );
};

export default page;
