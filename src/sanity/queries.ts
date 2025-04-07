import {
  Article,
  ArticleCategory,
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot,
  Secteur,
  Service,
  Slug,
} from "../../sanity.types";
import { client } from "./lib/client";

//SERVICES
export const ALL_SERVICES_QUERY = `*[_type == "service" && language == $language]|order(date asc){ _id, titre, description, slug, imagePrincipale }`;
export const getAllServices = async (locale: "fr" | "en") => {
  return await client.fetch<Service[]>(ALL_SERVICES_QUERY, {
    language: locale,
  });
};

export const SERVICE_QUERY = `*[_type == "service" && slug.current == $slug][0]{
  ...,
  tagsEntrants[]->{
    _id,
    nom,
    slug
  },
  tagsSortants[]->{
    _id,
    nom,
    slug
  }
}`;
export const getService = async (slug: string) => {
  return await client.fetch<
    Service & {
      tagsEntrants: { _id: string; nom: string; slug: Slug }[];
      tagsSortants: { _id: string; nom: string; slug: Slug }[];
    }
  >(SERVICE_QUERY, {
    slug,
  });
};

export const ASSOCIATED_TO_SERVICE_QUERY = `
{
  "articles": *[
    _type == "article" &&
    count(tagsEntrants[_ref in $tagIds]) > 0
  ] | order(date desc){
    ...,
    tagsEntrants[]->{
      _id,
      nom,
      slug
    },
    categorie->{
      _id,
      titre,
      slug
    }
  },
  "services": *[
    _type == "service" &&
    _id != $currentId &&
    count(tagsEntrants[_ref in $tagIds]) > 0
  ] | order(date desc){
    ...,
    tagsEntrants[]->{
      _id,
      nom,
      slug
    }
  },
  "secteurs": *[
    _type == "secteur" &&
    count(tagsEntrants[_ref in $tagIds]) > 0
  ] | order(date desc){
    ...,
    tagsEntrants[]->{
      _id,
      nom,
      slug
    }
  }
}`;
export const getAssociatedToService = async (
  tagIds: string[],
  currentId: string
): Promise<{
  articles: (Article & {
    tagsEntrants: { _id: string; nom: string; slug: Slug }[];
    categorie: ArticleCategory;
  })[];
  services: (Service & {
    tagsEntrants: { _id: string; nom: string; slug: Slug }[];
  })[];
  secteurs: (Secteur & {
    tagsEntrants: { _id: string; nom: string; slug: Slug }[];
  })[];
}> => {
  return await client.fetch(ASSOCIATED_TO_SERVICE_QUERY, {
    tagIds,
    currentId,
  });
};

export const ASSOCIATED_TO_ARTICLE_QUERY = `
{
  "articles": *[
    _type == "article" &&
    _id != $currentId &&
    count(tagsEntrants[_ref in $tagIds]) > 0
  ] | order(date desc){
    ...,
    tagsEntrants[]->{
      _id,
      nom,
      slug
    },
    categorie->{
      _id,
      titre,
      slug
    }
  },
  "services": *[
    _type == "service" &&
    count(tagsEntrants[_ref in $tagIds]) > 0
  ] | order(date desc){
    ...,
    tagsEntrants[]->{
      _id,
      nom,
      slug
    }
  },
  "secteurs": *[
    _type == "secteur" &&
    count(tagsEntrants[_ref in $tagIds]) > 0
  ] | order(date desc){
    ...,
    tagsEntrants[]->{
      _id,
      nom,
      slug
    }
  }
}`;
export const getAssociatedToArticle = async (
  tagIds: string[],
  currentId: string
): Promise<{
  articles: (Article & {
    tagsEntrants: { _id: string; nom: string; slug: Slug }[];
    categorie: ArticleCategory;
  })[];
  services: (Service & {
    tagsEntrants: { _id: string; nom: string; slug: Slug }[];
  })[];
  secteurs: (Secteur & {
    tagsEntrants: { _id: string; nom: string; slug: Slug }[];
  })[];
}> => {
  return await client.fetch(ASSOCIATED_TO_ARTICLE_QUERY, {
    tagIds,
    currentId,
  });
};

export const TAG_RELATED_SERVICES_QUERY = `*[_type == "service" && language == $language && $slug in tagsEntrants[]->slug.current
]`;

