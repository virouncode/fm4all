import Author from "@/components/author/Author";
import Bloc from "@/components/blocs/Bloc";
import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import TltrCard from "@/components/cards/TltrCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { capitalize } from "@/lib/utils/capitalize";
import {
  getArticlesSlugEn,
  getArticlesSlugFr,
  getArticlesSubSlugEn,
  getArticlesSubSlugFr,
} from "@/redirects/articlesSlugMappings";
import { urlFor } from "@/sanity/lib/image";
import { fetchArticleSlugs, getArticle } from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortableTextBlock, PortableTextComponentProps } from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArticleCategory,
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot,
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
            alt={value.alt || "article illustration"}
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

export type PtComponentsType = typeof ptComponents;

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

  const categorieSlug = categorie.slug?.current;

  const articleBlocs = [
    {
      id: 1,
      imageUrl: articleImageBloc1Url,
      imageAlt: articleImageBloc1Alt,
      bloc: article.bloc1,
      side: "left" as const,
    },
    {
      id: 2,
      imageUrl: articleImageBloc2Url,
      imageAlt: articleImageBloc2Alt,
      bloc: article.bloc2,
      side: "right" as const,
    },
    {
      id: 3,
      imageUrl: articleImageBloc3Url,
      imageAlt: articleImageBloc3Alt,
      bloc: article.bloc3,
      side: "left" as const,
    },
    {
      id: 4,
      imageUrl: articleImageBloc4Url,
      imageAlt: articleImageBloc4Alt,
      bloc: article.bloc4,
      side: "right" as const,
    },
    {
      id: 5,
      imageUrl: articleImageBloc5Url,
      imageAlt: articleImageBloc5Alt,
      bloc: article.bloc5,
      side: "left" as const,
    },
    {
      id: 6,
      imageUrl: articleImageBloc6Url,
      imageAlt: articleImageBloc6Alt,
      bloc: article.bloc6,
      side: "right" as const,
    },
    {
      id: 7,
      imageUrl: articleImageBloc7Url,
      imageAlt: articleImageBloc7Alt,
      bloc: article.bloc7,
      side: "left" as const,
    },
    {
      id: 8,
      imageUrl: articleImageBloc8Url,
      imageAlt: articleImageBloc8Alt,
      bloc: article.bloc8,
      side: "right" as const,
    },
    {
      id: 9,
      imageUrl: articleImageBloc9Url,
      imageAlt: articleImageBloc9Alt,
      bloc: article.bloc9,
      side: "left" as const,
    },
    {
      id: 10,
      imageUrl: articleImageBloc10Url,
      imageAlt: articleImageBloc10Alt,
      bloc: article.bloc10,
      side: "right" as const,
    },
  ];

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
          {categorieSlug && (
            <BreadcrumbItem>
              <BreadcrumbLink className="flex items-center" asChild>
                <Link
                  href={{
                    pathname: `/blog/[slug]`,
                    params: { slug: categorieSlug },
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

      {article.description && article.tltr && articleImageUrl && (
        <TltrCard
          description={article.description}
          tltr={article.tltr}
          devisButtonTitle={tGlobal("mon-devis-en-ligne")}
          imageUrl={articleImageUrl.url()}
          imageAlt={articleImageAlt}
        />
      )}
      {articleBlocs
        .filter(
          (item) =>
            item.bloc && Array.isArray(item.bloc) && item.bloc.length > 0
        )
        .map(({ id, imageUrl, imageAlt, bloc, side }) => {
          if (!bloc) return null;
          return (
            <Bloc
              side={side}
              key={id}
              imageUrl={imageUrl?.url()}
              imageAlt={imageAlt}
              bloc={bloc}
              ptComponents={ptComponents}
            />
          );
        })}
      <Author
        portraitUrl={auteurImageUrl?.url()}
        portraitAlt={auteurImageAlt}
        prenom={auteur.prenom}
        nom={auteur.nom}
        date={article.date}
        locale={locale}
      />
      <CTAContactButtons />
    </main>
  );
};

export default page;
