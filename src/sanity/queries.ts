import { Article, ArticleCategory, Secteur, Service } from "../../sanity.types";
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
    nom
  },
  tagsSortants[]->{
    _id,
    nom
  }
}`;
export const getService = async (slug: string) => {
  return await client.fetch<
    Service & {
      tagsEntrants: { _id: string; nom: string }[];
      tagsSortants: { _id: string; nom: string }[];
    }
  >(SERVICE_QUERY, {
    slug,
  });
};

export const ASSOCIATED_QUERY = `
{
  "articles": *[
    _type == "article" &&
    count(tagsEntrants[_ref in $tagIds]) > 0
  ] | order(date desc){
    ...,
    tagsEntrants[]->{
      _id,
      nom
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
      nom
    }
  },
  "secteurs": *[
    _type == "secteur" &&
    count(tagsEntrants[_ref in $tagIds]) > 0
  ] | order(date desc){
    ...,
    tagsEntrants[]->{
      _id,
      nom
    }
  }
}`;
export const getAssociated = async (
  tagIds: string[],
  currentId: string
): Promise<{
  articles: (Article & {
    tagsEntrants: { _id: string; nom: string }[];
    categorie: ArticleCategory;
  })[];
  services: (Service & {
    tagsEntrants: { _id: string; nom: string }[];
  })[];
  secteurs: (Secteur & {
    tagsEntrants: { _id: string; nom: string }[];
  })[];
}> => {
  return await client.fetch(ASSOCIATED_QUERY, {
    tagIds,
    currentId,
  });
};

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
}`;
export const ARTICLES_ASSOCIES_QUERY = `*[_type == "article" && count(tagsEntrants[]._ref[ @ in $tags ]) > 0] | order(date desc)`;

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