export const getTagRelatedServices = async (
  locale: "fr" | "en",
  slug: string
): Promise<Service[]> => {
  return await client.fetch<Service[]>(TAG_RELATED_SERVICES_QUERY, {
    language: locale,
    slug,
  });
};

export const TAG_RELATED_ARTICLES_QUERY = `*[_type == "article" && language == $language && $slug in tagsEntrants[]->slug.current
]`;

export const getTagRelatedArticles = async (
  locale: "fr" | "en",
  slug: string
): Promise<(Article & { categorie: ArticleCategory })[]> => {
  return await client.fetch<(Article & { categorie: ArticleCategory })[]>(
    TAG_RELATED_ARTICLES_QUERY,
    {
      language: locale,
      slug,
    }
  );
};

export const TAG_RELATED_SECTEURS_QUERY = `*[_type == "secteur" && language == $language && $slug in tagsEntrants[]->slug.current
]`;

export const getTagRelatedSecteurs = async (
  locale: "fr" | "en",
  slug: string
): Promise<Secteur[]> => {
  return await client.fetch<Secteur[]>(TAG_RELATED_SECTEURS_QUERY, {
    language: locale,
    slug,
  });
};

export const TAG_NOMS_QUERY = `*[_type == "tag" && slug.current == $slug][0]{
nom}`;

export const getTagNom = async (slug: string) => {
  return await client.fetch<{ nom: string }>(TAG_NOMS_QUERY, {
    slug,
  });
};

//ARTICLES
export const LAST_ARTICLES_QUERY = `*[_type == "article" && language == $language]|order(date desc)[0...10]{ 
_id, titre, description, subSlug, imagePrincipale, 
categorie->{
  _id,
  titre,
  slug}
}`;

export const ARTICLES_OF_CATEGORIE_QUERY = `*[_type == "article" && language == $language && references(*[_type == "articleCategory" && slug.current == $slug]._id)]|order(date desc){ 
  _id, 
  titre, 
  description, 
  subSlug, 
  imagePrincipale 
}`;

export const CATEGORIE_QUERY = `*[_type == "articleCategory" && slug.current == $slug][0]{
  _id,
  titre,
  baliseTitre,
  baliseDescription,
  slug}`;

export const TOUTES_CATEGORIES_QUERY = `*[_type == "articleCategory" && language == $language]`;

export const ARTICLE_QUERY = `*[_type == "article" && subSlug.current == $subSlug][0]{
    ...,
    categorie->{
      _id,
      titre,
      slug
      },
    auteur->{
      _id,
      prenom,
      nom,
      image,
      },
    tagsEntrants[]->{
      _id,
      nom,
      slug
      },
    tagsSortants[]->{
      _id,
      nom,
      slug
      },
}`;
export const getArticle = async (subSlug: string) => {
  return await client.fetch<
    Article & {
      categorie: ArticleCategory;
      auteur: {
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
      tagsEntrants: { _id: string; nom: string; slug: Slug }[];
      tagsSortants: { _id: string; nom: string; slug: Slug }[];
    }
  >(ARTICLE_QUERY, {
    subSlug,
  });
};

//SITEMAP
export const fetchServiceSlugs = async () => {
  const query = `*[_type == "service" && language == "fr"]{slug{current}}`;
  const services = await client.fetch<Service[]>(query);
  return services.map((service) => service.slug?.current).filter(Boolean);
};

export const fetchArticleCategories = async () => {
  const query = `*[_type == "articleCategory" && language == "fr"]{slug{current}}`;
  const categories = await client.fetch<ArticleCategory[]>(query);
  return categories.map((categorie) => categorie.slug?.current).filter(Boolean);
};

export const fetchArticleSlugs = async () => {
  const query = `*[_type == "article" && language == "fr"]{
    subSlug { current },
    categorie-> {
      slug { current }
    }
  }`;
  const articles =
    await client.fetch<(Article & { categorie: ArticleCategory })[]>(query);
  return articles
    .map((article) => {
      const categorie = article.categorie as ArticleCategory;
      return {
        slug: categorie?.slug?.current ?? "",
        subSlug: article.subSlug?.current ?? "",
      };
    })
    .filter((item) => item.slug && item.subSlug);
};
