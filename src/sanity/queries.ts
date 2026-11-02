import { LocaleType } from "@/i18n/routing";
import {
  Article,
  ArticleCategory,
  internalGroqTypeReferenceTo,
  SanityImageCrop,
  SanityImageHotspot,
  Secteur,
  Service,
  ServiceVille,
  Slug,
  Tag,
} from "../../sanity.types";
import { client } from "./lib/client";

//================================================================================================//
//========================================= SERVICES =============================================//
//================================================================================================//

//TOUS LES SERVICES PAR LANGUE
export const ALL_SERVICES_QUERY = `*[_type == "service" && language == $language]|order(date asc){ _id, titre, description, slug, linkText, titreCard, imagePrincipale }`;
export const getAllServices = async (
  locale: LocaleType,
): Promise<Service[]> => {
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
export const getService = async (
  slug: string,
): Promise<
  | (Service & {
      tagsEntrants: { _id: string; nom: string; slug: Slug }[];
      tagsSortants: { _id: string; nom: string; slug: Slug }[];
    })
  | null
> => {
  return await client.fetch<
    | (Service & {
        tagsEntrants: { _id: string; nom: string; slug: Slug }[];
        tagsSortants: { _id: string; nom: string; slug: Slug }[];
      })
    | null
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
  currentId: string,
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
} | null> => {
  return await client.fetch<{
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
  } | null>(ASSOCIATED_TO_SERVICE_QUERY, {
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
  slug: string,
): Promise<Service[]> => {
  return await client.fetch<Service[]>(TAG_RELATED_SERVICES_QUERY, {
    language: locale,
    slug,
  });
};

//ServiceVille pour ville et service donnés
export const SERVICE_VILLE_QUERY = `*[_type == "serviceVille" && subSlug.current == $subSlug && language == $language && references(*[_type == "service" && slug.current == $slug]._id)][0]{..., service->{
    _id,
    titreCard,
    }
  }`;

export const getServiceVille = async (
  slug: string,
  subSlug: string,
  locale: LocaleType,
): Promise<
  | (ServiceVille & {
      service: Service;
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
    })
  | null
> => {
  return await client.fetch<
    | (ServiceVille & {
        service: Service;
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
      })
    | null
  >(SERVICE_VILLE_QUERY, {
    language: locale,
    slug,
    subSlug,
  });
};

//Tous les services villes :
export const SERVICES_VILLES_QUERY = `*[_type == "serviceVille" && language == $language]{_id, titreCard, subSlug, service->{
    _id,slug, titreCard}}`;

export const getServicesVilles = async (
  locale: LocaleType,
): Promise<
  Record<
    string,
    {
      _id: string;
      service: {
        _id: string;
        slug: {
          _type: "slug";
          current: string;
        };
        titreCard: string;
      };
      subSlug: {
        _type: "slug";
        current: string;
      };
      titreCard: string;
    }[]
  >
> => {
  const response = await client.fetch<
    {
      _id: string;
      service: {
        _id: string;
        slug: { _type: "slug"; current: string };
        titreCard: string;
      };
      subSlug: { _type: "slug"; current: string };
      titreCard: string;
    }[]
  >(SERVICES_VILLES_QUERY, {
    language: locale,
  });
  return groupVillesByService(response);
};

function groupVillesByService(
  data: {
    _id: string;
    service: {
      _id: string;
      slug: { _type: "slug"; current: string };
      titreCard: string;
    };
    subSlug: { _type: "slug"; current: string };
    titreCard: string;
  }[],
) {
  return data.reduce(
    (acc, item) => {
      const nomService = item.service.titreCard;

      if (!acc[nomService]) {
        acc[nomService] = [];
      }

      acc[nomService].push(item);

      return acc;
    },
    {} as Record<string, typeof data>,
  );
}

//================================================================================================//
//================================================================================================//
//================================================================================================//

//================================================================================================//
//========================================= ARTICLES =============================================//
//================================================================================================//
export const LAST_ARTICLES_QUERY = `*[_type == "article" && language == $language]|order(date desc)[0...10]{ 
  _id, titre, description, subSlug, imagePrincipale, linkText,
  categorie->{
    _id,
    titre,
    slug }
  }`;
export const getLastArticles = async (
  locale: LocaleType,
): Promise<
  (Article & {
    categorie: ArticleCategory;
  })[]
> => {
  return await client.fetch<
    (Article & {
      categorie: ArticleCategory;
    })[]
  >(LAST_ARTICLES_QUERY, {
    language: locale,
  });
};

// Les catégories ne sont pas dans le plugin d'internationalisation : leur
// jumelle se déduit de la catégorie d'un article jumelé (translation.metadata).
const CATEGORIE_JUMELLE_PROJECTION = `*[_type == "translation.metadata" && references(*[_type == "article" && references(^.^._id)]._id)][0]
    .translations[_key == $autreLocale][0].value->categorie->{ "locale": language, "slug": slug.current }`;

export const CATEGORIE_QUERY = `*[_type == "articleCategory" && slug.current == $slug && language == $locale][0]{
  _id,
  titre,
  baliseTitle,
  baliseDescription,
  imagePrincipale,
  slug,
  "jumelle": ${CATEGORIE_JUMELLE_PROJECTION}
}`;

export type CategorieJumelleType = {
  locale: string | null;
  slug: string | null;
};

/** La catégorie dans SA langue : un slug anglais sous /fr ne rend plus rien. */
export const getCategorie = async (
  slug: string,
  locale: LocaleType,
): Promise<(ArticleCategory & { jumelle: CategorieJumelleType | null }) | null> => {
  return await client.fetch<
    (ArticleCategory & { jumelle: CategorieJumelleType | null }) | null
  >(CATEGORIE_QUERY, {
    slug,
    locale,
    autreLocale: locale === "fr" ? "en" : "fr",
  });
};

/**
 * Pour un slug de catégorie écrit dans N'IMPORTE quelle langue, le slug de la
 * catégorie jumelle dans `locale` — de quoi rediriger un lien ancien ou mal
 * traduit au lieu de servir l'autre langue.
 */
export const findCategorieJumelle = async (
  slug: string,
  locale: LocaleType,
): Promise<string | null> => {
  const result = await client.fetch<{ cible: string | null } | null>(
    `*[_type == "articleCategory" && slug.current == $slug && language != $locale][0]{
      "cible": *[_type == "translation.metadata" && references(*[_type == "article" && references(^.^._id)]._id)][0]
        .translations[_key == $locale][0].value->categorie->slug.current
    }`,
    { slug, locale },
  );
  return result?.cible ?? null;
};

export const ALL_CATEGORIES_QUERY = `*[_type == "articleCategory" && language == $language]`;
export const getAllCategories = async (
  locale: LocaleType,
): Promise<ArticleCategory[]> => {
  return await client.fetch<ArticleCategory[]>(ALL_CATEGORIES_QUERY, {
    language: locale,
  });
};

export const ARTICLES_OF_CATEGORIE_QUERY = `*[_type == "article" && language == $language && references(*[_type == "articleCategory" && slug.current == $slug]._id)]|order(date desc){ 
  _id, 
  titre, 
  description, 
  subSlug, 
  linkText,
  imagePrincipale 
}`;
export const getArticlesOfCategorie = async (
  locale: LocaleType,
  slug: string,
): Promise<Article[]> => {
  return await client.fetch<Article[]>(ARTICLES_OF_CATEGORIE_QUERY, {
    language: locale,
    slug,
  });
};

// Les jumelles d'un article (plugin document-internationalization) : ce que le
// bouton de langue et les hreflang consomment, à la place de la table manuelle.
const ARTICLE_JUMELLES_PROJECTION = `*[_type == "translation.metadata" && references(^._id)][0]
    .translations[]{ "locale": _key, "subSlug": value->subSlug.current, "slug": value->categorie->slug.current }`;

export type ArticleJumelleType = {
  locale: string | null;
  slug: string | null;
  subSlug: string | null;
};

// `language == $locale` : un slug anglais demandé sous /fr ne rend plus le
// document anglais habillé en français (bug « Fire Safety », 2026-11-02).
export const ARTICLE_QUERY = `*[_type == "article" && subSlug.current == $subSlug && language == $locale][0]{
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
  "jumelles": ${ARTICLE_JUMELLES_PROJECTION}
}`;

/**
 * Pour un sous-slug écrit dans N'IMPORTE quelle langue, les slugs de l'article
 * jumeau dans `locale` — de quoi rediriger un lien ancien ou mal traduit.
 */
export const findArticleJumelle = async (
  subSlug: string,
  locale: LocaleType,
): Promise<{ slug: string; subSlug: string } | null> => {
  const result = await client.fetch<{
    cible: { slug: string | null; subSlug: string | null } | null;
  } | null>(
    `*[_type == "article" && subSlug.current == $subSlug && language != $locale][0]{
      "cible": *[_type == "translation.metadata" && references(^._id)][0]
        .translations[_key == $locale][0]{ "subSlug": value->subSlug.current, "slug": value->categorie->slug.current }
    }`,
    { subSlug, locale },
  );
  const cible = result?.cible;
  return cible?.slug && cible?.subSlug
    ? { slug: cible.slug, subSlug: cible.subSlug }
    : null;
};

export const getArticle = async (
  subSlug: string,
  locale: LocaleType,
): Promise<
  | (Article & {
      jumelles: ArticleJumelleType[] | null;
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
    })
  | null
> => {
  return await client.fetch<
    | (Article & {
        jumelles: ArticleJumelleType[] | null;
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
      })
    | null
  >(ARTICLE_QUERY, {
    subSlug,
    locale,
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
  currentId: string,
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
} | null> => {
  return await client.fetch<{
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
  } | null>(ASSOCIATED_TO_ARTICLE_QUERY, {
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
  slug: string,
): Promise<(Article & { categorie: ArticleCategory })[]> => {
  return await client.fetch<(Article & { categorie: ArticleCategory })[]>(
    TAG_RELATED_ARTICLES_QUERY,
    {
      language: locale,
      slug,
    },
  );
};

//================================================================================================//
//========================================= SECTEURS =============================================//
//================================================================================================//
export const ALL_SECTEURS_QUERY = `*[_type == "secteur" && language == $language]|order(date asc){ _id, titre, description, slug, imagePrincipale, linkText }`;
export const getAllSecteurs = async (
  locale: LocaleType,
): Promise<Secteur[]> => {
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
export const getSecteur = async (
  slug: string,
): Promise<
  | (Secteur & {
      tagsEntrants: { _id: string; nom: string; slug: Slug }[];
      tagsSortants: { _id: string; nom: string; slug: Slug }[];
    })
  | null
> => {
  return await client.fetch<
    | (Secteur & {
        tagsEntrants: { _id: string; nom: string; slug: Slug }[];
        tagsSortants: { _id: string; nom: string; slug: Slug }[];
      })
    | null
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
  currentId: string,
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
} | null> => {
  return await client.fetch<{
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
  } | null>(ASSOCIATED_TO_SECTEUR_QUERY, {
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
  slug: string,
): Promise<Secteur[]> => {
  return await client.fetch<Secteur[]>(TAG_RELATED_SECTEURS_QUERY, {
    language: locale,
    slug,
  });
};

export const TAG_NOMS_QUERY = `*[_type == "tag" && slug.current == $slug][0]{
nom}`;

export const getTagNom = async (
  slug: string,
): Promise<{ nom: string } | null> => {
  return await client.fetch<{ nom: string } | null>(TAG_NOMS_QUERY, {
    slug,
  });
};

//SITEMAP
export const fetchServiceSlugs = async (
  locale?: LocaleType,
): Promise<(string | undefined)[]> => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "service" && language == "en"]{slug{current}}`
      : `*[_type == "service" && language == "fr"]{slug{current}}`;
  const services = await client.fetch<Service[]>(query);
  return services.map((service) => service.slug?.current).filter(Boolean);
};

export const fetchServiceVilleSlugs = async (
  locale?: LocaleType,
): Promise<
  {
    slug: string;
    subSlug: string;
  }[]
> => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "serviceVille" && language == "en"]{
      subSlug{current},
      service->{
        slug{current}
      }
    }`
      : `*[_type == "serviceVille" && language == "fr"]{
      subSlug{current},
      service->{
        slug{current}
      }
    }`;
  const serviceVilles =
    await client.fetch<(ServiceVille & { service: Service })[]>(query);
  return serviceVilles.map((serviceVille) => {
    const service = serviceVille.service as Service;
    return {
      slug: service?.slug?.current ?? "",
      subSlug: serviceVille.subSlug?.current ?? "",
    };
  });
};

export const fetchArticleCategories = async (
  locale?: LocaleType,
): Promise<(string | undefined)[]> => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "articleCategory" && language == "en"]{slug{current}}`
      : `*[_type == "articleCategory" && language == "fr"]{slug{current}}`;
  const categories = await client.fetch<ArticleCategory[]>(query);
  return categories.map((categorie) => categorie.slug?.current).filter(Boolean);
};

export const fetchArticleSlugs = async (
  locale?: LocaleType,
): Promise<
  {
    slug: string;
    subSlug: string;
  }[]
> => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "article" && language == "en"]{
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
export const fetchTagsSlugs = async (
  locale?: LocaleType,
): Promise<(string | undefined)[]> => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "tag" && (language == "en")]{slug{current}}`
      : `*[_type == "tag" && (language == "fr" || language == null)]{slug{current}}`;
  const tags = await client.fetch<Tag[]>(query);
  return tags.map((tag) => tag.slug?.current).filter(Boolean);
};

export const fetchSecteursSlugs = async (
  locale?: LocaleType,
): Promise<(string | undefined)[]> => {
  const query =
    locale && locale !== "fr"
      ? `*[_type == "secteur" && (language == "en")]{slug{current}}`
      : `*[_type == "secteur" && (language == "fr" || language == null)]{slug{current}}`;
  const secteurs = await client.fetch<Secteur[]>(query);
  return secteurs.map((secteur) => secteur.slug?.current).filter(Boolean);
};
