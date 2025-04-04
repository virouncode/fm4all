import { Article, ArticleCategory, Service } from "../../sanity.types";
import { client } from "./lib/client";

export const SERVICES_QUERY = `*[_type == "service" && language == $language]|order(date asc){ _id, titre, description, slug, imagePrincipale }`;

export const SERVICE_QUERY = `*[_type == "service" && slug.current == $slug][0]{
...,
servicesAssocies[]->{
    _id,
    titre,
    description,
    slug,
    imagePrincipale
  },
sousServicesAssocies[]->{
    _id,
    titre,
    description,
    slug,
    imagePrincipale
  },
 secteursAssocies[]->{
    _id,
    titre,
    description,
    slug,
    imagePrincipale
    },
  }`;

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
    servicesAssocies[]->{
        _id,
        titre,
        description,
        slug,
        imagePrincipale
      },
    sousServicesAssocies[]->{
        _id,
        titre,
        description,
        slug,
        subSlug,
        imagePrincipale
      },
     secteursAssocies[]->{
        _id,
        titre,
        description,
        slug,
        imagePrincipale
      },
      articlesAssocies[]->{
        _id,
        titre,
        description,
        slug,
        subSlug,
        imagePrincipale
      },
}`;

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
