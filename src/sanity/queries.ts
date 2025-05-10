import { LocaleType } from "@/i18n/routing";
import {
  Article,
  ArticleCategory,
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot,
  Secteur,
  Service,
  Slug,
  Tag,
} from "../../sanity.types";
import { client } from "./lib/client";

//================================================================================================//
//========================================= SERVICES =============================================//
//================================================================================================//

//TOUS LES SERVICES PAR LANGUE
export const ALL_SERVICES_QUERY = `*[_type == "service" && language == $language]|order(date asc){ _id, titre, description, slug, imagePrincipale }`;
export const getAllServices = async (locale: LocaleType) => {
  return await client.fetch<Service[]>(ALL_SERVICES_QUERY, {
    language: locale,
  });
};
//SERVICE PAR SLUG
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

//SERVICES,ARTICLES ET SECTEURS ASSOCIES
export const ASSOCIATED_TO_SERVICE_QUERY = `
{
  "articles": *[
    _type == "article" &&
    language == $language &&
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
    language == $language &&
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
    language == $language &&
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
  language: LocaleType,
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
    language,
    tagIds,
    currentId,
  });
};

//SERVICES POUR TAG DONNE
export const TAG_RELATED_SERVICES_QUERY = `*[_type == "service" && language == $language && $slug in tagsEntrants[]->slug.current
]`;
export const getTagRelatedServices = async (
  locale: LocaleType,
  slug: string
): Promise<Service[]> => {
  return await client.fetch<Service[]>(TAG_RELATED_SERVICES_QUERY, {
    language: locale,
    slug,
  });
};

//================================================================================================//
//================================================================================================//
//================================================================================================//

//================================================================================================//
//========================================= ARTICLES =============================================//
//================================================================================================//
export const LAST_ARTICLES_QUERY = `*[_type == "article" && language == $language]|order(date desc)[0...10]{ 
  _id, titre, description, subSlug, imagePrincipale, 
  categorie->{
    _id,
    titre,
    slug }
  }`;
export const getLastArticles = async (locale: LocaleType) => {
  return await client.fetch<
    (Article & {
      categorie: ArticleCategory;
    })[]
  >(LAST_ARTICLES_QUERY, {
    language: locale,
  });
};

export const CATEGORIE_QUERY = `*[_type == "articleCategory" && slug.current == $slug][0]{
  _id,
  titre,
  baliseTitle,
  baliseDescription,
  imagePrincipale,
  slug}`;

export const getCategorie = async (slug: string) => {
  return await client.fetch<ArticleCategory>(CATEGORIE_QUERY, {
    slug,
  });
};

export const ALL_CATEGORIES_QUERY = `*[_type == "articleCategory" && language == $language]`;
export const getAllCategories = async (locale: LocaleType) => {
  return await client.fetch<ArticleCategory[]>(ALL_CATEGORIES_QUERY, {
    language: locale,
  });
};

export const ARTICLES_OF_CATEGORIE_QUERY = `*[_type == "article" && language == $language && references(*[_type == "articleCategory" && slug.current == $slug]._id)]|order(date desc){ 
  _id, 
  titre, 
  description, 
  subSlug, 
  imagePrincipale 
}`;
export const getArticlesOfCategorie = async (
  locale: LocaleType,
  slug: string
): Promise<Article[]> => {
  return await client.fetch<Article[]>(ARTICLES_OF_CATEGORIE_QUERY, {
    language: locale,
    slug,
  });
};

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

export const ASSOCIATED_TO_ARTICLE_QUERY = `
{
  "articles": *[
    _type == "article" &&
    _id != $currentId &&
    language == $language &&
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
    language == $language &&
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
    language == $language &&
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
  language: LocaleType,
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
    language,
    tagIds,
    currentId,
  });
};

export const TAG_RELATED_ARTICLES_QUERY = `*[_type == "article" && language == $language && $slug in tagsEntrants[]->slug.current
]{..., 
categorie->{
      _id,
      titre,
      slug
    }
}`;

export const getTagRelatedArticles = async (
  locale: LocaleType,
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

//================================================================================================//
//========================================= SECTEURS =============================================//
//================================================================================================//
export const ALL_SECTEURS_QUERY = `*[_type == "secteur" && language == $language]|order(date asc){ _id, titre, description, slug, imagePrincipale }`;
export const getAllSecteurs = async (locale: LocaleType) => {
  return await client.fetch<Secteur[]>(ALL_SECTEURS_QUERY, {
    language: locale,
  });
};
//SECTEUR PAR SLUG
export const SECTEUR_QUERY = `*[_type == "secteur" && slug.current == $slug][0]{
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
export const getSecteur = async (slug: string) => {
  return await client.fetch<
    Secteur & {
      tagsEntrants: { _id: string; nom: string; slug: Slug }[];
      tagsSortants: { _id: string; nom: string; slug: Slug }[];
    }
  >(SECTEUR_QUERY, {
    slug,
  });
};

export const ASSOCIATED_TO_SECTEUR_QUERY = `
{
  "articles": *[
    _type == "article" &&
    language == $language &&
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
    language == $language &&
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
     _id != $currentId &&
    language == $language &&
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
export const getAssociatedToSecteur = async (
  language: LocaleType,
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
  return await client.fetch(ASSOCIATED_TO_SECTEUR_QUERY, {
    language,
    tagIds,
    currentId,
  });
};

//SECTETURS POUR TAG DONNE
export const TAG_RELATED_SECTEURS_QUERY = `*[_type == "secteur" && language == $language && $slug in tagsEntrants[]->slug.current
]`;

export const getTagRelatedSecteurs = async (
  locale: LocaleType,
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

//SITEMAP
export const fetchServiceSlugs = async (locale?: LocaleType) => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "service" && language == "en"]{slug{current}}`
      : `*[_type == "service" && language == "fr"]{slug{current}}`;
  const services = await client.fetch<Service[]>(query);
  return services.map((service) => service.slug?.current).filter(Boolean);
};

export const fetchArticleCategories = async (locale?: LocaleType) => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "articleCategory" && language == "en"]{slug{current}}`
      : `*[_type == "articleCategory" && language == "fr"]{slug{current}}`;
  const categories = await client.fetch<ArticleCategory[]>(query);
  return categories.map((categorie) => categorie.slug?.current).filter(Boolean);
};

export const fetchArticleSlugs = async (locale?: LocaleType) => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "article" && language == "en]{
    subSlug { current },
    categorie-> {
      slug { current }
    }
  }`
      : `*[_type == "article" && language == "fr"]{
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
export const fetchTagsSlugs = async (locale?: LocaleType) => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "tag" && (language == "en")]{slug{current}}`
      : `*[_type == "tag" && (language == "fr" || language == null)]{slug{current}}`;
  const tags = await client.fetch<Tag[]>(query);
  return tags.map((tag) => tag.slug?.current).filter(Boolean);
};

export const fetchSecteursSlugs = async (locale?: LocaleType) => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "secteur" && (language == "en")]{slug{current}}`
      : `*[_type == "secteur" && (language == "fr" || language == null)]{slug{current}}`;
  const secteurs = await client.fetch<Secteur[]>(query);
  return secteurs.map((secteur) => secteur.slug?.current).filter(Boolean);
};
