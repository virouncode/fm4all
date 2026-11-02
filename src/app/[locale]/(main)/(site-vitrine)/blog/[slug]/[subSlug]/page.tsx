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
import { AlternateSlugs } from "@/context/AlternateSlugsContext";
import { Link, permanentRedirect } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { articleSlugsParLocale } from "@/lib/i18n/articleAlternates";
import { generatePageMetadata } from "@/lib/metadata/metadata-helpers";
import { capitalize } from "@/lib/utils/capitalize";
import { urlFor } from "@/sanity/lib/image";
import {
  fetchArticleSlugs,
  findArticleJumelle,
  getArticle,
} from "@/sanity/queries";
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
} from "../../../../../../../../sanity.types";

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
        <div className="relative mx-auto my-6 mb-20 h-[200px] w-full md:h-[400px]">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || "article illustration"}
            fill
            className="m-0 object-contain"
            sizes="(min-width:768px) 100vw, 100vw"
          />
        </div>
      );
    },
  },
  block: {
    essentiel: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allessential mt-10 text-2xl font-bold">
          {props.children}
        </p>
      );
    },
    confort: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allcomfort mt-10 text-2xl font-bold">
          {props.children}
        </p>
      );
    },
    excellence: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allexcellence mt-10 text-2xl font-bold">
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
  params: Promise<{ slug: string; subSlug: string; locale: LocaleType }>;
}) => {
  const { slug, subSlug, locale } = await params;
  const article = await getArticle(subSlug, locale);

  return generatePageMetadata(
    "blogArticle",
    locale,
    article?.baliseTitle ?? "",
    article?.baliseDescription ?? "",
    article?.imagePrincipale
      ? urlFor(article.imagePrincipale).url()
      : undefined,
    // hreflang depuis les jumelles Sanity ; la table manuelle en repli.
    articleSlugsParLocale(locale, slug, subSlug, article?.jumelles),
  );
};

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
  params: Promise<{ slug: string; subSlug: string; locale: LocaleType }>;
}) => {
  const { slug, subSlug, locale } = await params;
  setRequestLocale(locale);
  const tGlobal = await getTranslations({ locale, namespace: "Global" });
  const tBlog = await getTranslations({
    locale,
    namespace: "BlogPage",
  });
  const article = await getArticle(subSlug, locale);
  if (!article) {
    // Slug de l'autre langue sous cette locale (lien ancien, table manuelle
    // en retard) : on envoie vers la jumelle au lieu de servir l'autre langue.
    const jumelle = await findArticleJumelle(subSlug, locale);
    if (jumelle) {
      permanentRedirect({
        href: { pathname: "/blog/[slug]/[subSlug]", params: jumelle },
        locale,
      });
    }
    notFound();
  }
  const alternates = articleSlugsParLocale(
    locale,
    slug,
    subSlug,
    article.jumelles,
  );
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
  const categorie = article.categorie as ArticleCategory;
  const categorieSlug = categorie.slug?.current;

  const articleBlocs = [
    { image: article.imageBloc1, bloc: article.bloc1 },
    { image: article.imageBloc2, bloc: article.bloc2 },
    { image: article.imageBloc3, bloc: article.bloc3 },
    { image: article.imageBloc4, bloc: article.bloc4 },
    { image: article.imageBloc5, bloc: article.bloc5 },
    { image: article.imageBloc6, bloc: article.bloc6 },
    { image: article.imageBloc7, bloc: article.bloc7 },
    { image: article.imageBloc8, bloc: article.bloc8 },
    { image: article.imageBloc9, bloc: article.bloc9 },
    { image: article.imageBloc10, bloc: article.bloc10 },
  ].map(({ image, bloc }, index) => ({
    id: index + 1,
    imageUrl: image ? urlFor(image) : null,
    imageAlt: image?.alt ?? tGlobal("illustration-de-l-article"),
    bloc,
    side: (index % 2 === 0 ? "left" : "right") as "left" | "right",
  }));

  return (
    <main className="mx-auto mb-24 max-w-7xl px-6 py-4 hyphens-auto md:px-20">
      <AlternateSlugs value={alternates} />
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="flex flex-wrap text-sm lg:text-base">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                className="flex items-center"
                href={`/`}
                title={tBlog("accueil")}
              >
                <HomeIcon size={14} />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center" asChild>
              <Link href={"/blog"}>{tGlobal("articles")}</Link>
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
      {article.titre &&
        article.description &&
        article.tltr &&
        articleImageUrl && (
          <TltrCard
            description={article.description}
            tltr={article.tltr}
            devisButtonTitle={tGlobal("mon-devis-en-ligne")}
            imageUrl={articleImageUrl.url()}
            imageAlt={articleImageAlt}
            titre={article.titre}
          />
        )}
      {articleBlocs
        .filter(
          (item) =>
            item.bloc && Array.isArray(item.bloc) && item.bloc.length > 0,
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
      />
      <CTAContactButtons />
    </main>
  );
};

export default page;
